import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, DollarSign, Send, FileText, Lock, Tag, Target, Users, ShieldAlert,
  Upload, Paperclip, File, Image, Video, Music, Trash2, CheckCircle2
} from 'lucide-react';

interface CustomOrderRequestFormProps {
  creatorName: string;
  customRequestPermission?: 'anyone' | 'restricted';
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  mode?: 'create' | 'modify';
}

const CATEGORIES = [
  'Tutorial & Coaching',
  'Learning Courses',
  'Software & Architecture',
  'Lifestyle & Fashion',
  'Social Media & Networking',
  'Explicit Content'
];

export default function CustomOrderRequestForm({ 
  creatorName, 
  customRequestPermission = 'anyone',
  onClose, 
  onSubmit,
  initialData,
  mode = 'create'
}: CustomOrderRequestFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [budget, setBudget] = useState(initialData?.budget?.toString() || '');
  const [deadline, setDeadline] = useState(initialData?.deadline || '');
  const [category, setCategory] = useState(initialData?.category || CATEGORIES[0]);
  const [primaryObjective, setPrimaryObjective] = useState(initialData?.primaryObjective || '');
  const [secondaryObjective, setSecondaryObjective] = useState(initialData?.secondaryObjective || '');
  const [isSimulateMatched, setIsSimulateMatched] = useState(initialData?.isSimulateMatched ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<any[]>(initialData?.attachments || []);

  const [hasCoPerformers, setHasCoPerformers] = useState(initialData?.coPerformers?.length > 0 || false);
  const [coPerformerType, setCoPerformerType] = useState<'registered' | 'external'>('registered');
  const [selectedRegisteredUser, setSelectedRegisteredUser] = useState('Marcus L.');
  const [externalPerformerName, setExternalPerformerName] = useState('');
  const [externalConsentFile, setExternalConsentFile] = useState<string>('');
  const [addedCoPerformers, setAddedCoPerformers] = useState<any[]>(initialData?.coPerformers || []);

  const REGISTERED_USERS = [
    { id: 'u1', name: 'Marcus L.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80' },
    { id: 'u2', name: 'Sofia V.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80' },
    { id: 'u3', name: 'Jordan P.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80' },
    { id: 'u4', name: 'Alex R.', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&q=80' },
  ];

  const handleAddCoPerformer = () => {
    if (coPerformerType === 'registered') {
      const user = REGISTERED_USERS.find(u => u.name === selectedRegisteredUser);
      if (!user) return;
      if (addedCoPerformers.some(p => p.name === user.name)) return;
      setAddedCoPerformers(prev => [...prev, {
        name: user.name,
        type: 'registered',
        userId: user.id,
        avatar: user.avatar,
        status: 'pending'
      }]);
    } else {
      if (!externalPerformerName.trim()) return;
      if (!externalConsentFile) {
        alert('Please attach/upload a signed consent document.');
        return;
      }
      setAddedCoPerformers(prev => [...prev, {
        name: externalPerformerName.trim(),
        type: 'external',
        status: 'approved',
        consentDocumentUrl: externalConsentFile
      }]);
      setExternalPerformerName('');
      setExternalConsentFile('');
    }
  };

  const handleRemoveCoPerformer = (idx: number) => {
    setAddedCoPerformers(prev => prev.filter((_, i) => i !== idx));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    if (type.startsWith('audio/')) return Music;
    return File;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleAddMockAttachment = (name: string, size: string, type: string) => {
    if (attachments.some(file => file.name === name)) return;
    const tempId = Date.now().toString();
    const newFile = { id: tempId, name, size, type, uploading: true };
    setAttachments(prev => [...prev, newFile]);

    setTimeout(() => {
      setAttachments(prev => prev.map(f => f.id === tempId ? { ...f, uploading: false } : f));
    }, 1000);
  };

  const handleRealFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const tempId = Math.random().toString();
      const newFile = {
        id: tempId,
        name: file.name,
        size: formatBytes(file.size),
        type: file.type || 'application/octet-stream',
        uploading: true
      };

      setAttachments(prev => [...prev, newFile]);

      setTimeout(() => {
        setAttachments(prev => prev.map(f => f.id === tempId ? { ...f, uploading: false } : f));
      }, 1500);
    });

    e.target.value = '';
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPermissionError(null);
    setIsSubmitting(true);

    // Enforce custom request permissions only on creation
    if (mode === 'create' && customRequestPermission === 'restricted' && !isSimulateMatched) {
      setTimeout(() => {
        setPermissionError(`Access Blocked: ${creatorName} only accepts custom requests from matched or subscribed members.`);
        setIsSubmitting(false);
      }, 400);
      return;
    }

    try {
      await onSubmit({ 
        title, 
        description, 
        budget: Number(budget), 
        deadline,
        category,
        primaryObjective,
        secondaryObjective,
        isSimulateMatched,
        coPerformers: hasCoPerformers ? addedCoPerformers : [],
        attachments: attachments.map(({ name, size, type }) => ({ name, size, type }))
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-xl glass-card rounded-[2rem] border border-white/10 overflow-hidden relative my-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="inline-block px-3 py-1 bg-primary/20 text-primary border border-primary/20 text-[9px] font-black uppercase tracking-widest rounded-full mb-3">
                {mode === 'modify' ? 'Negotiate Terms' : 'Direct Access'}
              </span>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-1">
                {mode === 'modify' ? 'Modify Request Terms' : 'Custom Content Request'}
              </h2>
              <p className="text-xs text-white/50 font-bold uppercase tracking-widest">
                {mode === 'modify' ? `Adjust proposal terms for ${creatorName}` : `Order bespoke content from ${creatorName}`}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-white/40 hover:text-white p-2 rounded-full hover:bg-white/5 transition"
            >
              &times;
            </button>
          </div>

          {permissionError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 mb-6 bg-red-950/40 border border-red-500/30 rounded-2xl flex items-start gap-3 text-red-400"
            >
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black uppercase tracking-wider mb-1">Access Restrained</p>
                <p className="text-[10px] leading-relaxed text-red-200">{permissionError}</p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Simulation Options for testing matched setting - only show when creating a new request */}
            {mode === 'create' && (
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Simulation: Requester Relation</span>
                </div>
                <div className="flex items-center gap-4 text-[10px]">
                  <label className="flex items-center gap-2 cursor-pointer text-white/80 hover:text-white transition font-bold uppercase tracking-wider">
                    <input 
                      type="radio" 
                      name="simulate_relation"
                      checked={isSimulateMatched === true}
                      onChange={() => {
                        setIsSimulateMatched(true);
                        setPermissionError(null);
                      }}
                      className="accent-primary"
                    />
                    Matched / Subscribed Member
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-white/80 hover:text-white transition font-bold uppercase tracking-wider">
                    <input 
                      type="radio" 
                      name="simulate_relation"
                      checked={isSimulateMatched === false}
                      onChange={() => {
                        setIsSimulateMatched(false);
                        setPermissionError(null);
                      }}
                      className="accent-primary"
                    />
                    Unmatched / Guest Member
                  </label>
                </div>
                <p className="text-[7px] text-white/40 uppercase tracking-widest">
                  Current Creator Settings: {customRequestPermission === 'restricted' ? 'Only Matched/Subscribed' : 'Anyone Allowed'}.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category dropdown */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/70 ml-1 flex items-center gap-2">
                  <Tag className="w-3 h-3 text-primary" /> Content Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest text-white focus:border-primary transition outline-none"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="bg-black text-white">{cat}</option>
                  ))}
                </select>

                {category === 'Explicit Content' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 mt-2 bg-red-950/40 border border-red-500/30 rounded-xl flex items-start gap-2 text-red-400"
                  >
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-wider mb-0.5">Explicit Content Guideline Warning</p>
                      <p className="text-[8px] leading-relaxed text-red-200">
                        Please ensure all requests comply with platform safety and consent guidelines.
                        Strict moderation applies.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Title input */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/70 ml-1 flex items-center gap-2">
                  <FileText className="w-3 h-3 text-primary" /> Request Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-primary transition outline-none"
                  placeholder="E.g., Personalized workout plan"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/70 ml-1">
                Detailed Description & Requirements
              </label>
              <textarea
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-semibold text-white focus:border-primary transition outline-none resize-none h-16"
                placeholder="Provide specific details about your request..."
              />
            </div>

            {/* Primary & Secondary Objectives */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/70 ml-1 flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-cyan-400" /> Primary Objective
                </label>
                <input
                  type="text"
                  required
                  value={primaryObjective}
                  onChange={e => setPrimaryObjective(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-semibold text-white focus:border-primary transition outline-none"
                  placeholder="e.g. Build upper body strength and improve posture"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/70 ml-1 flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-purple-400" /> Secondary Objective (Optional)
                </label>
                <input
                  type="text"
                  value={secondaryObjective}
                  onChange={e => setSecondaryObjective(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-semibold text-white focus:border-primary transition outline-none"
                  placeholder="e.g. Focus on chest expansions and stretching"
                />
              </div>
            </div>

            {/* File Attachments Section */}
            <div className="space-y-3 p-4 bg-white/5 border border-white/10 rounded-2xl text-left">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-primary" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Attached Reference Files</span>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {/* Drag-and-drop zone / Upload trigger */}
                <div 
                  onClick={() => document.getElementById('order-file-input')?.click()}
                  className="border-2 border-dashed border-white/10 hover:border-primary/40 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-black/20 hover:bg-white/5 transition group text-center"
                >
                  <Upload className="w-6 h-6 text-white/30 group-hover:text-primary transition" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/50 group-hover:text-white/80 transition">
                    Upload reference files (PDF, JPG, MP4, MP3)
                  </span>
                  <span className="text-[8px] text-white/30 uppercase tracking-wide">
                    Drag & drop or click to browse
                  </span>
                  <input 
                    id="order-file-input"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleRealFileUpload}
                  />
                </div>

                {/* Quick Attach presets (Mock) */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[8px] uppercase tracking-widest font-black text-white/40">Quick Mock Attachments:</span>
                  <button
                    type="button"
                    onClick={() => handleAddMockAttachment('pose_guide.png', '1.2 MB', 'image/png')}
                    className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-lg text-[8px] font-bold text-white/70 transition"
                  >
                    + Pose Guide (PNG)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddMockAttachment('script_draft.pdf', '180 KB', 'application/pdf')}
                    className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-lg text-[8px] font-bold text-white/70 transition"
                  >
                    + Script Draft (PDF)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddMockAttachment('reference_clip.mp4', '14.5 MB', 'video/mp4')}
                    className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-lg text-[8px] font-bold text-white/70 transition"
                  >
                    + Reference Clip (MP4)
                  </button>
                </div>

                {/* Uploading / Attached Files List */}
                {attachments.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    {attachments.map((file, idx) => {
                      const FileIcon = getFileIcon(file.type);
                      return (
                        <div key={idx} className="flex items-center justify-between p-2 bg-black/40 border border-white/5 rounded-xl text-xs gap-3">
                          <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                            <div className="p-1.5 bg-white/5 rounded-lg text-primary">
                              <FileIcon className="w-3.5 h-3.5" />
                            </div>
                            <div className="overflow-hidden flex-1">
                              <p className="font-bold text-white/80 text-[10px] truncate">{file.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[8px] text-white/40">{file.size}</span>
                                {file.uploading ? (
                                  <span className="text-[7px] font-black text-primary uppercase animate-pulse">Uploading...</span>
                                ) : (
                                  <span className="text-[7px] font-black text-success uppercase flex items-center gap-0.5">
                                    <CheckCircle2 className="w-2 h-2" /> Uploaded
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {file.uploading ? (
                            <div className="w-12 bg-white/10 h-1 rounded-full overflow-hidden">
                              <div className="bg-primary h-full animate-[progress_1.5s_ease-in-out_infinite]" style={{ width: '100%' }} />
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(idx)}
                              className="text-white/40 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Co-Performance Section */}
            <div className="space-y-4 p-4 bg-white/5 border border-white/10 rounded-2xl text-left">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer font-black text-[10px] uppercase tracking-widest text-white/70">
                  <input 
                    type="checkbox"
                    checked={hasCoPerformers}
                    onChange={(e) => setHasCoPerformers(e.target.checked)}
                    className="accent-primary"
                  />
                  Contains Co-Performer(s)
                </label>
              </div>

              {hasCoPerformers && (
                <div className="space-y-3 pt-2 border-t border-white/5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Performer Type</label>
                      <select
                        value={coPerformerType}
                        onChange={(e) => setCoPerformerType(e.target.value as any)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary transition"
                      >
                        <option value="registered">Registered Platform User</option>
                        <option value="external">External Performer (Upload Consent)</option>
                      </select>
                    </div>

                    {coPerformerType === 'registered' ? (
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Select Registered Creator</label>
                        <select
                          value={selectedRegisteredUser}
                          onChange={(e) => setSelectedRegisteredUser(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary transition"
                        >
                          {REGISTERED_USERS.map(u => (
                            <option key={u.id} value={u.name}>{u.name}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Performer Full Name</label>
                        <input
                          type="text"
                          value={externalPerformerName}
                          onChange={(e) => setExternalPerformerName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary transition"
                        />
                      </div>
                    )}
                  </div>

                  {coPerformerType === 'external' && (
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Signed Consent Document (PDF/Image)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          disabled
                          value={externalConsentFile || 'No file selected'}
                          placeholder="Upload consent form..."
                          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/50 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setExternalConsentFile(`consent_form_${Date.now()}.pdf`)}
                          className="px-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-[9px] uppercase font-black tracking-widest transition"
                        >
                          Upload PDF
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAddCoPerformer}
                    className="w-full py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary transition"
                  >
                    + Add Co-Performer to List
                  </button>

                  {addedCoPerformers.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[8px] uppercase tracking-widest font-black text-white/40">Added Performers:</span>
                      <div className="flex flex-wrap gap-2">
                        {addedCoPerformers.map((p, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-xl text-[9px] font-semibold text-white/80">
                            {p.avatar && <img src={p.avatar} className="w-4 h-4 rounded-full object-cover" />}
                            <span>{p.name}</span>
                            <span className={`text-[7px] font-black uppercase px-1 rounded ${
                              p.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400 animate-pulse'
                            }`}>
                              {p.status}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCoPerformer(idx)}
                              className="text-red-400 hover:text-red-300 font-bold ml-1"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Budget */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/70 ml-1 flex items-center gap-2">
                  <DollarSign className="w-3 h-3 text-success" /> Budget Offer
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">$</span>
                  <input
                    type="number"
                    required
                    min="10"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-xs font-black text-white focus:border-success transition outline-none"
                    placeholder="50"
                  />
                </div>
              </div>

              {/* Deadline */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/70 ml-1 flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-accent" /> Deadline
                </label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-accent transition outline-none color-scheme-dark font-bold"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5 mt-2">
              <Lock className="w-4 h-4 text-white/40 shrink-0" />
              <p className="text-[8px] uppercase tracking-widest text-white/40 leading-relaxed">
                Funds are held in secure escrow until order is delivered and approved.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-black text-[10px] uppercase tracking-widest transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-primary to-accent text-black font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(102,252,241,0.3)] hover:shadow-[0_0_30px_rgba(102,252,241,0.5)] transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : mode === 'modify' ? 'Propose Changes' : 'Submit Request'} <Send className="w-3 h-3" />
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
