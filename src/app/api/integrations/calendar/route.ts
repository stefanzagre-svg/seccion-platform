import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

  const supabase = await createClient();

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
  const supabase = await createClient();

  try {
    const { userId, action, creatorId, title, description, startTime, endTime, type, eventId } = await request.json();
    
    // Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Calendar route error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
