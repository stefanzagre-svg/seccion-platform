import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Clock, 
  Plus, 
  Inbox, 
  ShieldCheck, 
  XCircle, 
  Tag, 
  Target, 
  CreditCard, 
  Check, 
  Lock, 
  DollarSign,
  Calendar,
  User,
  ShieldAlert,
  Paperclip,
  Image as ImageIcon,
  Video as VideoIcon,
  Music as MusicIcon,
  File as FileIcon,
  Download,
  Eye,
  ChevronRight,
  TrendingUp,
  Layers,
  ArrowRight,
  AlertCircle,
  LayoutList,
  BarChart3,
  BookOpen
} from 'lucide-react';
import CustomOrderRequestForm from './CustomOrderRequestForm';

export type OrderStatus = 'pending' | 'in_progress' | 'review' | 'completed' | 'declined';

export interface Order {
  id: string;
  clientName: string;
  title: string;
  budget: number;
  status: OrderStatus;
  deadline: string;
  category: string;
  primaryObjective: string;
  secondaryObjective?: string;
  paymentStatus: 'Authorized' | 'Held in Escrow' | 'Released' | 'Refunded' | 'Unpaid' | 'Awaiting Payment';
  teaserUrl?: string;
  proposedBy: 'member' | 'creator';
  isAcceptedByCreator: boolean;
  isAcceptedByMember: boolean;
  description?: string;
  coPerformers?: any[];
  attachments?: { name: string; size: string; type: string }[];
}

interface Template {
  id: string;
  name: string;
  basePrice: number;
  deliveryDays: number;
}

const MOCK_ORDERS: Order[] = [
  { 
    id: '1', 
    clientName: 'Jordan P.', 
    title: 'Custom workout video', 
    budget: 150, 
    status: 'in_progress', 
    deadline: '2023-11-15',
    category: 'VIP Custom Video',
    primaryObjective: 'Build strength and improve squat form.',
    secondaryObjective: 'Focus on correct warm-up routines.',
    paymentStatus: 'Held in Escrow',
    proposedBy: 'member',
    isAcceptedByCreator: true,
    isAcceptedByMember: true,
    description: 'A 15-minute video demonstrating squat form correction and daily mobility exercises.',
    coPerformers: [
      {
        name: 'Sofia V.',
        type: 'registered',
        userId: 'u2',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
        status: 'pending'
      }
    ],
    attachments: [
      { name: 'squat_warmup_guide.pdf', size: '240 KB', type: 'application/pdf' },
      { name: 'reference_stance.png', size: '1.8 MB', type: 'image/png' }
    ]
  },
  { 
    id: '2', 
    clientName: 'Alex R.', 
    title: 'Shoutout for friend', 
    budget: 50, 
    status: 'pending', 
    deadline: '2023-11-10',
    category: 'Personal Shoutout',
    primaryObjective: 'Wish my friend Happy 30th Birthday and mention inside jokes.',
    paymentStatus: 'Unpaid',
    proposedBy: 'member',
    isAcceptedByCreator: false,
    isAcceptedByMember: true,
    description: 'A short birthday shoutout for my friend who is a huge fan of yours.',
    attachments: []
  },
  { 
    id: '3', 
    clientName: 'Sam T.', 
    title: 'Photography tips critique', 
    budget: 75, 
    status: 'review', 
    deadline: '2023-11-12',
    category: 'Direct Message Q&A',
    primaryObjective: 'Review portfolio of sunset photos and edit colors.',
    secondaryObjective: 'Provide lighting correction advice.',
    paymentStatus: 'Held in Escrow',
    proposedBy: 'member',
    isAcceptedByCreator: true,
    isAcceptedByMember: true,
    description: 'Review my 5 recent sunset landscape photos and suggest post-processing edits.',
    attachments: [
      { name: 'sunset_landscape_critique.png', size: '3.4 MB', type: 'image/png' }
    ]
  },
  { 
    id: '4', 
    clientName: 'Taylor M.', 
    title: '1-on-1 diet plan', 
    budget: 200, 
    status: 'completed', 
    deadline: '2023-11-01',
    category: '1-on-1 Coaching',
    primaryObjective: 'Lose 5kg in 2 months with high-protein meal prep.',
    secondaryObjective: 'Vegetarian recipes preferred.',
    paymentStatus: 'Released',
    proposedBy: 'member',
    isAcceptedByCreator: true,
    isAcceptedByMember: true,
    description: 'Detailed meal prep guide for a 2-month fat loss cycle.',
    attachments: []
  },
];

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: any; color: string; border: string; bg: string; dot: string }> = {
  pending:    { label: 'New Request',   icon: Inbox,        color: 'text-cyan-400',    border: 'border-cyan-400/40',    bg: 'bg-cyan-400/8',    dot: 'bg-cyan-400' },
  in_progress:{ label: 'In Production',icon: Clock,        color: 'text-amber-400',   border: 'border-amber-400/40',   bg: 'bg-amber-400/8',   dot: 'bg-amber-400' },
  review:     { label: 'Pending Review',icon: ShieldCheck,  color: 'text-purple-400',  border: 'border-purple-400/40',  bg: 'bg-purple-400/8',  dot: 'bg-purple-400' },
  completed:  { label: 'Delivered',     icon: CheckCircle2, color: 'text-emerald-400', border: 'border-emerald-400/40', bg: 'bg-emerald-400/8', dot: 'bg-emerald-400' },
  declined:   { label: 'Declined',      icon: XCircle,      color: 'text-red-400',     border: 'border-red-400/40',     bg: 'bg-red-400/8',     dot: 'bg-red-400' },
};

