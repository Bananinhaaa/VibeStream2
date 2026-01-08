
import React, { useState, useRef, useMemo } from 'react';
import { Video, UserProfile } from '../types';
import { VerifiedBadge, HeartIcon, CloseIcon, TrashIcon } from '../components/Icons';
import VideoPlayer from '../components/VideoPlayer';
import { formatNumber } from '../utils/formatters';
import { renderWithMentions } from '../utils/mentionHelper';

interface ProfileProps {
  videos: Video[];
  user: UserProfile;
  currentAccountData: any;
  onUpdateProfile: (username: string, updates: any) => void;
  onLogout: () => void;
  isOwnProfile?: boolean;
  currentUser: UserProfile;
  onFollow: (username: string) => void;
  onLike: (id: string) => void;
  onRepost: (id: string) => void;
  onShare: (id: string) => void;
  onAddComment: (videoId: string, text: string) => void;
  onDeleteComment: (vId: string, cId: string) => void;
  onToggleComments: (vId: string) => void;
  onDeleteVideo: (id: string) => void;
  followingMap: Record<string, boolean>;
  onNavigateToProfile: (username: string) => void;
  onSwitchAccount: () => void;
  allAccountsData: any[];
  onOpenAdmin?: () => void;
  onLikeComment: (vId: string, cId: string) => void;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
}

