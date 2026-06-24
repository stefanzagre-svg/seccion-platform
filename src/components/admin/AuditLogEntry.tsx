'use client';

import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  UserCheck, 
  UserMinus, 
  Settings, 
  ShieldAlert, 
  FileText,
  Globe,
  Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_table: string | null;
  target_id: string | null;
  old_value: Record<string, any>;
  new_value: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  admin?: {
    username: string;
    platform_role: string;
  };
}

interface AuditLogEntryProps {
  log: AuditLog;
}

export default function AuditLogEntry({ log }: AuditLogEntryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getActionIcon = (action: string) => {
    if (action.includes('role')) return UserCheck;
    if (action.includes('suspend') || action.includes('ban')) return UserMinus;
    if (action.includes('setting')) return Settings;
    if (action.includes('moderation') || action.includes('queue')) return ShieldAlert;
    return FileText;
  };

  const getActionStyles = (action: string) => {
    if (action.includes('role')) return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    if (action.includes('suspend') || action.includes('ban')) return 'text-red-400 bg-red-500/10 border-red-500/20';
    if (action.includes('setting')) return 'text-primary bg-primary/10 border-primary/20';
    if (action.includes('moderation') || action.includes('queue')) return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    return 'text-white/60 bg-white/5 border-white/10';
  };

  const Icon = getActionIcon(log.action);
  const hasChanges = Object.keys(log.old_value || {}).length > 0 || Object.keys(log.new_value || {}).length > 0;

  return (
    <div className={cn(
      "border border-white/10 bg-black/25 rounded-2xl overflow-hidden transition-all duration-200",
      isExpanded ? "border-primary/25 bg-black/45 shadow-[inset_0_0_12px_rgba(102,252,241,0.02)]" : "hover:border-white/20 hover:bg-black/35"
    )}>
      {/* Summary Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-4 cursor-pointer select-none"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className={cn("p-2.5 rounded-xl border", getActionStyles(log.action))}>
            <Icon className="w-4 h-4" />
          </div>
          
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-white leading-tight">
                {log.admin?.username || 'System / Auto'}
              </span>
              <span className="text-[9px] text-white/40 font-semibold font-mono uppercase tracking-wider bg-white/5 border border-white/10 px-1 rounded">
                {log.admin?.platform_role || 'system'}
              </span>
            </div>
            
            <p className="text-xs text-white/70 mt-1 font-medium truncate">
              Performed <span className="font-mono text-primary font-bold">{log.action}</span> 
              {log.target_table && (
                <> on <span className="font-mono text-white/90">{log.target_table}</span></>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-white/40 font-mono">
              {new Date(log.created_at).toLocaleDateString()}
            </div>
            <div className="text-[9px] text-white/30 font-mono mt-0.5">
              {new Date(log.created_at).toLocaleTimeString()}
            </div>
          </div>
          
          <div className="text-white/40 hover:text-white transition-colors">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-white/5 bg-black/40 p-5 space-y-4 animate-fade-in">
          {/* Metadata & Context */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-[10px] uppercase font-bold tracking-wider text-white/55 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 p-2 rounded-xl">
              <Globe className="w-3.5 h-3.5 text-white/40" />
              <div>
                <div className="text-[8px] text-white/30 mb-0.5">IP Address</div>
                <div className="font-mono text-white/80">{log.ip_address || 'N/A'}</div>
              </div>
            </div>
            {log.target_id && (
              <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 p-2 rounded-xl">
                <FileText className="w-3.5 h-3.5 text-white/40" />
                <div>
                  <div className="text-[8px] text-white/30 mb-0.5">Target ID</div>
                  <div className="font-mono text-white/80 select-all truncate max-w-[150px]">{log.target_id}</div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 p-2 rounded-xl sm:col-span-2 md:col-span-1">
              <Monitor className="w-3.5 h-3.5 text-white/40" />
              <div className="min-w-0">
                <div className="text-[8px] text-white/30 mb-0.5">User Agent</div>
                <div className="font-mono text-white/80 truncate" title={log.user_agent || ''}>
                  {log.user_agent || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* JSON Diff Block */}
          {hasChanges && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-2 font-mono">
                  - Before State
                </div>
                <pre className="bg-red-950/20 border border-red-900/30 rounded-xl p-3.5 overflow-x-auto text-[10px] font-mono text-red-300 max-h-64 leading-relaxed">
                  {JSON.stringify(log.old_value, null, 2)}
                </pre>
              </div>
              
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-success mb-2 font-mono">
                  + After State
                </div>
                <pre className="bg-green-950/20 border border-green-900/30 rounded-xl p-3.5 overflow-x-auto text-[10px] font-mono text-success max-h-64 leading-relaxed">
                  {JSON.stringify(log.new_value, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Non-diff Logs (like simple queries/actions) */}
          {!hasChanges && (
            <div className="text-xs text-white/40 italic">
              No state modification was recorded for this action.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