const PAYMENT_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  'Released':         { color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
  'Held in Escrow':   { color: 'text-amber-400',   bg: 'bg-amber-500/15',   border: 'border-amber-500/30' },
  'Refunded':         { color: 'text-red-400',      bg: 'bg-red-500/15',     border: 'border-red-500/30' },
  'Awaiting Payment': { color: 'text-purple-400',   bg: 'bg-purple-500/15',  border: 'border-purple-500/30' },
  'Unpaid':           { color: 'text-white/50',     bg: 'bg-white/5',        border: 'border-white/10' },
  'Authorized':       { color: 'text-cyan-400',     bg: 'bg-cyan-500/15',    border: 'border-cyan-500/30' },
};

const MOCK_TEMPLATES: Template[] = [
  { id: 't1', name: 'Personalized Workout Routine', basePrice: 150, deliveryDays: 7 },
  { id: 't2', name: 'Private Q&A Session (Video)', basePrice: 100, deliveryDays: 3 },
  { id: 't3', name: 'Social Media Shoutout', basePrice: 50, deliveryDays: 2 },
];

type FilterStatus = 'all' | OrderStatus;
type PanelView = 'orders' | 'templates';

interface CreatorOrdersPanelProps {
  customRequestPermission?: 'anyone' | 'restricted';
}

