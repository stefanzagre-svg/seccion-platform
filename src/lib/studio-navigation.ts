import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Crown,
  LayoutGrid,
  ListOrdered,
  Settings,
  Shield,
  Users,
  Video,
  Zap,
} from 'lucide-react';

export type StudioTabId =
  | 'content'
  | 'live'
  | 'orders'
  | 'consent_inbox'
  | 'goals'
  | 'analytics'
  | 'settings'
  | 'safety_ops'
  | 'ai_tools';

export interface StudioTabConfig {
  id: StudioTabId;
  icon: LucideIcon;
  label: string;
}

const TAB_LABELS: Record<StudioTabId, { en: string; es: string; fr: string }> = {
  content: { en: 'Posts & Media', es: 'Posts y Media', fr: 'Posts & Médias' },
  live: { en: 'Livestreams', es: 'Directos', fr: 'Directs' },
  orders: { en: 'Custom Requests', es: 'Pedidos Custom', fr: 'Demandes Custom' },
  consent_inbox: { en: 'Co-Star Approvals', es: 'Co-Creadores', fr: 'Co-Créateurs' },
  goals: { en: 'Goals', es: 'Metas', fr: 'Objectifs' },
  analytics: { en: 'Analytics', es: 'Estadísticas', fr: 'Statistiques' },
  settings: { en: 'Settings', es: 'Ajustes', fr: 'Paramètres' },
  safety_ops: { en: 'Moderation Queue', es: 'Moderación', fr: 'Modération' },
  ai_tools: { en: 'AI Copilot', es: 'Copilot IA', fr: 'Copilote IA' },
};

const BASE_STUDIO_TABS: ReadonlyArray<{ id: StudioTabId; icon: LucideIcon; adminOnly?: boolean }> = [
  { id: 'content', icon: LayoutGrid },
  { id: 'live', icon: Video },
  { id: 'orders', icon: ListOrdered },
  { id: 'consent_inbox', icon: Users },
  { id: 'goals', icon: Crown },
  { id: 'analytics', icon: BarChart3 },
  { id: 'settings', icon: Settings },
  { id: 'safety_ops', icon: Shield, adminOnly: true },
  { id: 'ai_tools', icon: Zap },
];

/**
 * Returns localized, plain-language navigation tabs shared across Creator Studio and AI Tools.
 */
export function getStudioTabs(isModeratorOrAdmin: boolean, locale?: string): StudioTabConfig[] {
  const lang = locale === 'es' ? 'es' : locale === 'fr' ? 'fr' : 'en';
  return BASE_STUDIO_TABS.filter((tab) => !tab.adminOnly || isModeratorOrAdmin).map((tab) => ({
    id: tab.id,
    icon: tab.icon,
    label: TAB_LABELS[tab.id][lang],
  }));
}
