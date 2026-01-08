
import React, { useState, useMemo } from 'react';
import { Video, UserProfile } from '../types';

interface DiscoverProps {
  videos: Video[];
  onNavigateToProfile: (username: string) => void;
  currentUser: UserProfile;
  allAccounts: any[];
}

const Discover: React.FC<DiscoverProps> = ({ videos, onNavigateToProfile, currentUser, allAccounts }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const communityVideos = useMemo(() => {
    if (!searchTerm.trim()) return videos;
    return videos.filter(v => 
      v.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, videos]);

  return (
    <div className="h-full animate-view overflow-y-auto no-scrollbar pb-24 bg-black">
      <header className="p-8 pb-6 sticky top-0 bg-black/90 backdrop-blur-2xl z-50">
        <h2 className="text-3xl font-black mb-6 tracking-tighter italic">VIBES</h2>
        <div className="relative">
          <input 
            type="text" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Encontre amigos ou vídeos..." 
            className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-4.5 px-14 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-semibold"
          />
          <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-indigo-500 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </header>

      <div className="px-6 space-y-12 mt-4">
        <section>
          <div className="flex items-center justify-between mb-6 px-1">
            <h3 className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.4em]">Explorar Vibes</h3>
            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Recentes</span>
          </div>
          
          {communityVideos.length > 0 ? (
            <div className="grid grid-cols-2 gap-5">
              {communityVideos.map(video => (
                <div key={video.id} onClick={() => onNavigateToProfile(video.username)} className="aspect-[9/16] bg-white/5 rounded-[2.8rem] overflow-hidden relative group border border-white/5 cursor-pointer active:scale-95 transition-all shadow-lg">
                  <video src={video.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-70" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <p className="text-[10px] font-black text-white truncate mb-1.5">@{video.username}</p>
                    <p className="text-[9px] text-gray-400 font-medium line-clamp-1 opacity-60 leading-tight">{video.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center bg-white/5 rounded-[3.5rem] border border-dashed border-white/10">
               <p className="text-[11px] font-black text-gray-600 uppercase tracking-[0.3em]">Nenhum vídeo no radar</p>
            </div>
          )}
        </section>

        <section className="pb-16 px-1">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.4em]">Comunidade Vibe</h3>
            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{allAccounts.length} Membros</span>
          </div>
          <div className="grid grid-cols-4 gap-x-6 gap-y-10">
            {allAccounts.map(acc => (
              <div key={acc.profile.username} onClick={() => onNavigateToProfile(acc.profile.username)} className="flex flex-col items-center gap-2.5 cursor-pointer group active:scale-90 transition-all">
                <div className={`w-16 h-16 rounded-[1.8rem] border p-0.5 group-hover:rotate-6 group-hover:scale-110 transition-all bg-zinc-950 flex items-center justify-center overflow-hidden border-white/10`}>
                  {acc.profile.avatar ? <img src={acc.profile.avatar} className="w-full h-full object-cover" /> : <span className="font-black text-2xl text-indigo-500">{acc.profile.username.charAt(0).toUpperCase()}</span>}
                </div>
                <span className="text-[9px] font-black text-gray-500 uppercase truncate w-full text-center tracking-tighter opacity-70 group-hover:opacity-100 transition-opacity">@{acc.profile.username}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Discover;
