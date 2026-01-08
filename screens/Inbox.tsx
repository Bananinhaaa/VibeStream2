
import React, { useState, useMemo } from 'react';
import { UserProfile, Notification, ChatMessage, Video } from '../types';
import { VerifiedBadge } from '../components/Icons';

interface InboxProps {
  activePartner: string | null;
  onBack: () => void;
  currentUser: UserProfile;
  onNavigateToProfile: (username: string) => void;
  allAccounts: any[];
  chats: ChatMessage[];
  onSendMessage: (text: string) => void;
  onOpenChat: (username: string) => void;
  onViewVideo: (vId: string) => void;
  videos: Video[];
}

const Inbox: React.FC<InboxProps> = ({ 
  activePartner, onBack, currentUser, onNavigateToProfile, allAccounts, chats, onSendMessage, onOpenChat, onViewVideo, videos 
}) => {
  const [inboxTab, setInboxTab] = useState<'activity' | 'messages'>('activity');
  const [chatInput, setChatInput] = useState('');

  const conversationList = useMemo(() => {
    const map = new Map<string, ChatMessage>();
    chats.forEach(c => {
      const other = c.sender === currentUser.username ? c.receiver : c.sender;
      if (!map.has(other) || map.get(other)!.timestamp < c.timestamp) {
        map.set(other, c);
      }
    });
    return Array.from(map.entries()).sort((a, b) => b[1].timestamp - a[1].timestamp);
  }, [chats, currentUser.username]);

  const activeChatMessages = useMemo(() => {
    if (!activePartner) return [];
    return chats.filter(c => 
      (c.sender === currentUser.username && c.receiver === activePartner) ||
      (c.sender === activePartner && c.receiver === currentUser.username)
    );
  }, [chats, activePartner, currentUser.username]);

  if (activePartner) {
    const partnerProfile = allAccounts.find(a => a.profile.username === activePartner)?.profile;
    return (
      <div className="h-full bg-black flex flex-col animate-view">
        <header className="p-6 border-b border-white/5 flex items-center gap-4 bg-[#0a0a0c]">
          <button onClick={onBack} className="p-2 bg-white/5 rounded-full"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2.5" strokeLinecap="round"/></svg></button>
          <div onClick={() => onNavigateToProfile(activePartner)} className="flex items-center gap-3 cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-indigo-900 overflow-hidden">
               {partnerProfile?.avatar ? <img src={partnerProfile.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black">{activePartner.charAt(0).toUpperCase()}</div>}
            </div>
            <div>
              <p className="text-sm font-black italic">@{activePartner}</p>
              {partnerProfile?.isVerified && <VerifiedBadge size="12" />}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-[#050505]">
           {activeChatMessages.map((msg) => (
             <div key={msg.id} className={`flex ${msg.sender === currentUser.username ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-5 py-3 rounded-3xl text-sm ${msg.sender === currentUser.username ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/10 text-gray-200 rounded-tl-none'}`}>
                  {msg.text}
                </div>
             </div>
           ))}
        </div>
        <div className="p-6 border-t border-white/5 bg-[#0a0a0c] pb-10 flex gap-3">
          <input 
            value={chatInput} 
            onChange={e => setChatInput(e.target.value)} 
            onKeyPress={e => e.key === 'Enter' && (onSendMessage(chatInput), setChatInput(''))}
            placeholder="Diga algo legal..." 
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-sm outline-none focus:border-indigo-500 transition-all" 
          />
          <button onClick={() => { if(chatInput.trim()){ onSendMessage(chatInput); setChatInput(''); } }} className="bg-white text-black font-black px-6 rounded-2xl text-[10px] uppercase tracking-widest active:scale-95 transition-all">Enviar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-black flex flex-col overflow-hidden animate-view">
      <header className="p-8 pb-4">
        <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-6">Inbox</h2>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
          <button onClick={() => setInboxTab('activity')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${inboxTab === 'activity' ? 'bg-white text-black' : 'text-gray-500'}`}>Atividade</button>
          <button onClick={() => setInboxTab('messages')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${inboxTab === 'messages' ? 'bg-white text-black' : 'text-gray-500'}`}>Mensagens</button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 space-y-4 no-scrollbar pb-24">
        {inboxTab === 'activity' ? (
          currentUser.notifications.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center opacity-20 italic text-sm"><p>Nenhuma atividade por enquanto.</p></div>
          ) : (
            currentUser.notifications.map(notif => {
              const relatedVideo = notif.videoId ? videos.find(v => v.id === notif.videoId) : null;
              
              return (
                <div 
                  key={notif.id} 
                  onClick={() => notif.videoId ? onViewVideo(notif.videoId) : onNavigateToProfile(notif.fromUser)} 
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                >
                  <div className={`w-11 h-11 rounded-full shrink-0 overflow-hidden flex items-center justify-center border border-white/10 ${notif.type === 'reply' ? 'bg-indigo-800' : 'bg-indigo-600'}`}>
                    {notif.fromAvatar ? <img src={notif.fromAvatar} className="w-full h-full object-cover" /> : <span className="font-black text-xs">{notif.fromUser.charAt(0).toUpperCase()}</span>}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs">
                      <span className="font-black">@{notif.fromUser}</span> {notif.text}
                    </p>
                    <p className="text-[8px] text-gray-500 font-bold uppercase mt-1 tracking-tighter">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  
                  {relatedVideo && (
                    <div className="w-10 h-14 bg-zinc-900 rounded-lg overflow-hidden border border-white/10 shrink-0 relative group-hover:scale-110 transition-transform">
                      <video src={relatedVideo.url} className="w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white/40" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>
                  )}

                  {!notif.videoId && <div className="w-2 h-2 bg-indigo-500 rounded-full" />}
                </div>
              );
            })
          )
        ) : (
          conversationList.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center opacity-20 italic text-sm text-center">
              <p>Inicie uma conversa clicando no perfil de alguém!</p>
            </div>
          ) : (
            conversationList.map(([username, lastMsg]) => {
              const profile = allAccounts.find(a => a.profile.username === username)?.profile;
              return (
                <div key={username} onClick={() => onOpenChat(username)} className="flex items-center gap-4 p-5 bg-white/5 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-indigo-900 overflow-hidden shrink-0 border border-white/10">
                    {profile?.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black">{username.charAt(0)}</div>}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-1">
                      <p className="font-black text-sm">@{username}</p>
                      {profile?.isVerified && <VerifiedBadge size="10" />}
                    </div>
                    <p className="text-[10px] text-gray-500 truncate font-medium">{lastMsg.sender === currentUser.username ? 'Você: ' : ''}{lastMsg.text}</p>
                  </div>
                  <span className="text-[8px] text-gray-600 font-black uppercase">Agora</span>
                </div>
              );
            })
          )
        )}
      </div>
    </div>
  );
};

export default Inbox;
