import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';

// Helper function to get valid, non-expired tokens for a creator
async function getValidTokens(supabase: any, creatorId: string) {
  const { data: tokens, error } = await supabase
    .from('creator_google_tokens')
    .select('*')
    .eq('creator_id', creatorId)
    .maybeSingle();

  if (error || !tokens) return null;

  const now = new Date();
  const expiresAt = new Date(tokens.expires_at);

  // If token is still valid (not expiring in the next 30 seconds), return it
  if (expiresAt.getTime() - now.getTime() > 30 * 1000) {
    return tokens;
  }

  // Token is expired or close to it, refresh it!
  const isMock = tokens.access_token.startsWith('mock_') || !process.env.GOOGLE_CLIENT_ID;

  try {
    let newAccessToken = '';
    let expiresIn = 3600;

    if (isMock) {
      newAccessToken = 'mock_access_token_refreshed_' + Math.random().toString(36).substring(7);
    } else {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          refresh_token: tokens.refresh_token,
          grant_type: 'refresh_token'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google token refresh failed: ${errorText}`);
      }

      const data = await response.json();
      newAccessToken = data.access_token;
      expiresIn = data.expires_in || 3600;
    }

    const newExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    const { error: updateError } = await supabase
      .from('creator_google_tokens')
      .update({
        access_token: newAccessToken,
        expires_at: newExpiresAt,
        updated_at: new Date().toISOString()
      })
      .eq('creator_id', creatorId);

    if (updateError) throw updateError;

    return {
      ...tokens,
      access_token: newAccessToken,
      expires_at: newExpiresAt
    };
  } catch (err) {
    console.error('Failed to refresh Google access token:', err);
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const creatorId = searchParams.get('creatorId');

  let supabase = await createClient();
  const devUserId = request.headers.get('x-dev-user-id');
  if (process.env.NODE_ENV === 'development' && devUserId) {
    try {
      supabase = createAdminClient();
    } catch (e) {
      console.warn('Could not create admin client for testing:', e);
    }
  }

  try {
    let query = supabase.from('calendar_events').select('*');

    if (creatorId) {
      query = query.eq('creator_id', creatorId);
    } else if (userId) {
      // Fetch creator IDs user is actively subscribed to
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('creator_id')
        .eq('subscriber_id', userId)
        .eq('is_active', true);

      const creatorIds = subs?.map(s => s.creator_id) || [];
      if (creatorIds.length > 0) {
        query = query.in('creator_id', creatorIds);
      } else {
        return NextResponse.json({ connected: true, events: [] });
      }
    }

    const { data: events, error } = await query.order('start_time', { ascending: true });
    if (error) throw error;

    return NextResponse.json({
      connected: true,
      calendarName: 'Session Calendar',
      events: events || []
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const devUserId = request.headers.get('x-dev-user-id');
  let supabase = await createClient();
  if (process.env.NODE_ENV === 'development' && devUserId) {
    try {
      supabase = createAdminClient();
    } catch (e) {
      console.warn('Could not create admin client for testing:', e);
    }
  }

  try {
    const { userId, action, creatorId, title, description, startTime, endTime, type, eventId } = await request.json();
    
    // Auth Check
    let user;
    if (process.env.NODE_ENV === 'development' && devUserId) {
      user = { id: devUserId };
    } else {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      user = authUser;
    }

    const activeCreatorId = creatorId || userId || user.id;

    if (action === 'create') {
      if (!activeCreatorId || !title || !startTime || !endTime) {
        return NextResponse.json({ error: 'Missing required fields for event creation' }, { status: 400 });
      }

      // Check Google Calendar connection
      let googleEventId = null;
      const tokens = await getValidTokens(supabase, activeCreatorId);

      if (tokens) {
        const isMock = tokens.access_token.startsWith('mock_');
        
        try {
          if (isMock) {
            googleEventId = 'mock_google_event_' + Math.random().toString(36).substring(7);
          } else {
            // Live insert into Google Calendar
            const gcalResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${tokens.access_token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                summary: `${type ? `[${type.toUpperCase()}] ` : ''}${title}`,
                description: description || 'Session platform sync scheduled session',
                start: { dateTime: startTime },
                end: { dateTime: endTime }
              })
            });

            if (gcalResponse.ok) {
              const gcalData = await gcalResponse.json();
              googleEventId = gcalData.id;
            } else {
              const errTxt = await gcalResponse.text();
              console.warn('Google Calendar event insertion failed, proceeding locally:', errTxt);
            }
          }
        } catch (gcalErr) {
          console.error('Error syncing event to Google Calendar:', gcalErr);
        }
      }

      // Insert into local DB
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          creator_id: activeCreatorId,
          title,
          description,
          start_time: startTime,
          end_time: endTime,
          type: type || 'public',
          google_event_id: googleEventId
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ success: true, event: data });
    }

    if (action === 'delete') {
      if (!eventId) {
        return NextResponse.json({ error: 'Missing eventId for deletion' }, { status: 400 });
      }

      // Fetch the event to make sure user owns it
      const { data: event, error: fetchError } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (fetchError || !event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      // Ensure user owns this event
      if (event.creator_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // If mapped to a Google event, attempt deletion
      if (event.google_event_id) {
        const tokens = await getValidTokens(supabase, user.id);
        if (tokens) {
          const isMock = tokens.access_token.startsWith('mock_');
          
          try {
            if (!isMock) {
              await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${event.google_event_id}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${tokens.access_token}`
                }
              });
            }
          } catch (gcalErr) {
            console.error('Failed to delete event from Google Calendar:', gcalErr);
          }
        }
      }

      // Delete from local DB
      const { error: deleteError } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId);

      if (deleteError) throw deleteError;

      return NextResponse.json({ success: true });
    }

    if (action === 'sync') {
      const tokens = await getValidTokens(supabase, activeCreatorId);
      if (!tokens) {
        return NextResponse.json({ error: 'Google Calendar not connected' }, { status: 400 });
      }

      const isMock = tokens.access_token.startsWith('mock_') || !process.env.GOOGLE_CLIENT_ID;
      let googleEvents: any[] = [];

      try {
        if (isMock) {
          googleEvents = [
            {
              id: 'mock_gcal_event_1',
              summary: '[PUBLIC] Coffee Date Sync',
              description: 'Simulated synced coffee date event',
              start: { dateTime: new Date(Date.now() + 3600 * 1000 * 24).toISOString() },
              end: { dateTime: new Date(Date.now() + 3600 * 1000 * 25).toISOString() }
            },
            {
              id: 'mock_gcal_event_2',
              summary: '[VIP] Exclusive Meetup',
              description: 'Simulated synced VIP meeting',
              start: { dateTime: new Date(Date.now() + 3600 * 1000 * 48).toISOString() },
              end: { dateTime: new Date(Date.now() + 3600 * 1000 * 49).toISOString() }
            }
          ];
        } else {
          const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
          });

          if (!response.ok) {
            const errTxt = await response.text();
            throw new Error(`Google Calendar events fetch failed: ${errTxt}`);
          }

          const data = await response.json();
          googleEvents = data.items || [];
        }
      } catch (gcalErr: any) {
        console.error('Error fetching Google Calendar events:', gcalErr);
        return NextResponse.json({ error: `Google Calendar sync error: ${gcalErr.message}` }, { status: 502 });
      }

      const syncedEvents = [];
      for (const gevent of googleEvents) {
        const title = gevent.summary || 'Google Synced Event';
        const start = gevent.start?.dateTime || gevent.start?.date;
        const end = gevent.end?.dateTime || gevent.end?.date;
        
        if (!start || !end) continue;

        let type = 'public';
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('[vip]')) {
          type = 'vip';
        } else if (lowerTitle.includes('[master]')) {
          type = 'master';
        }

        const { data: existingEvent } = await supabase
          .from('calendar_events')
          .select('id')
          .eq('creator_id', activeCreatorId)
          .eq('google_event_id', gevent.id)
          .maybeSingle();

        let result;
        if (existingEvent) {
          const { data: updated, error: updateErr } = await supabase
            .from('calendar_events')
            .update({
              title: title.replace(/^\[(PUBLIC|VIP|MASTER)\]\s*/i, ''),
              description: gevent.description || '',
              start_time: new Date(start).toISOString(),
              end_time: new Date(end).toISOString(),
              type
            })
            .eq('id', existingEvent.id)
            .select()
            .single();
          
          if (!updateErr && updated) result = updated;
        } else {
          const { data: inserted, error: insertErr } = await supabase
            .from('calendar_events')
            .insert({
              creator_id: activeCreatorId,
              title: title.replace(/^\[(PUBLIC|VIP|MASTER)\]\s*/i, ''),
              description: gevent.description || '',
              start_time: new Date(start).toISOString(),
              end_time: new Date(end).toISOString(),
              type,
              google_event_id: gevent.id
            })
            .select()
            .single();
          
          if (!insertErr && inserted) result = inserted;
        }

        if (result) syncedEvents.push(result);
      }

      // Clean up deleted events
      const { data: localEvents } = await supabase
        .from('calendar_events')
        .select('id, google_event_id')
        .eq('creator_id', activeCreatorId)
        .not('google_event_id', 'is', null);

      if (localEvents && localEvents.length > 0) {
        const googleEventIds = new Set(googleEvents.map(ge => ge.id));
        const idsToDelete = localEvents
          .filter(le => le.google_event_id && !googleEventIds.has(le.google_event_id))
          .map(le => le.id);
        
        if (idsToDelete.length > 0) {
          const { error: cleanupErr } = await supabase
            .from('calendar_events')
            .delete()
            .in('id', idsToDelete);
          
          if (cleanupErr) {
            console.error('Failed to clean up deleted events:', cleanupErr);
          }
        }
      }

      return NextResponse.json({ success: true, syncedCount: syncedEvents.length, events: syncedEvents });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Calendar route error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
