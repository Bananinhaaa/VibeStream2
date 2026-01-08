
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [viewingUser, setViewingUser] = useState<string | null>(null);
  const [activeChatUser, setActiveChatUser] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [jumpToVideoId, setJumpToVideoId] = useState<string | null>(null);

  const [accounts, setAccounts] = useState<AccountData[]>(() => {
    const saved = localStorage.getItem('vibe_accounts_v1');
    let parsed: AccountData[] = saved ? JSON.parse(saved) : [];
    
    return parsed.map(acc => {
      if (acc.email === MASTER_ADMIN_EMAIL) {
        return { ...acc, profile: { ...acc.profile, isAdmin: true, isVerified: true, isBanned: false } };
      }
      return acc;
    });
  });

  const [videos, setVideos] = useState<Video[]>(() => {
    const saved = localStorage.getItem('vibe_videos_v1');
    return saved ? JSON.parse(saved) : INITIAL_VIDEOS;
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
    localStorage.setItem('vibe_accounts_v1', JSON.stringify(accounts));
    localStorage.setItem('vibe_videos_v1', JSON.stringify(videos));
    localStorage.setItem('vibe_active_idx', currentAccountIndex.toString());
  }, [accounts, videos, currentAccountIndex]);

  const notifyMentions = (text: string, videoId: string, fromUser: UserProfile) => {
    const mentions = text.match(/@(\w+)/g);
    if (!mentions) return;

    const uniqueMentionedUsers = [...new Set(mentions.map(m => m.substring(1)))];

    setAccounts(prev => prev.map(acc => {
      if (uniqueMentionedUsers.includes(acc.profile.username) && acc.profile.username !== fromUser.username) {
        const newNotif: Notification = {
          id: Date.now().toString() + Math.random(),
          type: 'mention',
          fromUser: fromUser.username,
          fromAvatar: fromUser.avatar,
          timestamp: Date.now(),
          text: 'mencionou você em um vídeo',
          videoId: videoId
        };
        return {
          ...acc,
          profile: {
            ...acc.profile,
            notifications: [newNotif, ...acc.profile.notifications]
          }
        };
      }
      return acc;
    }));
  };

  const handleUpdateStats = (username: string, stats: Partial<UserProfile> & { password?: string }) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.profile.username === username) {
        const { password, ...profileStats } = stats;
        const isAdminValue = acc.email === MASTER_ADMIN_EMAIL ? true : profileStats.isAdmin;
        return {
          ...acc,
          password: password || acc.password,
          profile: { ...acc.profile, ...profileStats, isAdmin: isAdminValue }
        };
      }
      return acc;
    }));
  };

  const handleUpdateVideoStats = (videoId: string, stats: Partial<Video>) => {
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, ...stats } : v));
  };

  const handleDeleteAccountAdmin = (username: string, reason?: string) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.profile.username === username) {
        if (acc.email === MASTER_ADMIN_EMAIL) return acc;
        const isCurrentlyBanned = acc.profile.isBanned;
        return {
          ...acc,
          profile: { 
            ...acc.profile, 
            isBanned: !isCurrentlyBanned, 
            banReason: !isCurrentlyBanned ? (reason || 'Violação dos Termos de Uso') : undefined 
          }
        };
      }
      return acc;
    }));
  };

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
      timestamp: Date.now(), // Agora salva o número do timestamp atual
      likes: 0,
      isVerified: activeAccount.profile.isVerified,
      replies: []
    };

    let parentCommentOwner: string | null = null;

    setVideos(prev => prev.map(v => {
      if (v.id === videoId) {
        if (parentId) {
          const updatedComments = v.comments.map(c => {
            if (c.id === parentId) {
              parentCommentOwner = c.username;
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

    // Notificar resposta
    if (parentCommentOwner && parentCommentOwner !== activeAccount.profile.username) {
      setAccounts(prev => prev.map(acc => {
        if (acc.profile.username === parentCommentOwner) {
          const newNotif: Notification = {
            id: Date.now().toString() + Math.random(),
            type: 'reply',
            fromUser: activeAccount.profile.username,
            fromAvatar: activeAccount.profile.avatar,
            timestamp: Date.now(),
            text: 'respondeu ao seu comentário',
            videoId: videoId
          };
          return { ...acc, profile: { ...acc.profile, notifications: [newNotif, ...acc.profile.notifications] } };
        }
        return acc;
      }));
    }

    // Detectar menções no comentário
    notifyMentions(text, videoId, activeAccount.profile);
  };

  const handleDeleteComment = (videoId: string, commentId: string) => {
    setVideos(prev => prev.map(v => {
      if (v.id === videoId) {
        const filteredMain = v.comments.filter(c => c.id !== commentId);
        const updatedComments = filteredMain.map(c => ({
          ...c,
          replies: c.replies ? c.replies.filter(r => r.id !== commentId) : []
        }));
        return { ...v, comments: updatedComments };
      }
      return v;
    }));
  };

  const handleLikeComment = (videoId: string, commentId: string) => {
    setVideos(prev => prev.map(v => {
      if (v.id === videoId) {
        const updatedComments = v.comments.map(c => {
          if (c.id === commentId) {
            const isLiked = !c.isLikedByMe;
            return { ...c, isLikedByMe: isLiked, likes: isLiked ? c.likes + 1 : c.likes - 1 };
          }
          if (c.replies && c.replies.length > 0) {
            const updatedReplies = c.replies.map(r => {
              if (r.id === commentId) {
                const isLiked = !r.isLikedByMe;
                return { ...r, isLikedByMe: isLiked, likes: isLiked ? r.likes + 1 : r.likes - 1 };
              }
              return r;
            });
            return { ...c, replies: updatedReplies };
          }
          return c;
        });
        return { ...v, comments: updatedComments };
      }
      return v;
    }));
  };

  const handleShare = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/video/${id}`);
    setVideos(prev => prev.map(v => v.id === id ? { ...v, shares: v.shares + 1 } : v));
    alert("Link do vídeo copiado!");
  };

  const handleLogout = () => {
    const currentUsername = activeAccount?.profile.username;
    if (currentUsername) {
      const newAccounts = accounts.filter(a => a.profile.username !== currentUsername);
      setAccounts(newAccounts);
      setCurrentAccountIndex(0);
    }
    setIsLoggedIn(false);
    setActiveTab('home');
  };

  const navigateToProfile = (username: string) => {
    setViewingUser(username);
    setActiveTab('profile');
  };

  const handleViewVideo = (vId: string) => {
    setJumpToVideoId(vId);
    setActiveTab('home');
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
                bio: isMasterAdmin ? 'Administrador Supremo do VibeStream' : '', 
                avatar: '', 
                email: id, 
                followers: isMasterAdmin ? 999 : 0, 
                following: 0, 
                likes: 0, 
                repostedVideoIds: [], 
                notifications: [], 
                isVerified: isMasterAdmin,
                isAdmin: isMasterAdmin
              } 
            };
            const newAccountsList = [...accounts, newAcc];
            setAccounts(newAccountsList);
            setCurrentAccountIndex(newAccountsList.length - 1);
          } else if (existingIdx !== -1) {
            if (id === MASTER_ADMIN_EMAIL) {
               setAccounts(prev => prev.map((acc, i) => 
                 i === existingIdx ? { ...acc, profile: { ...acc.profile, isAdmin: true, isVerified: true } } : acc
               ));
            }
            setCurrentAccountIndex(existingIdx);
          }
          setIsLoggedIn(true);
        }} 
        registeredAccounts={accounts.map(acc => ({
          email: acc.email,
          username: acc.profile.username,
          password: acc.password
        }))} 
      />
    );
  }

  if (activeAccount.profile.isBanned) {
    return (
      <div className="h-full w-full bg-[#050505] flex flex-col items-center justify-center p-8 text-center animate-view">
        <div className="w-24 h-24 bg-rose-600/20 rounded-full flex items-center justify-center mb-8 border border-rose-500/30">
          <svg className="w-12 h-12 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h1 className="text-3xl font-black italic text-rose-500 uppercase mb-4">CONTA SUSPENSA</h1>
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 mb-12 w-full max-sm shadow-xl">
          <p className="text-[10px] font-black uppercase text-rose-500/60 mb-3 tracking-[0.3em]">Motivo Informado:</p>
          <p className="text-base font-black text-white italic leading-tight">"{activeAccount.profile.banReason || 'Violação dos Termos de Uso'}"</p>
        </div>
        <button onClick={handleLogout} className="w-full max-w-xs bg-white text-black py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em]">Sair desta Conta</button>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Feed 
          videos={videos} 
          currentUser={activeAccount.profile}
          onLike={handleLike}
          onFollow={handleFollow}
          onRepost={handleRepost}
          onShare={handleShare}
          onAddComment={handleAddComment}
          onNavigateToProfile={navigateToProfile}
          followingMap={activeAccount.followingMap}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          onSearchClick={() => setActiveTab('discover')}
          onDeleteComment={handleDeleteComment}
          onDeleteVideo={() => {}}
          onToggleComments={() => {}}
          onLikeComment={handleLikeComment}
          initialVideoId={jumpToVideoId}
          onClearJump={() => setJumpToVideoId(null)}
          allAccounts={accounts.map(a => a.profile)}
        />;
      case 'profile':
        const targetUsername = viewingUser || activeAccount.profile.username;
        const targetAcc = accounts.find(a => a.profile.username === targetUsername);
        return <Profile 
          user={targetAcc?.profile || activeAccount.profile}
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
          onDeleteComment={handleDeleteComment}
          onDeleteVideo={() => {}}
          onToggleComments={() => {}}
          followingMap={activeAccount.followingMap}
          onNavigateToProfile={navigateToProfile}
          onSwitchAccount={() => setActiveTab('switcher')}
          allAccountsData={accounts}
          onOpenAdmin={() => setActiveTab('admin')}
          onLikeComment={handleLikeComment}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
        />;
      case 'create':
        return <Create 
          onAddVideo={(v) => { 
            setVideos([v, ...videos]); 
            setActiveTab('home'); 
            notifyMentions(v.description, v.id, activeAccount.profile);
          }} 
          currentUser={activeAccount.profile} 
          allAccounts={accounts} 
        />;
      case 'discover':
        return <Discover videos={videos} onNavigateToProfile={navigateToProfile} currentUser={activeAccount.profile} allAccounts={accounts} />;
      case 'inbox':
        return <Inbox activePartner={activeChatUser} onBack={() => setActiveChatUser(null)} currentUser={activeAccount.profile} onNavigateToProfile={navigateToProfile} allAccounts={accounts} chats={[]} onSendMessage={() => {}} onOpenChat={setActiveChatUser} onViewVideo={handleViewVideo} videos={videos} />;
      case 'admin':
        return (
          <AdminPanel 
            accounts={accounts} 
            videos={videos} 
            onUpdateStats={handleUpdateStats} 
            onUpdateVideoStats={handleUpdateVideoStats}
            onDeleteAccount={handleDeleteAccountAdmin}
            onClose={() => setActiveTab('profile')} 
          />
        );
      case 'switcher':
        return (
          <AccountSwitcher 
            accounts={accounts.map(a => a.profile)} 
            onSelect={(u) => {
              const idx = accounts.findIndex(a => a.profile.username === u);
              if (idx !== -1) {
                setCurrentAccountIndex(idx);
                setViewingUser(null);
                setActiveTab('profile');
              }
            }} 
            onAddAccount={() => {
              setIsLoggedIn(false);
            }} 
            onDeleteAccount={(u) => {
               setAccounts(prev => prev.filter(a => a.profile.username !== u));
            }}
            onBack={() => setActiveTab('profile')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0c] text-white overflow-hidden">
      <main className="flex-1 relative overflow-hidden">{renderContent()}</main>
      <nav className={`h-[80px] border-t border-white/5 bg-black/80 backdrop-blur-xl flex items-center justify-around px-2 z-50 ${activeTab === 'switcher' || activeTab === 'admin' ? 'hidden' : ''}`}>
        <button onClick={() => { setViewingUser(null); setActiveTab('home'); }} className={`flex flex-col items-center ${activeTab === 'home' ? 'text-indigo-500' : 'text-gray-500'}`}><HomeIcon active={activeTab === 'home'} /><span className="text-[10px] mt-1 font-bold uppercase tracking-tighter">Início</span></button>
        <button onClick={() => { setViewingUser(null); setActiveTab('discover'); }} className={`flex flex-col items-center ${activeTab === 'discover' ? 'text-indigo-500' : 'text-gray-500'}`}><SearchIcon active={activeTab === 'discover'} /><span className="text-[10px] mt-1 font-bold uppercase tracking-tighter">Vibes</span></button>
        <button onClick={() => setActiveTab('create')} className="relative -top-2"><div className="w-14 h-11 bg-white rounded-2xl flex items-center justify-center shadow-xl active:scale-90 transition-all"><PlusIcon /></div></button>
        <button onClick={() => { setViewingUser(null); setActiveTab('inbox'); }} className={`flex flex-col items-center ${activeTab === 'inbox' ? 'text-indigo-500' : 'text-gray-500'}`}><MessageIcon active={activeTab === 'inbox'} /><span className="text-[10px] mt-1 font-bold uppercase tracking-tighter">Inbox</span></button>
        <button onClick={() => { setViewingUser(null); setActiveTab('profile'); }} className={`flex flex-col items-center ${activeTab === 'profile' ? 'text-indigo-500' : 'text-gray-500'}`}><UserIcon active={activeTab === 'profile'} /><span className="text-[10px] mt-1 font-bold uppercase tracking-tighter">Perfil</span></button>
      </nav>
    </div>
  );
};

export default App;
