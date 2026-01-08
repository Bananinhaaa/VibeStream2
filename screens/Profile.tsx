
import React, { useState, useRef, useMemo } from 'react';
import { Video, UserProfile } from '../types';
import { VerifiedBadge, HeartIcon, CloseIcon } from '../components/Icons';
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
  
  const [editForm, setEditForm] = useState(user);
  const [editPassword, setEditPassword] = useState({ current: '', new: '', confirm: '' });
  const [editError, setEditError] = useState('');

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const myVideos = videos.filter(v => v.username === user.username);
  const repostedVideos = videos.filter(v => user.repostedVideoIds.includes(v.id));

  const isAdmin = !!currentUser.isAdmin;
  const isTargetVerified = !!user.isVerified;
  
  const canSeeFollowers = !isTargetVerified || isAdmin || isOwnProfile;
  const canSeeFollowing = true; 
  
  const followersList = useMemo(() => {
    if (!canSeeFollowers) return [];
    return allAccountsData
      .filter(acc => acc.followingMap[user.username])
      .map(acc => acc.profile);
  }, [allAccountsData, user.username, canSeeFollowers]);

  const followingList = useMemo(() => {
    const targetAcc = allAccountsData.find(acc => acc.profile.username === user.username);
    if (!targetAcc) return [];
    return allAccountsData
      .filter(acc => targetAcc.followingMap[acc.profile.username])
      .map(acc => acc.profile);
  }, [allAccountsData, user.username]);

  const handleOpenConnections = (type: 'followers' | 'following') => {
    if (type === 'followers' && !canSeeFollowers) {
      alert("A lista de seguidores de usuários verificados é privada.");
      return;
    }
    setConnectionsModal({ open: true, type });
  };

  const handleSaveProfile = () => {
    setEditError('');
    if (editPassword.new || editPassword.current) {
      if (editPassword.current !== currentAccountData.password) {
        setEditError('Senha atual incorreta.');
        return;
      }
      if (editPassword.new !== editPassword.confirm) {
        setEditError('As novas senhas não coincidem.');
        return;
      }
      if (editPassword.new.length < 4) {
        setEditError('A nova senha deve ter pelo menos 4 caracteres.');
        return;
      }
    }
    const updates: any = { ...editForm };
    if (editPassword.new) updates.password = editPassword.new;
    onUpdateProfile(user.username, updates);
    setIsEditing(false);
    setEditPassword({ current: '', new: '', confirm: '' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, [type]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const currentVideos = activeTab === 'videos' ? myVideos : repostedVideos;

  return (
    <div className="h-full animate-view overflow-y-auto no-scrollbar pb-24 bg-black text-white">
      <div className="relative h-60 w-full">
        {user.banner ? <img src={user.banner} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-indigo-950 to-black" />}
        <div className="absolute top-6 right-6 flex gap-3">
          {isOwnProfile && isAdmin && (
            <button onClick={onOpenAdmin} className="p-3 bg-indigo-600 rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/40 border border-white/20">GOD MODE PANEL</button>
          )}
          {isOwnProfile && (
            <button onClick={onSwitchAccount} className="p-3 bg-white/10 backdrop-blur-md rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10">Trocar Conta</button>
          )}
        </div>
        <div className="absolute -bottom-14 left-6">
          <div className="w-28 h-28 rounded-[2.5rem] bg-black p-1 border border-white/10 overflow-hidden shadow-2xl">
             {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-[2.3rem] object-cover" /> : <div className="w-full h-full rounded-[2.3rem] bg-indigo-600 flex items-center justify-center text-3xl font-black">{user.displayName.charAt(0)}</div>}
          </div>
        </div>
      </div>

      <div className="mt-16 px-6">
        <div className="flex justify-between items-start mb-6">
          <div className="max-w-[70%]">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black tracking-tighter italic truncate">{user.displayName}</h2>
              {user.isVerified && <VerifiedBadge size="20" />}
            </div>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest opacity-60">@{user.username}</p>
          </div>
          {isOwnProfile ? (
            <button onClick={() => { setEditForm(user); setIsEditing(true); }} className="bg-white/5 border border-white/10 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Configurações</button>
          ) : (
             <button onClick={() => onFollow(user.username)} className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${followingMap[user.username] ? 'bg-white/10 border border-white/10 text-white' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'}`}>{followingMap[user.username] ? 'Seguindo' : 'Seguir'}</button>
          )}
        </div>

        <div className="flex gap-8 mb-8 bg-white/5 w-fit px-6 py-4 rounded-3xl border border-white/5">
          <button onClick={() => handleOpenConnections('followers')} className={`text-left group relative ${!canSeeFollowers ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-2">
              <p className="font-black text-lg group-active:scale-95 transition-transform">{formatNumber(user.followers)}</p>
              {!canSeeFollowers && <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>}
            </div>
            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Seguidores</p>
          </button>
          <button onClick={() => handleOpenConnections('following')} className="text-left border-l border-white/10 pl-8 group">
            <p className="font-black text-lg group-active:scale-95 transition-transform">{formatNumber(user.following)}</p>
            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Seguindo</p>
          </button>
        </div>

        <div className="text-sm text-gray-300 mb-6 max-w-sm leading-relaxed">
          {user.bio ? renderWithMentions(user.bio, onNavigateToProfile) : "Sem bio definida."}
        </div>

        <div className="flex gap-4 mb-6">
          <button onClick={() => setActiveTab('videos')} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'videos' ? 'bg-indigo-600 shadow-lg shadow-indigo-600/20' : 'bg-white/5 hover:bg-white/10'}`}>Meus Vídeos</button>
          <button onClick={() => setActiveTab('reposts')} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'reposts' ? 'bg-indigo-600 shadow-lg shadow-indigo-600/20' : 'bg-white/5 hover:bg-white/10'}`}>Republicados</button>
        </div>

        <div className="grid grid-cols-3 gap-1">
          {currentVideos.map(video => (
            <div key={video.id} onClick={() => setSelectedVideo(video)} className="aspect-[9/16] bg-white/5 relative overflow-hidden group cursor-pointer border border-white/5 active:scale-[0.98] transition-all">
              <video src={video.url} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><HeartIcon liked={video.isLiked} /></div>
            </div>
          ))}
        </div>
      </div>

      {/* Connections Modal (Followers/Following List) */}
      {connectionsModal.open && (
        <div className="fixed inset-0 z-[400] flex flex-col bg-black animate-view">
          <header className="p-6 border-b border-white/10 flex items-center gap-4">
             <button onClick={() => setConnectionsModal({ ...connectionsModal, open: false })} className="p-2 bg-white/5 rounded-full"><CloseIcon /></button>
             <h3 className="text-sm font-black uppercase tracking-widest">{connectionsModal.type === 'followers' ? 'Seguidores' : 'Seguindo'}</h3>
          </header>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
             {(connectionsModal.type === 'followers' ? followersList : followingList).map(u => (
               <div key={u.username} onClick={() => { onNavigateToProfile(u.username); setConnectionsModal({ ...connectionsModal, open: false }); }} className="flex items-center gap-4 p-4 bg-white/5 rounded-3xl border border-white/5 cursor-pointer">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 shrink-0">
                    {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-indigo-900 flex items-center justify-center font-black uppercase">{u.username.charAt(0)}</div>}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-black flex items-center gap-1 truncate">{u.displayName} {u.isVerified && <VerifiedBadge size="12" />}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">@{u.username}</p>
                  </div>
               </div>
             ))}
             {(connectionsModal.type === 'followers' ? followersList : followingList).length === 0 && (
               <div className="h-full flex flex-col items-center justify-center opacity-30 italic text-sm"><p>Ninguém encontrado.</p></div>
             )}
          </div>
        </div>
      )}

      {isEditing && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setIsEditing(false)} />
          <div className="relative w-full max-w-lg bg-[#0c0c0e] rounded-[3rem] p-10 border border-white/10 animate-view shadow-2xl h-[90vh] overflow-y-auto no-scrollbar">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-10 text-indigo-500">Configurações de Vibe</h3>
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Mídia Visual</label>
                <div className="flex gap-4">
                  <div onClick={() => avatarInputRef.current?.click()} className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center cursor-pointer border-2 border-dashed border-white/10 overflow-hidden shrink-0">
                     {editForm.avatar ? <img src={editForm.avatar} className="w-full h-full object-cover" /> : <span className="text-[9px] font-black text-gray-500 uppercase">Avatar</span>}
                  </div>
                  <div onClick={() => bannerInputRef.current?.click()} className="flex-1 h-24 bg-white/5 rounded-3xl flex items-center justify-center cursor-pointer border-2 border-dashed border-white/10 overflow-hidden">
                     {editForm.banner ? <img src={editForm.banner} className="w-full h-full object-cover" /> : <span className="text-[9px] font-black text-gray-500 uppercase">Capa</span>}
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="grid gap-4">
                   <input type="text" placeholder="Username" value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value.toLowerCase().replace(/\s/g, '_')})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-indigo-500" />
                   <input type="text" placeholder="Nome" value={editForm.displayName} onChange={e => setEditForm({...editForm, displayName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-indigo-500" />
                   <textarea placeholder="Bio" value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none h-24 resize-none focus:border-indigo-500" />
                </div>
              </div>
              <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'avatar')} />
              <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'banner')} />
              <button onClick={handleSaveProfile} className="w-full bg-indigo-600 py-5 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all">Salvar Alterações</button>
              <button onClick={onLogout} className="w-full bg-rose-600/10 text-rose-500 py-5 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] border border-rose-500/20 active:scale-95 transition-all">Sair da Conta</button>
            </div>
          </div>
        </div>
      )}

      {selectedVideo && (
        <div className="fixed inset-0 z-[110] bg-black">
          <button onClick={() => setSelectedVideo(null)} className="absolute top-12 left-6 z-[120] bg-black/40 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest backdrop-blur-md border border-white/10 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3"/></svg> Voltar
          </button>
          <VideoPlayer video={selectedVideo} isActive={true} onLike={onLike} onFollow={onFollow} onRepost={onRepost} onShare={onShare} onNavigateToProfile={onNavigateToProfile} currentUser={currentUser} onAddComment={onAddComment} onDeleteComment={onDeleteComment} onToggleComments={onToggleComments} onDeleteVideo={(vId) => { onDeleteVideo(vId); setSelectedVideo(null); }} isFollowing={!!followingMap[selectedVideo.username]} onLikeComment={onLikeComment} isMuted={isMuted} setIsMuted={setIsMuted} isRepostedByMe={currentUser.repostedVideoIds.includes(selectedVideo.id)} />
        </div>
      )}
    </div>
  );
};

export default Profile;
