
import React, { useState } from 'react';
import { UserProfile, Video } from '../types';
import { formatNumber } from '../utils/formatters';

interface AdminPanelProps {
  accounts: any[];
  videos: Video[];
  onUpdateStats: (username: string, stats: Partial<UserProfile> & { password?: string }) => void;
  onUpdateVideoStats: (videoId: string, stats: Partial<Video>) => void;
  onDeleteAccount: (username: string, reason?: string) => void;
  onClose: () => void;
}

// Fixed: Destructured onDeleteAccount from the props object
const AdminPanel: React.FC<AdminPanelProps> = ({ accounts, videos, onUpdateStats, onClose, onUpdateVideoStats, onDeleteAccount }) => {
  const [activeTab, setActiveTab] = useState<'accounts' | 'videos'>('accounts');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  
  const [banReason, setBanReason] = useState('');
  const [showBanConfirm, setShowBanConfirm] = useState<string | null>(null);

  const QUICK_REASONS = [
    'Racismo / Discurso de Ódio',
    'Pornografia / Nudez',
    'Violência Extrema',
    'Spam / Golpes',
    'Direitos Autorais',
    'Comportamento Tóxico'
  ];

  const handleSaveUser = (username: string) => {
    onUpdateStats(username, editForm);
    setEditingUser(null);
  };

  const handleSaveVideo = (videoId: string) => {
    onUpdateVideoStats(videoId, editForm);
    setEditingVideo(null);
  };

  const handleConfirmBan = (username: string) => {
    if (!banReason.trim()) {
      alert("Por favor, escreva o motivo do banimento.");
      return;
    }
    // Fixed: onDeleteAccount is now accessible from destructured props
    onDeleteAccount(username, banReason);
    setShowBanConfirm(null);
    setBanReason('');
  };

  return (
    <div className="h-full w-full bg-[#0a0a0c] p-6 overflow-y-auto no-scrollbar pb-24 animate-view text-white">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter text-indigo-500">GOD MODE PANEL</h2>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Gerenciamento Supremo</p>
        </div>
        <button onClick={onClose} className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">Fechar</button>
      </header>

      <div className="flex gap-4 mb-10">
        <button onClick={() => { setActiveTab('accounts'); setEditingUser(null); setEditingVideo(null); }} className={`flex-1 py-4 rounded-3xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'accounts' ? 'bg-indigo-600 shadow-lg shadow-indigo-600/30' : 'bg-white/5 opacity-50'}`}>Contas ({accounts.length})</button>
        <button onClick={() => { setActiveTab('videos'); setEditingUser(null); setEditingVideo(null); }} className={`flex-1 py-4 rounded-3xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'videos' ? 'bg-indigo-600 shadow-lg shadow-indigo-600/30' : 'bg-white/5 opacity-50'}`}>Vídeos ({videos.length})</button>
      </div>

      {activeTab === 'accounts' ? (
        <div className="space-y-6">
          {accounts.map(acc => (
            <div key={acc.profile.username} className={`bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6 animate-view ${acc.profile.isAdmin ? 'border-indigo-500/30 bg-indigo-500/5' : ''}`}>
              <div className="flex justify-between items-center">
                <div className="flex gap-5">
                   <div className="w-16 h-16 bg-indigo-900 rounded-[1.5rem] flex items-center justify-center font-black text-xl overflow-hidden border border-white/10 shrink-0">
                      {acc.profile.avatar ? <img src={acc.profile.avatar} className="w-full h-full object-cover" /> : acc.profile.displayName.charAt(0)}
                   </div>
                   <div className="overflow-hidden">
                      <h4 className="font-black text-lg italic tracking-tight flex items-center gap-2 truncate">
                        {acc.profile.displayName}
                        {acc.profile.isAdmin && <span className="bg-indigo-500 text-[8px] px-2 py-1 rounded-md text-white">ADMIN</span>}
                        {acc.profile.isBanned && <span className="bg-rose-600 text-[8px] px-2 py-1 rounded-md text-white">BANIDO</span>}
                      </h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">@{acc.profile.username}</p>
                      {acc.profile.isBanned && (
                        <p className="text-[9px] font-bold text-rose-500 mt-1 uppercase italic leading-tight">Motivo: {acc.profile.banReason}</p>
                      )}
                   </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                   <button onClick={() => { setEditingUser(acc.profile.username); setEditForm({ ...acc.profile, password: acc.password }); }} className="px-6 py-2 bg-indigo-600/20 text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 active:scale-95 transition-all">Configurar</button>
                   {acc.email !== 'davielucas914@gmail.com' && (
                     <button 
                       // Fixed: onDeleteAccount is now properly defined from props destructuring
                       onClick={() => acc.profile.isBanned ? onDeleteAccount(acc.profile.username) : setShowBanConfirm(acc.profile.username)} 
                       className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border active:scale-95 transition-all ${acc.profile.isBanned ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/20' : 'bg-rose-600/20 text-rose-400 border-rose-500/20'}`}
                     >
                       {acc.profile.isBanned ? 'Desbanir' : 'Banir'}
                     </button>
                   )}
                </div>
              </div>

              {showBanConfirm === acc.profile.username && (
                <div className="bg-rose-600/5 p-6 rounded-3xl border border-rose-500/20 space-y-5">
                   <div className="flex justify-between items-center">
                      <p className="text-[10px] font-black uppercase text-rose-500 tracking-widest">Motivo do Banimento</p>
                      <button onClick={() => setShowBanConfirm(null)} className="text-[8px] font-black text-gray-500 uppercase">Fechar</button>
                   </div>
                   <textarea 
                     value={banReason} 
                     onChange={e => setBanReason(e.target.value)}
                     placeholder="Escreva aqui..."
                     className="w-full bg-black/40 border border-rose-500/20 rounded-2xl p-4 text-sm text-white outline-none h-24 resize-none"
                   />
                   <div className="flex flex-wrap gap-2">
                      {QUICK_REASONS.map(r => (
                        <button key={r} onClick={() => setBanReason(r)} className="bg-white/5 hover:bg-white/10 border border-white/5 px-3 py-1.5 rounded-lg text-[9px] font-bold text-gray-400">{r}</button>
                      ))}
                   </div>
                   <button onClick={() => handleConfirmBan(acc.profile.username)} className="w-full bg-rose-600 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest">CONFIRMAR BANIMENTO</button>
                </div>
              )}

              {editingUser === acc.profile.username && (
                <div className="bg-black/40 p-8 rounded-[3rem] grid grid-cols-2 gap-6 border border-white/5 animate-view">
                   <div className="col-span-2 space-y-4">
                      <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Senha Forçada</label>
                      <input type="text" value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-black text-rose-500 outline-none" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase text-gray-500 text-center block">Seguidores</label>
                     <input type="number" value={editForm.followers} onChange={e => setEditForm({...editForm, followers: parseInt(e.target.value) || 0})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-black text-center outline-none" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase text-gray-500 text-center block">Seguindo</label>
                     <input type="number" value={editForm.following} onChange={e => setEditForm({...editForm, following: parseInt(e.target.value) || 0})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-black text-center outline-none" />
                   </div>
                   <div className="col-span-2 grid grid-cols-2 gap-4">
                      <button onClick={() => setEditForm({...editForm, isAdmin: !editForm.isAdmin})} className={`py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${editForm.isAdmin ? 'bg-indigo-600 border-indigo-500' : 'bg-white/10 border-white/10 opacity-50'}`}>ADMIN: {editForm.isAdmin ? 'SIM' : 'NÃO'}</button>
                      <button onClick={() => setEditForm({...editForm, isVerified: !editForm.isVerified})} className={`py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${editForm.isVerified ? 'bg-indigo-600 border-indigo-500' : 'bg-white/10 border-white/10 opacity-50'}`}>VERIFICADO: {editForm.isVerified ? 'SIM' : 'NÃO'}</button>
                   </div>
                   <button onClick={() => handleSaveUser(acc.profile.username)} className="col-span-2 bg-white text-black py-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em]">Salvar Alterações</button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
           {videos.map(video => (
             <div key={video.id} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6 animate-view">
                <div className="flex justify-between items-center">
                   <div className="flex gap-5">
                      <div className="w-16 h-24 bg-indigo-900 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                        <video src={video.url} className="w-full h-full object-cover" />
                      </div>
                      <div className="overflow-hidden text-white">
                        <h4 className="font-black text-sm truncate max-w-[200px]">{video.description}</h4>
                        <div className="flex gap-4 mt-3">
                           <div className="flex flex-col"><span className="text-[9px] font-black text-gray-500 uppercase">Likes</span><span className="text-xs font-black">{formatNumber(video.likes)}</span></div>
                           <div className="flex flex-col"><span className="text-[9px] font-black text-gray-500 uppercase">Shares</span><span className="text-xs font-black">{formatNumber(video.shares)}</span></div>
                        </div>
                      </div>
                   </div>
                   <button onClick={() => { setEditingVideo(video.id); setEditForm(video); }} className="px-6 py-4 bg-indigo-600/20 text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 active:scale-95 transition-all shrink-0">Editar</button>
                </div>

                {editingVideo === video.id && (
                  <div className="bg-black/40 p-8 rounded-[3rem] grid grid-cols-2 gap-6 border border-white/5 animate-view">
                    <div className="col-span-2 space-y-2">
                       <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Descrição / Legenda</label>
                       <textarea 
                         value={editForm.description} 
                         onChange={e => setEditForm({...editForm, description: e.target.value})} 
                         className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none h-24 resize-none focus:border-indigo-500" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-gray-500 text-center block tracking-widest">Likes</label>
                       <input 
                         type="number" 
                         value={editForm.likes} 
                         onChange={e => setEditForm({...editForm, likes: parseInt(e.target.value) || 0})} 
                         className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-black text-center outline-none" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-gray-500 text-center block tracking-widest">Shares</label>
                       <input 
                         type="number" 
                         value={editForm.shares} 
                         onChange={e => setEditForm({...editForm, shares: parseInt(e.target.value) || 0})} 
                         className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-black text-center outline-none" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-gray-500 text-center block tracking-widest">Republicações</label>
                       <input 
                         type="number" 
                         value={editForm.reposts} 
                         onChange={e => setEditForm({...editForm, reposts: parseInt(e.target.value) || 0})} 
                         className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-black text-center outline-none" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-gray-500 text-center block tracking-widest">Música</label>
                       <input 
                         type="text" 
                         value={editForm.music} 
                         onChange={e => setEditForm({...editForm, music: e.target.value})} 
                         className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-black text-center outline-none" 
                       />
                    </div>
                    <button 
                      onClick={() => handleSaveVideo(video.id)} 
                      className="col-span-2 bg-white text-black py-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
                    >
                      Salvar Vídeo
                    </button>
                    <button 
                      onClick={() => setEditingVideo(null)} 
                      className="col-span-2 bg-white/5 text-gray-500 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