export default function CreatorOrdersPanel({ customRequestPermission = 'anyone' }: CreatorOrdersPanelProps) {
  const [panelView, setPanelView] = useState<PanelView>('orders');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [templates, setTemplates] = useState<Template[]>(MOCK_TEMPLATES);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(orders[0]?.id ?? null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGeneratingTeaser, setIsGeneratingTeaser] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editingActor, setEditingActor] = useState<'creator' | 'member'>('creator');
  const [checkoutOrder, setCheckoutOrder] = useState<Order | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<{ name: string; size: string; type: string } | null>(null);

  // ── Stats ──────────────────────────────────────────────────
  const totalPipeline = orders.filter(o => o.status !== 'declined').reduce((s, o) => s + o.budget, 0);
  const inEscrow      = orders.filter(o => o.paymentStatus === 'Held in Escrow').reduce((s, o) => s + o.budget, 0);
  const totalEarned   = orders.filter(o => o.paymentStatus === 'Released').reduce((s, o) => s + o.budget, 0);
  const pendingCount  = orders.filter(o => o.status === 'pending').length;

  const selectedOrder = orders.find(o => o.id === selectedOrderId) ?? null;

  const filteredOrders = filterStatus === 'all'
    ? orders.filter(o => o.status !== 'declined')
    : orders.filter(o => o.status === filterStatus);

  // ── Handlers ───────────────────────────────────────────────
  const toast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      let payStatus = o.paymentStatus;
      if (newStatus === 'in_progress') payStatus = 'Held in Escrow';
      else if (newStatus === 'completed') payStatus = 'Released';
      else if (newStatus === 'declined') payStatus = 'Refunded';
      return { ...o, status: newStatus, paymentStatus: payStatus };
    }));

    if (newStatus === 'completed') {
      const target = orders.find(o => o.id === orderId);
      if (target && !target.teaserUrl) {
        setIsGeneratingTeaser(orderId);
        try {
          const res  = await fetch('/api/v2/creator/generate-teaser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderTitle: target.title, description: 'Delivered Custom Order' }),
          });
          const data = await res.json();
          if (data.teaserImageUrl) {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, teaserUrl: data.teaserImageUrl } : o));
          }
        } catch { /* silent */ } finally {
          setIsGeneratingTeaser(null);
        }
      }
    }
  };

  const handleAcceptTerms = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const willPay = o.isAcceptedByMember;
      return { ...o, isAcceptedByCreator: true, paymentStatus: willPay ? 'Awaiting Payment' : o.paymentStatus };
    }));
  };

  const handleAcceptTermsByMember = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const willPay = o.isAcceptedByCreator;
      return { ...o, isAcceptedByMember: true, paymentStatus: willPay ? 'Awaiting Payment' : o.paymentStatus };
    }));
  };

  const handleNewOrder = async (data: any) => {
    const newOrder: Order = {
      id: Date.now().toString(),
      clientName: data.isSimulateMatched ? 'Subscribed Member' : 'Regular Guest',
      title: data.title, budget: data.budget, status: 'pending',
      deadline: data.deadline, category: data.category,
      primaryObjective: data.primaryObjective, secondaryObjective: data.secondaryObjective || undefined,
      description: data.description, paymentStatus: 'Unpaid',
      proposedBy: 'member', isAcceptedByCreator: false, isAcceptedByMember: true,
      coPerformers: data.coPerformers || [], attachments: data.attachments || [],
    };
    setOrders(prev => [newOrder, ...prev]);
    setSelectedOrderId(newOrder.id);
  };

  const handleModifyOrder = async (data: any) => {
    if (!editingOrder) return;
    setOrders(prev => prev.map(o => {
      if (o.id !== editingOrder.id) return o;
      return {
        ...o, title: data.title, budget: data.budget, deadline: data.deadline,
        category: data.category, primaryObjective: data.primaryObjective,
        secondaryObjective: data.secondaryObjective || undefined, description: data.description,
        proposedBy: editingActor, isAcceptedByCreator: editingActor === 'creator',
        isAcceptedByMember: editingActor === 'member', paymentStatus: 'Unpaid',
        coPerformers: data.coPerformers || [], attachments: data.attachments || [],
      };
    }));
    setEditingOrder(null);
  };

  const handleCheckoutSuccess = () => {
    if (!checkoutOrder) return;
    setOrders(prev => prev.map(o => o.id !== checkoutOrder.id ? o : {
      ...o, status: 'in_progress', paymentStatus: 'Held in Escrow',
      isAcceptedByCreator: true, isAcceptedByMember: true,
    }));
    toast(`Payment of $${checkoutOrder.budget} secured in Escrow! Order is now in production.`);
    setCheckoutOrder(null);
  };

  // ── Sub-components ─────────────────────────────────────────
  const StatusPill = ({ status }: { status: OrderStatus }) => {
    const cfg = STATUS_CONFIG[status];
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </span>
    );
  };

  const PaymentBadge = ({ status }: { status: string }) => {
    const cfg = PAYMENT_CONFIG[status] ?? PAYMENT_CONFIG['Unpaid'];
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
        <DollarSign className="w-2.5 h-2.5" /> {status}
      </span>
    );
  };

  // ── Order List Item ────────────────────────────────────────
  const OrderListItem = ({ order }: { order: Order }) => {
    const cfg = STATUS_CONFIG[order.status];
    const isSelected = selectedOrderId === order.id;
    const hasPendingConsent = order.coPerformers?.some(p => p.status === 'pending');
    return (
      <motion.button
        layout
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        onClick={() => setSelectedOrderId(order.id)}
        className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden group ${
          isSelected
            ? `${cfg.border} ${cfg.bg} shadow-md`
            : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10'
        }`}
      >
        {/* Left status accent bar */}
        <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${cfg.dot} opacity-70`} />

        <div className="pl-3 space-y-2">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-bold text-[11px] text-white leading-tight truncate">{order.title}</p>
              <p className="text-[9px] text-white/40 font-bold mt-0.5 flex items-center gap-1">
                <User className="w-2.5 h-2.5" /> {order.clientName}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-black text-white">${order.budget}</p>
              <StatusPill status={order.status} />
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-widest text-primary rounded">
              <Tag className="w-2 h-2" /> {order.category}
            </span>
            <div className="flex items-center gap-2">
              {hasPendingConsent && (
                <span className="flex items-center gap-1 text-[8px] font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded">
                  <Lock className="w-2.5 h-2.5" /> Consent
                </span>
              )}
              <span className="text-[8px] text-white/30 font-bold flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5" /> {order.deadline}
              </span>
            </div>
          </div>
        </div>

        {isSelected && (
          <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
        )}
      </motion.button>
    );
  };

  // ── Order Detail Panel ─────────────────────────────────────
  const OrderDetail = ({ order }: { order: Order }) => {
    const cfg = STATUS_CONFIG[order.status];
    const hasPendingConsent = order.coPerformers?.some(p => p.status === 'pending');
    const payCfg = PAYMENT_CONFIG[order.paymentStatus] ?? PAYMENT_CONFIG['Unpaid'];

    return (
      <div className="space-y-4">
        {/* Detail header */}
        <div className={`p-5 rounded-2xl border ${cfg.border} ${cfg.bg}`}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <StatusPill status={order.status} />
                <PaymentBadge status={order.paymentStatus} />
              </div>
              <h3 className="text-base font-black text-white tracking-tight leading-snug mt-2">{order.title}</h3>
              <p className="text-[10px] text-white/40 font-bold flex items-center gap-1 mt-1">
                <User className="w-3 h-3" /> {order.clientName} · <Calendar className="w-3 h-3" /> Due {order.deadline}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-2xl font-black text-white">${order.budget}</p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-widest text-primary rounded mt-1">
                <Tag className="w-2 h-2" /> {order.category}
              </span>
            </div>
          </div>

          {/* Consent acceptance status */}
          {order.status === 'pending' && (
            <div className="flex items-center gap-2 p-2 bg-black/30 rounded-xl border border-white/5">
              <span className="text-[7px] font-black uppercase tracking-widest text-white/30">Proposal by:</span>
              <span className="text-[8px] font-black text-primary uppercase">{order.proposedBy === 'creator' ? 'You' : 'Member'}</span>
              <div className="flex gap-2 ml-auto">
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black border ${order.isAcceptedByCreator ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-white/30 border-white/10'}`}>
                  <Check className="w-2.5 h-2.5" /> Creator
                </span>
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black border ${order.isAcceptedByMember ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-white/30 border-white/10'}`}>
                  <Check className="w-2.5 h-2.5" /> Member
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {order.description && (
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-1">
            <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Brief Description</p>
            <p className="text-[11px] text-white/70 leading-relaxed font-medium">{order.description}</p>
          </div>
        )}

        {/* Objectives */}
        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
          <p className="text-[8px] font-black uppercase tracking-widest text-white/30 flex items-center gap-1.5">
            <Target className="w-3 h-3 text-cyan-400" /> Objectives
          </p>
          <div className="space-y-2">
            <div className="p-2.5 bg-cyan-400/5 border border-cyan-400/10 rounded-xl">
              <p className="text-[7px] font-black text-cyan-400/70 uppercase tracking-widest mb-1">Primary</p>
              <p className="text-[11px] text-white/80 font-semibold leading-snug">{order.primaryObjective}</p>
            </div>
            {order.secondaryObjective && (
              <div className="p-2.5 bg-purple-400/5 border border-purple-400/10 rounded-xl">
                <p className="text-[7px] font-black text-purple-400/70 uppercase tracking-widest mb-1">Secondary</p>
                <p className="text-[11px] text-white/70 font-semibold leading-snug">{order.secondaryObjective}</p>
              </div>
            )}
          </div>
        </div>

        {/* Attachments */}
        {order.attachments && order.attachments.length > 0 && (
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
            <p className="text-[8px] font-black uppercase tracking-widest text-white/30 flex items-center gap-1.5">
              <Paperclip className="w-3 h-3" /> Attached References ({order.attachments.length})
            </p>
            <div className="space-y-1.5">
              {order.attachments.map((file, i) => {
                let FileIconComp: any = FileIcon;
                if (file.type.startsWith('image/')) FileIconComp = ImageIcon;
                else if (file.type.startsWith('video/')) FileIconComp = VideoIcon;
                else if (file.type.startsWith('audio/')) FileIconComp = MusicIcon;
                return (
                  <button
                    key={i}
                    onClick={() => setPreviewFile(file)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl transition group/f text-left"
                  >
                    <FileIconComp className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="flex-1 truncate text-[10px] font-semibold text-white/80 group-hover/f:text-white transition">{file.name}</span>
                    <span className="text-[8px] text-white/30 shrink-0">{file.size}</span>
                    <Eye className="w-3 h-3 text-white/20 group-hover/f:text-primary transition shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Co-Performers */}
        {order.coPerformers && order.coPerformers.length > 0 && (
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
            <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Co-Performers & Consent</p>
            <div className="flex flex-wrap gap-2">
              {order.coPerformers.map((p: any, i: number) => (
                <div key={i} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl border text-[9px] font-black ${
                  p.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                }`}>
                  {p.avatar && <img src={p.avatar} className="w-4 h-4 rounded-full object-cover" />}
                  <span>{p.name}</span>
                  {p.status === 'pending' && p.type === 'registered' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOrders(prev => prev.map(o => {
                          if (o.id !== order.id) return o;
                          return { ...o, coPerformers: o.coPerformers?.map(item => item.name === p.name ? { ...item, status: 'approved' } : item) };
                        }));
                        toast(`${p.name} approved consent!`);
                      }}
                      className="ml-1 px-1.5 py-0.5 bg-accent/20 border border-accent/30 text-accent text-[7px] rounded hover:bg-accent/30 transition"
                    >
                      Simulate OK
                    </button>
                  )}
                </div>
              ))}
            </div>
            {hasPendingConsent && (
              <div className="flex items-start gap-2 p-3 bg-red-950/20 border border-red-500/20 text-red-400 rounded-xl">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[9px] font-black uppercase">Consent Hold Active</p>
                  <p className="text-[9px] text-red-300/80 mt-0.5">Release is blocked until all co-performers approve.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Teaser preview */}
        {order.teaserUrl && (
          <div className="rounded-2xl overflow-hidden border border-white/10 aspect-video relative">
            <img src={order.teaserUrl} alt="Teaser" className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="text-[9px] uppercase font-black tracking-widest px-3 py-1.5 bg-black/70 border border-white/20 rounded-full">AI-Generated Teaser</span>
            </div>
          </div>
        )}

        {/* ── Action buttons ───────────────────────── */}
        <div className="space-y-2.5">
          {/* PENDING actions */}
          {order.status === 'pending' && (
            <div className="space-y-2">
              <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Creator Actions</p>
              <div className="flex gap-2">
                {!order.isAcceptedByCreator && (
                  <button
                    onClick={() => handleAcceptTerms(order.id)}
                    className="flex-1 py-2.5 bg-primary text-black text-[9px] font-black uppercase tracking-wider rounded-xl hover:brightness-110 transition"
                  >
                    Accept Terms
                  </button>
                )}
                <button
                  onClick={() => { setEditingActor('creator'); setEditingOrder(order); }}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 text-white text-[9px] font-black uppercase tracking-wider rounded-xl transition"
                >
                  Counter-Propose
                </button>
                <button
                  onClick={() => handleStatusChange(order.id, 'declined')}
                  className="px-4 py-2.5 bg-red-500/15 text-red-400 border border-red-500/25 text-[9px] font-black uppercase tracking-wider rounded-xl hover:bg-red-500/25 transition"
                >
                  Decline
                </button>
              </div>

              {/* Member sim section */}
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
                <p className="text-[7px] font-black uppercase tracking-widest text-accent/70 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> Member Simulator
                </p>
                {order.paymentStatus === 'Awaiting Payment' ? (
                  <button
                    onClick={() => setCheckoutOrder(order)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-emerald-500/80 to-emerald-400 text-black text-[9px] font-black uppercase tracking-wider rounded-lg transition hover:shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                  >
                    <CreditCard className="w-3.5 h-3.5" /> Pay & Start (${order.budget})
                  </button>
                ) : (
                  <div className="flex gap-2">
                    {order.proposedBy === 'creator' && !order.isAcceptedByMember && (
                      <button
                        onClick={() => handleAcceptTermsByMember(order.id)}
                        className="flex-1 py-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[8px] font-black uppercase tracking-wider rounded-lg transition"
                      >
                        Accept Creator Terms
                      </button>
                    )}
                    <button
                      onClick={() => { setEditingActor('member'); setEditingOrder(order); }}
                      className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 border border-white/5 text-[8px] font-black uppercase tracking-wider rounded-lg transition"
                    >
                      Modify as Member
                    </button>
                    <button
                      onClick={() => handleStatusChange(order.id, 'declined')}
                      className="px-3 py-1.5 bg-red-950/30 text-red-400/80 border border-red-500/10 text-[8px] font-black uppercase tracking-wider rounded-lg transition"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* IN PROGRESS actions */}
          {order.status === 'in_progress' && (
            <button
              onClick={() => {
                if (hasPendingConsent) {
                  alert('Cannot submit: Co-performer consent is still pending.');
                  return;
                }
                handleStatusChange(order.id, 'review');
              }}
              className="w-full py-3 bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-black uppercase tracking-wider rounded-xl transition hover:bg-purple-500/30 flex items-center justify-center gap-2"
            >
              {hasPendingConsent && <Lock className="w-3.5 h-3.5 text-amber-400" />}
              Submit for Member Review
            </button>
          )}

          {/* REVIEW actions */}
          {order.status === 'review' && (
            <button
              onClick={() => {
                if (hasPendingConsent) { alert('Cannot approve: Co-performer consent pending.'); return; }
                handleStatusChange(order.id, 'completed');
              }}
              disabled={isGeneratingTeaser === order.id || hasPendingConsent}
              className="w-full py-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider rounded-xl transition hover:bg-emerald-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGeneratingTeaser === order.id ? (
                <span className="animate-pulse">Generating teaser…</span>
              ) : (
                <>
                  {hasPendingConsent && <Lock className="w-3.5 h-3.5 text-amber-400" />}
                  <CheckCircle2 className="w-4 h-4" /> Approve & Release Funds
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════
  return (
    <div className="w-full space-y-5">
      {/* ── Toast ────────────────────────────────────────── */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] bg-emerald-950 border border-emerald-500/40 text-emerald-300 px-5 py-3.5 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] flex items-center gap-3 max-w-md font-semibold text-xs border-l-4 border-l-emerald-400"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stats Bar ────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Pipeline Value', value: `$${totalPipeline}`, icon: TrendingUp,    color: 'text-cyan-400',    glow: 'shadow-cyan-400/10' },
          { label: 'In Escrow',      value: `$${inEscrow}`,      icon: Lock,           color: 'text-amber-400',   glow: 'shadow-amber-400/10' },
          { label: 'Total Earned',   value: `$${totalEarned}`,   icon: DollarSign,     color: 'text-emerald-400', glow: 'shadow-emerald-400/10' },
          { label: 'Awaiting Reply', value: `${pendingCount}`,    icon: AlertCircle,    color: 'text-purple-400',  glow: 'shadow-purple-400/10' },
        ].map(stat => (
          <div key={stat.label} className={`p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-1 shadow-sm ${stat.glow}`}>
            <div className="flex items-center gap-1.5">
              <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              <span className={`text-[8px] font-black uppercase tracking-widest ${stat.color}`}>{stat.label}</span>
            </div>
            <p className="text-xl font-black text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── Top toolbar ──────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* View switcher */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 gap-0.5">
          {([
            { id: 'orders',    icon: LayoutList, label: 'Orders' },
            { id: 'templates', icon: BookOpen,   label: 'Templates' },
          ] as { id: PanelView; icon: any; label: string }[]).map(v => (
            <button
              key={v.id}
              onClick={() => setPanelView(v.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition ${
                panelView === v.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              <v.icon className="w-3 h-3" /> {v.label}
            </button>
          ))}
        </div>

        {panelView === 'orders' && (
          /* Status filter pills */
          <div className="flex gap-1.5 flex-wrap">
            {(['all', 'pending', 'in_progress', 'review', 'completed', 'declined'] as FilterStatus[]).map(s => {
              const cfg = s === 'all' ? null : STATUS_CONFIG[s as OrderStatus];
              const count = s === 'all'
                ? orders.length
                : orders.filter(o => o.status === s).length;
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition border flex items-center gap-1 ${
                    filterStatus === s
                      ? cfg ? `${cfg.color} ${cfg.bg} ${cfg.border}` : 'bg-white/15 text-white border-white/20'
                      : 'text-white/30 bg-transparent border-white/5 hover:border-white/15 hover:text-white/60'
                  }`}
                >
                  {s === 'all' ? 'All' : cfg?.label}
                  <span className="text-[7px] opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        )}

        <button
          onClick={() => { setEditingActor('member'); setIsFormOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary to-accent text-black font-black text-[9px] uppercase tracking-widest rounded-xl hover:shadow-[0_0_15px_rgba(102,252,241,0.35)] transition shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> New Request Mock
        </button>
      </div>

      {/* ── Orders View ──────────────────────────────────── */}
      {panelView === 'orders' ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:items-start">

          {/* LEFT: Order list */}
          <div className="lg:col-span-2 space-y-2 max-h-[70vh] overflow-y-auto scrollbar-hide pr-1">
            <AnimatePresence mode="popLayout">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => <OrderListItem key={order.id} order={order} />)
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-36 flex flex-col items-center justify-center gap-2 text-center border-2 border-dashed border-white/5 rounded-2xl"
                >
                  <Inbox className="w-6 h-6 text-white/20" />
                  <p className="text-[9px] uppercase tracking-widest font-black text-white/20">No orders in this stage</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Declined log (always below) */}
            {filterStatus === 'all' && orders.filter(o => o.status === 'declined').length > 0 && (
              <div className="pt-3 border-t border-white/5 space-y-1.5">
                <p className="text-[8px] font-black uppercase tracking-widest text-red-400/60 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Declined Log
                </p>
                {orders.filter(o => o.status === 'declined').map(order => (
                  <OrderListItem key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Detail panel */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {selectedOrder ? (
                <motion.div
                  key={selectedOrder.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 max-h-[70vh] overflow-y-auto scrollbar-hide"
                >
                  <OrderDetail order={selectedOrder} />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-52 flex flex-col items-center justify-center gap-3 bg-white/[0.01] border border-white/5 rounded-3xl text-center"
                >
                  <ArrowRight className="w-6 h-6 text-white/20 -rotate-90" />
                  <p className="text-[9px] uppercase tracking-widest font-black text-white/20">Select an order to review details</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      ) : (
        /* ── Templates View ─────────────────────────────── */
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-black uppercase tracking-tighter text-white">Custom Templates</h2>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/10 transition rounded-xl text-[9px] font-black uppercase tracking-widest">
              <Plus className="w-3 h-3" /> New Template
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map(t => (
              <div key={t.id} className="p-5 bg-white/[0.02] border border-white/5 hover:border-primary/30 rounded-2xl transition space-y-3 group cursor-pointer">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-sm text-white group-hover:text-primary transition leading-snug flex-1">{t.name}</h3>
                  <span className="text-base font-black text-emerald-400 ml-2">${t.basePrice}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/30 flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5" /> {t.deliveryDays} Day{t.deliveryDays > 1 ? 's' : ''} Delivery
                  </span>
                </div>
                <div className="flex gap-2 pt-1">
                  <button className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 text-[8px] font-black uppercase tracking-wider rounded-lg text-white/60 transition">Edit</button>
                  <button className="flex-1 py-1.5 bg-primary/15 hover:bg-primary/25 border border-primary/20 text-[8px] font-black uppercase tracking-wider rounded-lg text-primary transition">Use</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Checkout Modal ───────────────────────────────── */}
      <AnimatePresence>
        {checkoutOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-[#0d0d0f] border border-white/10 rounded-[2rem] overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-56 h-56 bg-emerald-500/8 blur-[80px] rounded-full pointer-events-none" />
              <div className="relative z-10 p-7 space-y-5 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[8px] font-black uppercase tracking-widest rounded-full mb-3">
                      <Lock className="w-2.5 h-2.5" /> Secure Checkout
                    </span>
                    <h2 className="text-lg font-black uppercase tracking-tighter text-white">Member Payment Escrow</h2>
                  </div>
                  <button onClick={() => setCheckoutOrder(null)} className="text-white/40 hover:text-white p-2 rounded-full hover:bg-white/5 transition text-lg">&times;</button>
                </div>

                <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl space-y-2.5 text-xs">
                  {[
                    { l: 'Request', v: checkoutOrder.title },
                    { l: 'Category', v: checkoutOrder.category, accent: true },
                  ].map(row => (
                    <div key={row.l} className="flex justify-between">
                      <span className="text-white/50 font-bold uppercase tracking-wide">{row.l}</span>
                      <span className={`font-semibold ${row.accent ? 'text-primary font-black uppercase tracking-wider' : 'text-white'} truncate max-w-[60%]`}>{row.v}</span>
                    </div>
                  ))}
                  <hr className="border-white/5" />
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50 font-bold uppercase tracking-wide">Subtotal</span>
                    <span className="text-white font-bold">${checkoutOrder.budget}.00</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-white/30">
                    <span className="font-bold uppercase tracking-wide">Platform Fee (5%)</span>
                    <span className="font-bold">${(checkoutOrder.budget * 0.05).toFixed(2)}</span>
                  </div>
                  <hr className="border-white/10" />
                  <div className="flex justify-between text-base font-black text-emerald-400">
                    <span>Total Charged</span>
                    <span>${(checkoutOrder.budget * 1.05).toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Card Details (Simulated)</p>
                  <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-3">
                    {[
                      { label: 'Cardholder', value: 'Alex Reed', type: 'text' },
                    ].map(f => (
                      <div key={f.label} className="space-y-1">
                        <label className="text-[7px] font-black text-white/40 uppercase tracking-widest">{f.label}</label>
                        <input disabled value={f.value} className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-white/60 outline-none" />
                      </div>
                    ))}
                    <div className="space-y-1">
                      <label className="text-[7px] font-black text-white/40 uppercase tracking-widest">Card Number</label>
                      <div className="relative">
                        <input disabled value="•••• •••• •••• 4242" className="w-full bg-black/40 border border-white/5 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-white/60 outline-none" />
                        <CreditCard className="w-3.5 h-3.5 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {['12 / 28', '•••'].map((v, i) => (
                        <div key={i} className="space-y-1">
                          <label className="text-[7px] font-black text-white/40 uppercase tracking-widest">{i === 0 ? 'Expiry' : 'CVV'}</label>
                          <input disabled value={v} className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs font-bold text-white/60 outline-none text-center" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setCheckoutOrder(null)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 text-[9px] font-black uppercase tracking-widest rounded-xl transition">Cancel</button>
                  <button onClick={handleCheckoutSuccess} className="flex-[2] py-3 bg-gradient-to-r from-emerald-400 to-emerald-500 text-black text-[9px] font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(52,211,153,0.25)] hover:shadow-[0_0_30px_rgba(52,211,153,0.4)] transition">
                    Authorize & Hold Escrow
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Create Order Form ────────────────────────────── */}
      <AnimatePresence>
        {isFormOpen && (
          <CustomOrderRequestForm
            creatorName="Elena Rostova"
            customRequestPermission={customRequestPermission}
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleNewOrder}
            mode="create"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingOrder && (
          <CustomOrderRequestForm
            creatorName="Elena Rostova"
            customRequestPermission={customRequestPermission}
            initialData={editingOrder}
            onClose={() => setEditingOrder(null)}
            onSubmit={handleModifyOrder}
            mode="modify"
          />
        )}
      </AnimatePresence>

      {/* ── File Preview Lightbox ────────────────────────── */}
      <AnimatePresence>
        {previewFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-[#0d0d0f] border border-white/10 rounded-[2rem] overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-56 h-56 bg-primary/8 blur-[80px] rounded-full pointer-events-none" />
              <div className="relative z-10 p-7 space-y-5 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/15 text-primary border border-primary/20 text-[8px] font-black uppercase tracking-widest rounded-full mb-2">
                      Reference File Preview
                    </span>
                    <h2 className="text-base font-black text-white truncate max-w-[340px]">{previewFile.name}</h2>
                    <p className="text-[9px] text-white/30 uppercase tracking-widest font-black">{previewFile.size} · {previewFile.type}</p>
                  </div>
                  <button onClick={() => setPreviewFile(null)} className="text-white/40 hover:text-white p-2 rounded-full hover:bg-white/5 transition text-lg">&times;</button>
                </div>

                <div className="bg-black/60 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[200px]">
                  {previewFile.type.startsWith('image/') ? (
                    <img
                      src={previewFile.name.includes('stance')
                        ? 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80'
                        : 'https://images.unsplash.com/photo-1472289065668-ce650ac443d2?w=600&q=80'}
                      alt={previewFile.name}
                      className="w-full max-h-[260px] object-cover rounded-xl border border-white/10"
                    />
                  ) : previewFile.type.startsWith('video/') ? (
                    <div className="w-full aspect-video bg-black rounded-xl border border-white/10 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-cover bg-center opacity-30 blur-sm" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80')" }} />
                      <div className="z-10 flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-primary/20 border border-primary/40 rounded-full flex items-center justify-center">
                          <Eye className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-white">Simulated Video Playback</span>
                      </div>
                    </div>
                  ) : previewFile.type.startsWith('audio/') ? (
                    <div className="w-full flex flex-col items-center gap-3 py-4">
                      <MusicIcon className="w-10 h-10 text-primary/60 animate-bounce" />
                      <div className="flex gap-0.5 items-end h-8">
                        {[30,60,45,90,75,40,60,85,30,45,70,95,60,45,80,50,60,40,75,90,30].map((h, i) => (
                          <div key={i} className="bg-primary/40 rounded-t w-1.5" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-4 space-y-3">
                      <FileIcon className="w-10 h-10 text-primary/50 mx-auto" />
                      <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Document Reference</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setPreviewFile(null)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 text-[9px] font-black uppercase tracking-widest rounded-xl transition">Close</button>
                  <button
                    onClick={() => alert(`Downloading "${previewFile.name}"…`)}
                    className="flex-1 py-3 bg-gradient-to-r from-primary to-accent text-black text-[9px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(102,252,241,0.15)] transition"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
