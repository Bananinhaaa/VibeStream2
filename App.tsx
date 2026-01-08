
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Video, UserProfile, Notification, Comment, ChatMessage } from './types';
import { INITIAL_VIDEOS } from './constants';
import Feed from './screens/Feed';
import Discover from './screens/Discover';
import Create from './screens/Create';
import Inbox from './screens/Inbox';
import Profile from './screens/Profile';
import Auth from './screens/Auth';
import AccountSwitcher from './screens/AccountSwitcher';
import AdminPanel from './screens/AdminPanel';
import { HomeIcon, SearchIcon, PlusIcon, MessageIcon, UserIcon } from './components/Icons';

type Tab = 'home' | 'discover' | 'create' | 'inbox' | 'profile' | 'admin' | 'switcher';

interface AccountData {
  profile: UserProfile;
  followingMap: Record<string, boolean>;
  email: string;
  password?: string;
}

const MASTER_ADMIN_EMAIL = 'davielucas914@gmail.com';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('vibe_logged_in') === 'true';
  });
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [viewingUser, setViewingUser] = useState<string | null>(null);
  const [activeChatUser, setActiveChatUser] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [jumpToVideoId, setJumpToVideoId] = useState<string | null>(null);

  const [accounts, setAccounts] = useState<AccountData[]>(() => {
    const saved = localStorage.getItem('vibe_accounts_v2');
    let parsed: AccountData[] = saved ? JSON.parse(saved) : [];
    
    // Se não houver contas, cria a conta Admin mestre por padrão para testes
    if (parsed.length === 0) {
      const adminAcc: AccountData = {
        email: MASTER_ADMIN_EMAIL,
        password: 'admin',
        followingMap: {},
        profile: {
          username: 'admin',
          displayName: 'Admin Supremo',
          bio: 'Criador do VibeStream',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
          email: MASTER_ADMIN_EMAIL,
          followers: 9999,
          following: 0,
          likes: 50000,
          isAdmin: true,
          isVerified: true,
          repostedVideoIds: [],
          notifications: []
        }
      };
      parsed = [adminAcc];
    }

    return parsed.map(acc => {
      if (acc.email === MASTER_ADMIN_EMAIL) {
        return { ...acc, profile: { ...acc.profile, isAdmin: true, isVerified: true, isBanned: false } };
      }
      return acc;
    });
  });

  const [videos, setVideos] = useState<Video[]>(() => {
    const saved = localStorage.getItem('vibe_videos_v2');
    const parsed = saved ? JSON.parse(saved) : INITIAL_VIDEOS;
    return parsed.length > 0 ? parsed : INITIAL_VIDEOS;
  });

  const [currentAccountIndex, setCurrentAccountIndex] = useState<number>(() => {
    const saved = localStorage.getItem('vibe_active_idx');
    const idx = saved ? parseInt(saved) : 0;
    return isNaN(idx) ? 0 : idx;
  });

  const activeAccount = useMemo(() => {
    if (accounts.length === 0) return null;
    const idx = currentAccountIndex < accounts.length ? currentAccountIndex : 0;
    return accounts[idx];
  }, [accounts, currentAccountIndex]);

  useEffect(() => {
    localStorage.setItem('vibe_accounts_v2', JSON.stringify(accounts));
    localStorage.setItem('vibe_videos_v2', JSON.stringify(videos));
    localStorage.setItem('vibe_active_idx', currentAccountIndex.toString());
    localStorage.setItem('vibe_logged_in', isLoggedIn.toString());
  }, [accounts, videos, currentAccountIndex, isLoggedIn]);

  const handleUpdateProfile = (username: string, updates: any) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.profile.username === username) {
        const { password, ...profileUpdates } = updates;
        return {
          ...acc,
          password: password || acc.password,
          profile: { ...acc.profile, ...profileUpdates }
        };
      }
      return acc;
    }));
  };

  const handleLike = (id: string) => {
    setVideos(prev => prev.map(v => {
      if (v.id === id) {
        const isLiked = !v.isLiked;
        return { ...v, isLiked, likes: isLiked ? v.likes + 1 : v.likes - 1 };
      }
      return v;
    }));
  };

  const handleFollow = (username: string) => {
    if (!activeAccount) return;
    const currentlyFollowing = !!activeAccount.followingMap[username];
    setAccounts(prev => prev.map((acc, idx) => {
      if (idx === currentAccountIndex) {
        return {
          ...acc,
          followingMap: { ...acc.followingMap, [username]: !currentlyFollowing },
          profile: { ...acc.profile, following: !currentlyFollowing ? acc.profile.following + 1 : acc.profile.following - 1 }
        };
      }
      if (acc.profile.username === username) {
        return {
          ...acc,
          profile: { ...acc.profile, followers: !currentlyFollowing ? acc.profile.followers + 1 : acc.profile.followers - 1 }
        };
      }
      return acc;
    }));
  };

  const handleRepost = (id: string) => {
    if (!activeAccount) return;
    const hasReposted = activeAccount.profile.repostedVideoIds.includes(id);
    setAccounts(prev => prev.map((acc, idx) => {
      if (idx === currentAccountIndex) {
        const newReposts = hasReposted 
          ? acc.profile.repostedVideoIds.filter(rid => rid !== id)
          : [...acc.profile.repostedVideoIds, id];
        return { ...acc, profile: { ...acc.profile, repostedVideoIds: newReposts } };
      }
      return acc;
    }));
    setVideos(prev => prev.map(v => v.id === id ? { ...v, reposts: hasReposted ? v.reposts - 1 : v.reposts + 1 } : v));
  };

  const handleAddComment = (videoId: string, text: string, parentId?: string) => {
    if (!activeAccount) return;
    const newComment: Comment = {
      id: Date.now().toString(),
      username: activeAccount.profile.username,
      displayName: activeAccount.profile.displayName,
      avatar: activeAccount.profile.avatar,
      text,
      timestamp: Date.now(),
      likes: 0,
      isVerified: activeAccount.profile.isVerified,
      replies: []
    };

    setVideos(prev => prev.map(v => {
      if (v.id === videoId) {
        if (parentId) {
          const updatedComments = v.comments.map(c => {
            if (c.id === parentId) {
              return { ...c, replies: [...(c.replies || []), newComment] };
            }
            return c;
          });
          return { ...v, comments: updatedComments };
        } else {
          return { ...v, comments: [newComment, ...v.comments] };
        }
      }
      return v;
    }));
  };

  const handleShare = (id: string) => {
    try {
      navigator.clipboard.writeText(`${window.location.origin}/video/${id}`);
      alert("Link do vídeo copiado!");
    } catch (e) {
      alert(`Vídeo ID: ${id}`);
    }
    setVideos(prev => prev.map(v => v.id === id ? { ...v, shares: v.shares + 1 } : v));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('home');
  };

  const navigateToProfile = (username: string) => {
    setViewingUser(username);
    setActiveTab('profile');
  };

  if (!isLoggedIn || !activeAccount) {
    return (
      <Auth 
        onLogin={(id, isNew, pass, rand) => {
          const existingIdx = accounts.findIndex(a => a.email === id || a.profile.username === id);
          
          if (isNew && rand && existingIdx === -1) {
            const isMasterAdmin = id === MASTER_ADMIN_EMAIL;
            const newAcc: AccountData = { 
              email: id, 
              password: pass, 
              followingMap: {}, 
              profile: { 
                ...rand, 
                bio: isMasterAdmin ? 'Admin Supremo' : '', 
                avatar: '', 
                email: id, 
                followers: isMasterAdmin ? 999 : 0, 
                following: 0, 
                likes: 0, 
                repostedVideoIds: [], 
                notifications: [], 
                isVerified: isMasterAdmin,
                isAdmin: isMasterAdmin,
                twoFactorEnabled: false
              } 
            };
            const newAccountsList = [...accounts, newAcc];
            setAccounts(newAccountsList);
            setCurrentAccountIndex(newAccountsList.length - 1);
          } else if (existingIdx !== -1) {
            setCurrentAccountIndex(existingIdx);
          }
          setIsLoggedIn(true);
        }} 
        registeredAccounts={accounts.map(acc => ({
          email: acc.email,
          username: acc.profile.username,
          password: acc.password,
          twoFactorEnabled: acc.profile.twoFactorEnabled
        }))} 
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0c] text-white overflow-hidden">
      <main className="flex-1 relative overflow-hidden">
        {activeTab === 'home' && <Feed videos={videos} currentUser={activeAccount.profile} onLike={handleLike} onFollow={handleFollow} onRepost={handleRepost} onShare={handleShare} onAddComment={handleAddComment} onNavigateToProfile={navigateToProfile} followingMap={activeAccount.followingMap} isMuted={isMuted} setIsMuted={setIsMuted} onSearchClick={() => setActiveTab('discover')} onDeleteComment={() => {}} onDeleteVideo={() => {}} onToggleComments={() => {}} onLikeComment={() => {}} initialVideoId={jumpToVideoId} onClearJump={() => setJumpToVideoId(null)} allAccounts={accounts.map(a => a.profile)} />}
        {activeTab === 'discover' && <Discover videos={videos} onNavigateToProfile={navigateToProfile} currentUser={activeAccount.profile} allAccounts={accounts} />}
        {activeTab === 'create' && <Create onAddVideo={(v) => { setVideos([v, ...videos]); setActiveTab('home'); }} currentUser={activeAccount.profile} allAccounts={accounts} />}
        {activeTab === 'inbox' && <Inbox activePartner={activeChatUser} onBack={() => setActiveChatUser(null)} currentUser={activeAccount.profile} onNavigateToProfile={navigateToProfile} allAccounts={accounts} chats={[]} onSendMessage={() => {}} onOpenChat={setActiveChatUser} onViewVideo={setJumpToVideoId} videos={videos} />}
        {activeTab === 'profile' && (
          <Profile 
            user={accounts.find(a => a.profile.username === (viewingUser || activeAccount.profile.username))?.profile || activeAccount.profile}
            videos={videos}
            isOwnProfile={!viewingUser || viewingUser === activeAccount.profile.username}
            currentUser={activeAccount.profile}
            onFollow={handleFollow}
            onLike={handleLike}
            onRepost={handleRepost}
            onShare={handleShare}
            onAddComment={handleAddComment}
            onLogout={handleLogout}
            currentAccountData={activeAccount}
            onUpdateProfile={handleUpdateProfile}
            onDeleteComment={() => {}}
            onDeleteVideo={() => {}}
            onToggleComments={() => {}}
            followingMap={activeAccount.followingMap}
            onNavigateToProfile={navigateToProfile}
            onSwitchAccount={() => setActiveTab('switcher')}
            allAccountsData={accounts}
            onOpenAdmin={() => setActiveTab('admin')}
            onLikeComment={() => {}}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
          />
        )}
        {activeTab === 'admin' && <AdminPanel accounts={accounts} videos={videos} onUpdateStats={() => {}} onUpdateVideoStats={() => {}} onDeleteAccount={() => {}} onClose={() => setActiveTab('profile')} />}
        {activeTab === 'switcher' && <AccountSwitcher accounts={accounts.map(a => a.profile)} onSelect={(u) => { setCurrentAccountIndex(accounts.findIndex(a => a.profile.username === u)); setViewingUser(null); setActiveTab('profile'); }} onAddAccount={() => setIsLoggedIn(false)} onDeleteAccount={(u) => setAccounts(prev => prev.filter(a => a.profile.username !== u))} onBack={() => setActiveTab('profile')} />}
      </main>
      <nav className={`h-[80px] border-t border-white/5 bg-black/80 backdrop-blur-xl flex items-center justify-around px-2 z-50 ${activeTab === 'switcher' || activeTab === 'admin' ? 'hidden' : ''}`}>
        <button onClick={() => { setViewingUser(null); setActiveTab('home'); }} className={`flex flex-col items-center ${activeTab === 'home' ? 'text-indigo-500' : 'text-gray-500'}`}><HomeIcon active={activeTab === 'home'} /><span className="text-[10px] mt-1 font-bold uppercase tracking-tighter">Início</span></button>
        <button onClick={() => { setViewingUser(null); setActiveTab('discover'); }} className={`flex flex-col items-center ${activeTab === 'discover' ? 'text-indigo-500' : 'text-gray-500'}`}><SearchIcon active={activeTab === 'discover'} /><span className="text-[10px] mt-1 font-bold uppercase tracking-tighter">Vibes</span></button>
        <button onClick={() => setActiveTab('create')} className="relative -top-2"><div className="w-14 h-11 bg-white rounded-2xl flex items-center justify-center shadow-xl"><PlusIcon /></div></button>
        <button onClick={() => { setViewingUser(null); setActiveTab('inbox'); }} className={`flex-col items-center flex ${activeTab === 'inbox' ? 'text-indigo-500' : 'text-gray-500'}`}><MessageIcon active={activeTab === 'inbox'} /><span className="text-[10px] mt-1 font-bold uppercase tracking-tighter">Inbox</span></button>
        <button onClick={() => { setViewingUser(null); setActiveTab('profile'); }} className={`flex flex-col items-center ${activeTab === 'profile' ? 'text-indigo-500' : 'text-gray-500'}`}><UserIcon active={activeTab === 'profile'} /><span className="text-[10px] mt-1 font-bold uppercase tracking-tighter">Perfil</span></button>
      </nav>
    </div>
  );
};

export default App;