const Profile: React.FC<ProfileProps> = ({ 
  videos, user, currentAccountData, onUpdateProfile, onLogout, isOwnProfile, currentUser, 
  onFollow, onLike, onRepost, onShare, onAddComment, 
  onDeleteComment, onToggleComments, onDeleteVideo,
  followingMap, onNavigateToProfile, onSwitchAccount, allAccountsData, onOpenAdmin, 
  onLikeComment, isMuted, setIsMuted
}) => {
  const [activeTab, setActiveTab] = useState<'videos' | 'reposts'>('videos');
  const [connectionsModal, setConnectionsModal] = useState<{ open: boolean; type: 'followers' | 'following' }>({ open: false, type: 'followers' });
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [editForm, setEditForm] = useState<UserProfile>({...user});
  const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'security'>('general');

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const myVideos = videos.filter(v => v.username === user.username);
  const repostedVideos = videos.filter(v => user.repostedVideoIds.includes(v.id));

  const handleSaveProfile = () => {
    onUpdateProfile(user.username, editForm);
    setIsEditing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggle2FA = () => {
    const newVal = !editForm.twoFactorEnabled;
    setEditForm({ ...editForm, twoFactorEnabled: newVal });
    alert(newVal ? "🛡️ VIBE SHIELD ATIVADO: Sua conta agora está protegida por 2FA." : "⚠️ SEGURANÇA REDUZIDA: O 2FA foi desativado.");
  };

  const currentVideos = activeTab === 'videos' ? myVideos : repostedVideos;

  return (
    <div className="h-full animate-view overflow-y-auto no-scrollbar pb-24 bg-black text-white">
      {/* Header do Perfil */}
      <div className="relative h-64 w-full">
        {user.banner ? <img src={user.banner} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-indigo-950 to-black" />}
        <div className="absolute top-6 right-6 flex gap-3">
          {isOwnProfile && currentUser.isAdmin && (
            <button onClick={onOpenAdmin} className="p-3 bg-indigo-600 rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-lg border border-white/20">GOD MODE</button>
          )}
          {isOwnProfile && (
            <button onClick={onSwitchAccount} className="p-3 bg-white/10 backdrop-blur-md rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10">Trocar Conta</button>
          )}
        </div>
        <div className="absolute -bottom-14 left-6">
          <div className="w-32 h-32 rounded-[2.8rem] bg-black p-1.5 border border-white/10 overflow-hidden shadow-2xl">
             {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-[2.5rem] object-cover" /> : <div className="w-full h-full rounded-[2.5rem] bg-indigo-600 flex items-center justify-center text-4xl font-black">{user.displayName.charAt(0)}</div>}
          </div>
        </div>
      </div>

      <div className="mt-16 px-6">
        {/* Info do Usuário */}
        <div className="flex justify-between items-start mb-6">
          <div className="max-w-[70%]">
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-black tracking-tighter italic truncate">{user.displayName}</h2>
              {user.isVerified && <VerifiedBadge size="22" />}
            </div>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest opacity-60">@{user.username}</p>
          </div>
          {isOwnProfile ? (
            <button onClick={() => { setEditForm({...user}); setIsEditing(true); }} className="bg-white/5 border border-white/10 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all hover:bg-white/10">Editar Perfil</button>
          ) : (
             <button onClick={() => onFollow(user.username)} className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${followingMap[user.username] ? 'bg-white/10 border border-white/10 text-white' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'}`}>{followingMap[user.username] ? 'Seguindo' : 'Seguir'}</button>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-8 mb-8 bg-white/5 w-fit px-6 py-4 rounded-3xl border border-white/5">
          <button onClick={() => setConnectionsModal({ open: true, type: 'followers' })} className="text-left group">
            <p className="font-black text-xl group-active:scale-95 transition-transform">{formatNumber(user.followers)}</p>
            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Seguidores</p>
          </button>
          <button onClick={() => setConnectionsModal({ open: true, type: 'following' })} className="text-left border-l border-white/10 pl-8 group">
            <p className="font-black text-xl group-active:scale-95 transition-transform">{formatNumber(user.following)}</p>
            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Seguindo</p>
          </button>
        </div>

        <div className="text-sm text-gray-300 mb-8 max-w-sm leading-relaxed">
          {user.bio || "Nenhuma bio definida ainda."}
        </div>

        {/* Tabs de Conteúdo */}
        <div className="flex gap-4 mb-6">
          <button onClick={() => setActiveTab('videos')} className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'videos' ? 'bg-indigo-600 shadow-lg shadow-indigo-600/20' : 'bg-white/5 hover:bg-white/10'}`}>Vídeos ({myVideos.length})</button>
          <button onClick={() => setActiveTab('reposts')} className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'reposts' ? 'bg-indigo-600 shadow-lg shadow-indigo-600/20' : 'bg-white/5 hover:bg-white/10'}`}>Republicados ({repostedVideos.length})</button>
        </div>

        {/* Grid de Vídeos */}
        <div className="grid grid-cols-3 gap-1 px-1">
          {currentVideos.map(video => (
            <div key={video.id} onClick={() => setSelectedVideo(video)} className="aspect-[9/16] bg-white/5 relative overflow-hidden group cursor-pointer border border-white/5 active:scale-[0.98] transition-all">
              <video src={video.url} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex flex-col items-center gap-1">
                  <HeartIcon liked={true} />
                  <span className="text-[10px] font-black">{formatNumber(video.likes)}</span>
                </div>
              </div>
            </div>
          ))}
          {currentVideos.length === 0 && (
            <div className="col-span-3 py-20 text-center opacity-20 italic">
               Nenhum vídeo nesta categoria.
            </div>
          )}
        </div>
      </div>

      {/* Modal de Configurações Completo */}
      {isEditing && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setIsEditing(false)} />
          <div className="relative w-full max-w-lg bg-[#0c0c0e] rounded-[3.5rem] p-10 border border-white/10 animate-view shadow-2xl h-[85vh] overflow-y-auto no-scrollbar">
            
            <div className="flex flex-col mb-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-indigo-500">Configurar</h3>
                <button onClick={() => setIsEditing(false)} className="p-2 bg-white/5 rounded-full"><CloseIcon /></button>
              </div>
              
              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                <button 
                  onClick={() => setActiveSettingsTab('general')} 
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSettingsTab === 'general' ? 'bg-white text-black' : 'text-gray-500'}`}
                >
                  Perfil
                </button>
                <button 
                  onClick={() => setActiveSettingsTab('security')} 
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSettingsTab === 'security' ? 'bg-white text-black' : 'text-gray-500'}`}
                >
                  Segurança
                </button>
              </div>
            </div>

            {activeSettingsTab === 'general' ? (
              <div className="space-y-8 animate-view">
                {/* Inputs de Arquivo Ocultos */}
                <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
                <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />

                {/* Imagens */}
                <div className="grid gap-8">
                   <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">Foto de Perfil</label>
                     <div className="flex items-center gap-6">
                       <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 overflow-hidden shrink-0 shadow-xl">
                         {editForm.avatar ? <img src={editForm.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-20 text-2xl font-black">?</div>}
                       </div>
                       <button 
                         onClick={() => avatarInputRef.current?.click()}
                         className="flex-1 bg-indigo-600/10 text-indigo-500 border border-indigo-500/20 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600/20 transition-all flex items-center justify-center gap-2"
                       >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeWidth="2" /><path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2" /></svg>
                         Escolher Foto
                       </button>
                     </div>
                   </div>

                   <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">Capa do Perfil</label>
                     <div className="relative h-32 w-full rounded-3xl overflow-hidden bg-white/5 border border-white/10 group cursor-pointer" onClick={() => bannerInputRef.current?.click()}>
                       {editForm.banner ? <img src={editForm.banner} className="w-full h-full object-cover opacity-60" /> : <div className="w-full h-full flex items-center justify-center opacity-20 italic text-[10px] uppercase font-black">Nenhum Banner</div>}
                       <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-[10px] font-black uppercase tracking-widest">Alterar Capa</span>
                       </div>
                     </div>
                   </div>
                </div>

                {/* Info */}
                <div className="grid gap-6">
                   <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">Nome de Exibição</label>
                     <input type="text" value={editForm.displayName} onChange={e => setEditForm({...editForm, displayName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-indigo-500" />
                   </div>

                   <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">Bio / Descrição</label>
                     <textarea placeholder="Conte algo sobre você..." value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none h-24 resize-none focus:border-indigo-500" />
                   </div>

                   <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">Telefone de Contato</label>
                     <input type="tel" placeholder="+55..." value={editForm.phone || ''} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-indigo-500" />
                   </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-view">
                <div className="bg-indigo-600/10 p-8 rounded-[2.5rem] border border-indigo-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth="2.5" /></svg>
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-widest">Vibe Shield</p>
                        <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest opacity-60">Autenticação 2FA</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleToggle2FA}
                      className={`w-16 h-9 rounded-full transition-all relative ${editForm.twoFactorEnabled ? 'bg-indigo-600' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1.5 w-6 h-6 rounded-full bg-white shadow-md transition-all ${editForm.twoFactorEnabled ? 'right-1.5' : 'left-1.5'}`} />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-relaxed font-medium">Ative a proteção de duas etapas para garantir que ninguém além de você acesse sua conta. O código será enviado para o e-mail: <span className="text-white underline">{editForm.email}</span></p>
                </div>
                
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">Gestão de Sessões</label>
                  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black">iPhone 15 Pro Max</p>
                      <p className="text-[8px] text-emerald-500 font-black uppercase mt-1">Conectado Agora</p>
                    </div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-12 space-y-4">
              <button onClick={handleSaveProfile} className="w-full bg-indigo-600 py-5 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all">Salvar Alterações</button>
              <button onClick={onLogout} className="w-full bg-rose-600/10 text-rose-500 py-5 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] border border-rose-500/20 hover:bg-rose-600/20 transition-colors">Sair da Conta</button>
            </div>
          </div>
        </div>
      )}

      {/* Visualizador de Vídeo Selecionado */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[110] bg-black">
          <button onClick={() => setSelectedVideo(null)} className="absolute top-12 left-6 z-[120] bg-black/40 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest backdrop-blur-md border border-white/10">Voltar</button>
          <VideoPlayer video={selectedVideo} isActive={true} onLike={onLike} onFollow={onFollow} onRepost={onRepost} onShare={onShare} onNavigateToProfile={onNavigateToProfile} currentUser={currentUser} onAddComment={onAddComment} onDeleteComment={onDeleteComment} onToggleComments={onToggleComments} onDeleteVideo={(vId) => { onDeleteVideo(vId); setSelectedVideo(null); }} isFollowing={!!followingMap[selectedVideo.username]} onLikeComment={onLikeComment} isMuted={isMuted} setIsMuted={setIsMuted} isRepostedByMe={currentUser.repostedVideoIds.includes(selectedVideo.id)} />
        </div>
      )}
    </div>
  );
};

export default Profile;
