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
  Edit, 
  Check, 
  AlertCircle, 
  Lock, 
  Info,
  DollarSign,
  Calendar,
  Send,
  User,
  ShieldAlert,
  Paperclip,
  Image as ImageIcon,
  Video as VideoIcon,
  Music as MusicIcon,
  File as FileIcon,
  Download,
  Eye
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

const COLUMNS: { id: OrderStatus; label: string; icon: any; color: string; bg: string }[] = [
  { id: 'pending', label: 'New Requests', icon: Inbox, color: 'text-cyan-400', bg: 'bg-cyan-400/10 border-cyan-400/20' },
  { id: 'in_progress', label: 'In Production', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
  { id: 'review', label: 'Pending Review', icon: ShieldCheck, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
  { id: 'completed', label: 'Delivered', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
];

const MOCK_TEMPLATES: Template[] = [
  { id: 't1', name: 'Personalized Workout Routine', basePrice: 150, deliveryDays: 7 },
  { id: 't2', name: 'Private Q&A Session (Video)', basePrice: 100, deliveryDays: 3 },
  { id: 't3', name: 'Social Media Shoutout', basePrice: 50, deliveryDays: 2 },
];

interface CreatorOrdersPanelProps {
  customRequestPermission?: 'anyone' | 'restricted';
}

export default function CreatorOrdersPanel({ customRequestPermission = 'anyone' }: CreatorOrdersPanelProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'templates'>('dashboard');
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [templates, setTemplates] = useState<Template[]>(MOCK_TEMPLATES);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGeneratingTeaser, setIsGeneratingTeaser] = useState<string | null>(null);

  // Negotiation and modification state
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editingActor, setEditingActor] = useState<'creator' | 'member'>('creator');
  const [checkoutOrder, setCheckoutOrder] = useState<Order | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<{ name: string; size: string; type: string } | null>(null);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        let payStatus = o.paymentStatus;
        if (newStatus === 'in_progress') payStatus = 'Held in Escrow';
        else if (newStatus === 'completed') payStatus = 'Released';
        else if (newStatus === 'declined') payStatus = 'Refunded';

        return { ...o, status: newStatus, paymentStatus: payStatus };
      }
      return o;
    }));

    if (newStatus === 'completed') {
      const targetOrder = orders.find(o => o.id === orderId);
      if (targetOrder && !targetOrder.teaserUrl) {
        setIsGeneratingTeaser(orderId);
        try {
          const res = await fetch('/api/v2/creator/generate-teaser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderTitle: targetOrder.title, description: "Delivered Custom Order" })
          });
          const data = await res.json();
          if (data.teaserImageUrl) {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, teaserUrl: data.teaserImageUrl } : o));
          }
        } catch (e) {
          console.error("Teaser generation failed", e);
        } finally {
          setIsGeneratingTeaser(null);
        }
      }
    }
  };

  const handleAcceptTerms = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const nextAccepted = true;
        const willBeAwaitingPayment = o.isAcceptedByMember;
        return {
          ...o,
          isAcceptedByCreator: nextAccepted,
          paymentStatus: willBeAwaitingPayment ? 'Awaiting Payment' : o.paymentStatus
        };
      }
      return o;
    }));
  };

  const handleAcceptTermsByMember = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const nextAccepted = true;
        const willBeAwaitingPayment = o.isAcceptedByCreator;
        return {
          ...o,
          isAcceptedByMember: nextAccepted,
          paymentStatus: willBeAwaitingPayment ? 'Awaiting Payment' : o.paymentStatus
        };
      }
      return o;
    }));
  };

  const handleNewOrder = async (data: any) => {
    const newOrder: Order = {
      id: Date.now().toString(),
      clientName: data.isSimulateMatched ? 'Subscribed Member' : 'Regular Guest',
      title: data.title,
      budget: data.budget,
      status: 'pending',
      deadline: data.deadline,
      category: data.category,
      primaryObjective: data.primaryObjective,
      secondaryObjective: data.secondaryObjective || undefined,
      description: data.description,
      paymentStatus: 'Unpaid',
      proposedBy: 'member',
      isAcceptedByCreator: false,
      isAcceptedByMember: true,
      coPerformers: data.coPerformers || [],
      attachments: data.attachments || []
    };
    setOrders([newOrder, ...orders]);
  };

  const handleModifyOrder = async (data: any) => {
    if (!editingOrder) return;
    const orderId = editingOrder.id;

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          title: data.title,
          budget: data.budget,
          deadline: data.deadline,
          category: data.category,
          primaryObjective: data.primaryObjective,
          secondaryObjective: data.secondaryObjective || undefined,
          description: data.description,
          proposedBy: editingActor,
          isAcceptedByCreator: editingActor === 'creator',
          isAcceptedByMember: editingActor === 'member',
          paymentStatus: 'Unpaid',
          coPerformers: data.coPerformers || [],
          attachments: data.attachments || []
        };
      }
      return o;
    }));
    setEditingOrder(null);
  };

  const handleCheckoutSuccess = () => {
    if (!checkoutOrder) return;
    const orderId = checkoutOrder.id;

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'in_progress',
          paymentStatus: 'Held in Escrow',
          isAcceptedByCreator: true,
          isAcceptedByMember: true
        };
      }
      return o;
    }));

    setSuccessToast(`Payment of $${checkoutOrder.budget} secured in Escrow! Order is now in production.`);
    setCheckoutOrder(null);

    setTimeout(() => {
      setSuccessToast(null);
    }, 5000);
  };

  const declinedOrders = orders.filter(o => o.status === 'declined');

  return (
    <div className="w-full">
      {/* Visual Success Toast */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-950 border border-success/40 text-emerald-300 px-6 py-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-3 max-w-md font-semibold text-xs border-l-4 border-l-success"
          >
            <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-6">
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition ${activeTab === 'dashboard' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition ${activeTab === 'templates' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80'}`}
          >
            Templates
          </button>
        </div>
        
        <button 
          onClick={() => {
            setEditingActor('member');
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-accent text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition"
        >
          <Plus className="w-4 h-4" /> New Request Mock
        </button>
      </div>

      {activeTab === 'dashboard' ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
            {COLUMNS.map(col => {
              const colOrders = orders.filter(o => o.status === col.id);
              const Icon = col.icon;
              
              return (
                <div key={col.id} className="flex flex-col h-[75vh]">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${col.color}`}>
                      <Icon className="w-4 h-4" /> {col.label}
                    </h3>
                    <span className="text-[10px] font-black bg-white/10 px-2 py-0.5 rounded-full text-white/60">
                      {colOrders.length}
                    </span>
                  </div>
                  
                  <div className="flex-1 glass-card bg-black/40 border border-white/5 rounded-3xl p-3 overflow-y-auto space-y-3">
                    <AnimatePresence>
                      {colOrders.map(order => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          key={order.id}
                          className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-white/20 transition group space-y-3"
                        >
                          <div className="flex justify-between items-start">
                            <div className="text-[8px] uppercase tracking-widest text-white/40 font-bold">
                              {order.clientName}
                            </div>
                            <div className="text-xs font-black text-success">
                              ${order.budget}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/10 text-[7px] font-black uppercase tracking-widest text-primary rounded-md">
                              <Tag className="w-2 h-2" /> {order.category}
                            </span>
                            <h4 className="font-bold text-xs text-white line-clamp-2 leading-snug">
                              {order.title}
                            </h4>
                          </div>

                          {/* Negotiation Specific Badges */}
                          {order.status === 'pending' && (
                            <div className="space-y-1.5 p-2 bg-black/20 rounded-xl border border-white/5">
                              <div className="text-[7px] uppercase tracking-widest text-white/40 font-bold">
                                Current Proposal: <span className="text-primary">{order.proposedBy === 'creator' ? 'Creator (You)' : 'Member'}</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5 text-[8px] font-bold">
                                <span className={`px-1.5 py-0.5 rounded flex items-center gap-1 border ${
                                  order.isAcceptedByCreator 
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                    : 'bg-white/5 text-white/30 border-white/5'
                                }`}>
                                  <Check className="w-2 h-2" /> Creator OK
                                </span>
                                <span className={`px-1.5 py-0.5 rounded flex items-center gap-1 border ${
                                  order.isAcceptedByMember 
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                    : 'bg-white/5 text-white/30 border-white/5'
                                }`}>
                                  <Check className="w-2 h-2" /> Member OK
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Objectives Details */}
                          <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl space-y-2 text-[10px] leading-relaxed">
                            <div>
                              <span className="text-[7px] font-black uppercase tracking-widest text-white/30 flex items-center gap-1 mb-0.5">
                                <Target className="w-2.5 h-2.5 text-cyan-400" /> Primary Objective
                              </span>
                              <p className="text-white/70 font-semibold">{order.primaryObjective}</p>
                            </div>
                            {order.secondaryObjective && (
                              <div className="pt-1 border-t border-white/5">
                                <span className="text-[7px] font-black uppercase tracking-widest text-white/30 flex items-center gap-1 mb-0.5">
                                  <Target className="w-2.5 h-2.5 text-purple-400" /> Secondary Objective
                                </span>
                                <p className="text-white/60 font-semibold">{order.secondaryObjective}</p>
                              </div>
                            )}
                          </div>

                          {/* Attached References */}
                          {order.attachments && order.attachments.length > 0 && (
                            <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl space-y-1.5 text-[10px] text-left">
                              <span className="text-[7px] font-black uppercase tracking-widest text-white/30 flex items-center gap-1">
                                <Paperclip className="w-2.5 h-2.5" /> Attached References ({order.attachments.length})
                              </span>
                              <div className="flex flex-col gap-1.5">
                                {order.attachments.map((file, i) => {
                                  let FileIconComponent = FileIcon;
                                  if (file.type.startsWith('image/')) FileIconComponent = ImageIcon;
                                  else if (file.type.startsWith('video/')) FileIconComponent = VideoIcon;
                                  else if (file.type.startsWith('audio/')) FileIconComponent = MusicIcon;

                                  return (
                                    <div 
                                      key={i} 
                                      onClick={() => setPreviewFile(file)}
                                      className="flex items-center justify-between px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer transition group/file"
                                    >
                                      <div className="flex items-center gap-2 overflow-hidden flex-1">
                                        <FileIconComponent className="w-3.5 h-3.5 text-primary shrink-0" />
                                        <span className="truncate font-semibold text-white/80 group-hover/file:text-white transition text-[9px]">
                                          {file.name}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <span className="text-[7px] text-white/40">{file.size}</span>
                                        <Eye className="w-3 h-3 text-white/20 group-hover/file:text-primary transition" />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Co-Performers */}
                          {order.coPerformers && order.coPerformers.length > 0 && (
                            <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl space-y-1.5 text-[10px]">
                              <span className="text-[7px] font-black uppercase tracking-widest text-white/30 block">
                                Co-Performers & Consent Gate:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {order.coPerformers.map((p: any, i: number) => (
                                  <span key={i} className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider ${
                                    p.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                                  }`} title={`${p.name} (${p.status})`}>
                                    {p.avatar && <img src={p.avatar} className="w-3.5 h-3.5 rounded-full object-cover" />}
                                    <span>{p.name}</span>
                                    {p.status === 'pending' && p.type === 'registered' && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOrders(prev => prev.map(o => {
                                            if (o.id === order.id) {
                                              const updatedCo = o.coPerformers?.map(item => item.name === p.name ? { ...item, status: 'approved' } : item);
                                              return { ...o, coPerformers: updatedCo };
                                            }
                                            return o;
                                          }));
                                          setSuccessToast(`Simulation: ${p.name} approved consent for "${order.title}"!`);
                                          setTimeout(() => setSuccessToast(null), 3000);
                                        }}
                                        className="ml-1 bg-accent/20 border border-accent/30 text-accent px-1 rounded text-[6px] hover:bg-accent/30 transition"
                                      >
                                        Simulate OK
                                      </button>
                                    )}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {order.coPerformers?.some(p => p.status === 'pending') && (
                            <div className="p-2.5 bg-red-950/20 border border-red-500/20 text-red-400 rounded-xl text-[9px] flex items-start gap-2">
                              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                              <div className="text-left">
                                <p className="font-bold uppercase text-[8px]">Consent Hold Active</p>
                                <p className="text-[8px] text-red-200">Custom order release is blocked until all tagged co-performers approve depiction.</p>
                              </div>
                            </div>
                          )}

                          {/* Payment status badge */}
                          <div className="flex justify-between items-center pt-2 border-t border-white/5">
                            <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              order.paymentStatus === 'Released' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              order.paymentStatus === 'Held in Escrow' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              order.paymentStatus === 'Refunded' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                              order.paymentStatus === 'Awaiting Payment' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]' :
                              'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            }`}>
                              Payment: {order.paymentStatus}
                            </span>
                            <span className="text-[8px] font-bold uppercase tracking-widest text-white/30">
                              Due: {order.deadline}
                            </span>
                          </div>

                          {order.teaserUrl && (
                            <div className="mt-2 rounded-lg overflow-hidden border border-white/10 aspect-video relative">
                              <img src={order.teaserUrl} alt="Teaser" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <span className="text-[8px] uppercase font-black tracking-widest px-2 py-1 bg-black border border-white/20 rounded-full">Automated Teaser</span>
                              </div>
                            </div>
                          )}
                          
                          {/* Status & Negotiation Controls */}
                          <div className="space-y-2.5 pt-2 mt-2 border-t border-white/5 opacity-0 group-hover:opacity-100 transition">
                            {col.id === 'pending' && (
                              <div className="space-y-2 w-full">
                                {/* Creator Action Buttons */}
                                <div className="flex gap-2 w-full">
                                  {!order.isAcceptedByCreator && (
                                    <button 
                                      onClick={() => handleAcceptTerms(order.id)} 
                                      className="flex-1 text-[8px] bg-primary text-black py-1.5 rounded-lg uppercase font-black tracking-wider text-center"
                                    >
                                      Accept Terms
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => {
                                      setEditingActor('creator');
                                      setEditingOrder(order);
                                    }} 
                                    className="flex-1 text-[8px] bg-white/10 text-white hover:bg-white/15 py-1.5 rounded-lg uppercase font-black tracking-wider text-center"
                                  >
                                    Modify Request
                                  </button>
                                  <button 
                                    onClick={() => handleStatusChange(order.id, 'declined')} 
                                    className="text-[8px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-1.5 rounded-lg uppercase font-black tracking-wider text-center"
                                  >
                                    Decline
                                  </button>
                                </div>

                                {/* Member Simulator Section */}
                                <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl space-y-2 text-left">
                                  <div className="flex items-center gap-1 text-[7px] font-black uppercase tracking-widest text-accent">
                                    <ShieldAlert className="w-3 h-3 shrink-0" /> Member Simulator
                                  </div>

                                  {order.paymentStatus === 'Awaiting Payment' ? (
                                    <button
                                      onClick={() => setCheckoutOrder(order)}
                                      className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-gradient-to-r from-success/80 to-emerald-500 text-black text-[8px] font-black uppercase tracking-wider rounded-lg hover:shadow-[0_0_15px_rgba(52,211,153,0.3)] transition"
                                    >
                                      <CreditCard className="w-3.5 h-3.5" /> Pay Now & Start ($ {order.budget})
                                    </button>
                                  ) : (
                                    <div className="flex flex-col gap-1.5">
                                      {order.proposedBy === 'creator' && !order.isAcceptedByMember && (
                                        <button
                                          onClick={() => handleAcceptTermsByMember(order.id)}
                                          className="w-full py-1 text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md uppercase font-black tracking-wider text-center"
                                        >
                                          Accept Creator Terms
                                        </button>
                                      )}
                                      <button
                                        onClick={() => {
                                          setEditingActor('member');
                                          setEditingOrder(order);
                                        }}
                                        className="w-full py-1 text-[8px] bg-white/5 hover:bg-white/10 text-white/70 border border-white/5 rounded-md uppercase font-black tracking-wider text-center"
                                      >
                                        Modify terms as Member
                                      </button>
                                      <button
                                        onClick={() => handleStatusChange(order.id, 'declined')}
                                        className="w-full py-1 text-[8px] bg-red-950/40 text-red-400/80 border border-red-500/10 rounded-md uppercase font-black tracking-wider text-center"
                                      >
                                        Decline as Member
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {col.id === 'in_progress' && (
                              <button 
                                onClick={() => {
                                  const hasPending = order.coPerformers?.some(p => p.status === 'pending');
                                  if (hasPending) {
                                    alert('Cannot submit for review: Tagged co-performer digital consent is pending. All co-performers must approve first.');
                                    return;
                                  }
                                  handleStatusChange(order.id, 'review');
                                }}
                                className="w-full text-[8px] bg-purple-500/20 text-purple-400 border border-purple-500/30 py-1.5 rounded-lg uppercase font-black tracking-wider text-center font-bold flex items-center justify-center gap-1"
                              >
                                {order.coPerformers?.some(p => p.status === 'pending') && <Lock className="w-2.5 h-2.5 text-amber-400" />}
                                Submit for Review
                              </button>
                            )}
                            {col.id === 'review' && (
                              <button 
                                onClick={() => {
                                  const hasPending = order.coPerformers?.some(p => p.status === 'pending');
                                  if (hasPending) {
                                    alert('Cannot approve custom order: Tagged co-performer digital consent is pending.');
                                    return;
                                  }
                                  handleStatusChange(order.id, 'completed');
                                }}
                                disabled={isGeneratingTeaser === order.id || order.coPerformers?.some(p => p.status === 'pending')} 
                                className="w-full text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-1.5 rounded-lg uppercase font-black tracking-wider disabled:opacity-50 text-center font-bold flex items-center justify-center gap-1"
                              >
                                {isGeneratingTeaser === order.id ? 'Generating...' : (
                                  <>
                                    {order.coPerformers?.some(p => p.status === 'pending') && <Lock className="w-2.5 h-2.5 text-amber-400" />}
                                    Approve & Release Funds
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {colOrders.length === 0 && (
                      <div className="h-28 flex items-center justify-center text-[8px] uppercase tracking-widest font-bold text-white/20 border-2 border-dashed border-white/5 rounded-2xl">
                        No requests in queue
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Declined Orders Section */}
          {declinedOrders.length > 0 && (
            <div className="glass-card bg-black/40 border border-white/5 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-red-400 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-400" /> Declined & Refunded Requests Log
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {declinedOrders.map(order => (
                  <div key={order.id} className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 space-y-2.5">
                    <div className="flex justify-between items-start">
                      <span className="text-[8px] uppercase font-bold text-red-400/60">{order.clientName}</span>
                      <span className="text-xs font-black text-red-400">${order.budget}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="inline-block px-1.5 py-0.5 bg-red-500/10 text-[7px] font-black uppercase tracking-widest text-red-400 rounded">
                        {order.category}
                      </span>
                      <h4 className="font-bold text-xs text-white/80">{order.title}</h4>
                    </div>
                    <div className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-red-950/20 text-red-400 border border-red-500/20 w-fit">
                      Payment Status: {order.paymentStatus}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card bg-black/40 border border-white/5 rounded-3xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold uppercase tracking-tighter">Custom Templates</h2>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 transition rounded-xl text-xs font-black uppercase tracking-widest">
              + New Template
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map(t => (
              <div key={t.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-primary/50 transition">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-white text-sm">{t.name}</h3>
                  <span className="text-xs font-black text-success">${t.basePrice}</span>
                </div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-white/40">
                  {t.deliveryDays} Days Delivery
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <AnimatePresence>
        {checkoutOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md glass-card rounded-[2.5rem] border border-white/10 overflow-hidden relative my-8"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
              <div className="relative z-10 p-8 space-y-6 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest rounded-full mb-3">
                      <Lock className="w-2.5 h-2.5" /> Secure Checkout
                    </span>
                    <h2 className="text-xl font-black uppercase tracking-tighter text-white">
                      Member Payment Escrow
                    </h2>
                  </div>
                  <button 
                    onClick={() => setCheckoutOrder(null)}
                    className="text-white/40 hover:text-white p-2 rounded-full hover:bg-white/5 transition"
                  >
                    &times;
                  </button>
                </div>

                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/60 font-bold uppercase tracking-wide">Request</span>
                    <span className="text-white font-semibold line-clamp-1">{checkoutOrder.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60 font-bold uppercase tracking-wide">Category</span>
                    <span className="text-primary font-black uppercase tracking-wider">{checkoutOrder.category}</span>
                  </div>
                  <hr className="border-white/5" />
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60 font-bold uppercase tracking-wide">Subtotal</span>
                    <span className="text-white font-bold">${checkoutOrder.budget}.00</span>
                  </div>
                  <div className="flex justify-between text-xs text-white/40">
                    <span className="font-bold uppercase tracking-wide">Platform Fee (5%)</span>
                    <span className="font-bold">${(checkoutOrder.budget * 0.05).toFixed(2)}</span>
                  </div>
                  <hr className="border-white/10" />
                  <div className="flex justify-between text-base font-black text-success">
                    <span className="uppercase tracking-wide">Total Charged</span>
                    <span>${(checkoutOrder.budget * 1.05).toFixed(2)}</span>
                  </div>
                </div>

                {/* Credit Card Details */}
                <div className="space-y-4">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-1">Card Details (Simulated)</h4>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-white/50 uppercase tracking-widest ml-1">Cardholder Name</label>
                      <input 
                        type="text" 
                        disabled
                        value="Alex Reed" 
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs font-semibold text-white/70 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-white/50 uppercase tracking-widest ml-1">Card Number</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          disabled
                          value="•••• •••• •••• 4242" 
                          className="w-full bg-black/40 border border-white/5 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-white/70 outline-none"
                        />
                        <CreditCard className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-white/50 uppercase tracking-widest ml-1">Expiry Date</label>
                        <input 
                          type="text" 
                          disabled
                          value="12 / 28" 
                          className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs font-semibold text-white/70 outline-none text-center"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-white/50 uppercase tracking-widest ml-1">CVV / CVC</label>
                        <input 
                          type="text" 
                          disabled
                          value="•••" 
                          className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs font-semibold text-white/70 outline-none text-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setCheckoutOrder(null)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-[10px] font-black uppercase tracking-widest rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCheckoutSuccess}
                    className="flex-[2] py-3 bg-gradient-to-r from-success to-emerald-400 text-black text-[10px] font-black uppercase tracking-[0.15em] rounded-xl shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:shadow-[0_0_30px_rgba(52,211,153,0.5)] transition"
                  >
                    Authorize & Hold Escrow
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

      {/* File Preview Lightbox Modal */}
      <AnimatePresence>
        {previewFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg glass-card rounded-[2.5rem] border border-white/10 overflow-hidden relative my-8"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
              <div className="relative z-10 p-8 space-y-6 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary border border-primary/20 text-[9px] font-black uppercase tracking-widest rounded-full mb-3">
                      Reference File Preview
                    </span>
                    <h2 className="text-xl font-black uppercase tracking-tighter text-white truncate max-w-[320px]">
                      {previewFile.name}
                    </h2>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">
                      Size: {previewFile.size} | Type: {previewFile.type}
                    </p>
                  </div>
                  <button 
                    onClick={() => setPreviewFile(null)}
                    className="text-white/40 hover:text-white p-2 rounded-full hover:bg-white/5 transition"
                  >
                    &times;
                  </button>
                </div>

                {/* Preview Content Area */}
                <div className="bg-black/60 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden">
                  {previewFile.type.startsWith('image/') ? (
                    <div className="space-y-4 w-full flex flex-col items-center">
                      <img 
                        src={
                          previewFile.name.includes('stance') 
                            ? 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80'
                            : 'https://images.unsplash.com/photo-1472289065668-ce650ac443d2?w=600&q=80'
                        } 
                        alt={previewFile.name} 
                        className="w-full max-h-[260px] object-cover rounded-xl border border-white/10" 
                      />
                      <span className="text-[9px] uppercase tracking-widest font-bold text-white/30 italic">Interactive Image Sandbox</span>
                    </div>
                  ) : previewFile.type.startsWith('video/') ? (
                    <div className="w-full space-y-4 flex flex-col items-center">
                      <div className="w-full aspect-video bg-black rounded-xl border border-white/10 flex flex-col items-center justify-center relative group">
                        <div className="absolute inset-0 bg-cover bg-center opacity-40 blur-xs" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80')" }} />
                        <div className="w-12 h-12 bg-primary/20 border border-primary/40 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition z-10 shadow-[0_0_15px_rgba(102,252,241,0.2)]">
                          <Eye className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-white mt-3 z-10">Simulated Reference Video Playback</span>
                        <span className="text-[8px] text-white/40 uppercase tracking-widest mt-1 z-10">Duration: 0:45</span>
                      </div>
                    </div>
                  ) : previewFile.type.startsWith('audio/') || previewFile.name.endsWith('.mp3') || previewFile.name.endsWith('.m4a') ? (
                    <div className="w-full space-y-4 py-4 flex flex-col items-center">
                      <MusicIcon className="w-12 h-12 text-primary/60 animate-bounce" />
                      <div className="w-full px-4">
                        <div className="flex gap-0.5 justify-center items-end h-8 mb-2">
                          {[30, 60, 45, 90, 75, 40, 60, 85, 30, 45, 70, 95, 60, 45, 80, 50, 60, 40, 75, 90, 30].map((h, i) => (
                            <div 
                              key={i} 
                              className="bg-primary/40 rounded-t w-1.5 transition-all duration-300"
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between text-[8px] font-bold text-white/30 uppercase tracking-widest">
                          <span>0:00</span>
                          <span>0:15</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-6 space-y-4">
                      <FileIcon className="w-12 h-12 text-primary/60 mx-auto" />
                      <div>
                        <p className="text-xs font-bold text-white/80 uppercase tracking-wider">Document Reference Sandbox</p>
                        <p className="text-[9px] text-white/40 leading-relaxed mt-1 uppercase max-w-[280px]">
                          This is a custom-attached document. In a production environment, this triggers a direct file download or in-app viewer.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setPreviewFile(null)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-[10px] font-black uppercase tracking-widest rounded-xl transition"
                  >
                    Close Preview
                  </button>
                  <button
                    onClick={() => {
                      alert(`Simulation: Downloading file "${previewFile.name}" (${previewFile.size})...`);
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-primary to-accent text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(102,252,241,0.2)]"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Reference
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
