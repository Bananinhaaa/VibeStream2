
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Video, UserProfile } from '../types';
import VideoPlayer from '../components/VideoPlayer';

interface FeedProps {
  videos: Video[];
  onNavigateToProfile: (username: string) => void;
  currentUser: UserProfile;
  onAddComment: (videoId: string, text: string, replyTo?: string) => void;
  onDeleteComment: (videoId: string, commentId: string) => void;
  onToggleComments: (videoId: string) => void;
  onDeleteVideo: (videoId: string) => void;
  onFollow: (username: string) => void;
  onRepost: (id: string) => void;
  onLike: (id: string) => void;
  onShare: (id: string) => void;
  followingMap: Record<string, boolean>;
  onSearchClick: () => void;
  onLikeComment: (vId: string, cId: string) => void;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
  initialVideoId?: string | null;
  onClearJump?: () => void;
  allAccounts?: UserProfile[];
}

const Feed: React.FC<FeedProps> = ({ 
  videos, 
  onNavigateToProfile, 
  currentUser, 
  onAddComment, 
  onDeleteComment,
  onToggleComments,
  onDeleteVideo,
  onFollow, 
  onRepost, 
  onLike, 
  onShare,
  followingMap, 
  onSearchClick,
  onLikeComment,
  isMuted,
  setIsMuted,
  initialVideoId,
  onClearJump,
  allAccounts = []
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [feedTab, setFeedTab] = useState<'foryou' | 'following'>('foryou');
  const containerRef = useRef<HTMLDivElement>(null);

  const displayVideos = useMemo(() => {
    if (feedTab === 'foryou') return videos;
    return videos.filter(v => followingMap[v.username]);
  }, [videos, feedTab, followingMap]);

  useEffect(() => {
    if (initialVideoId && containerRef.current) {
      const idx = displayVideos.findIndex(v => v.id === initialVideoId);
      if (idx !== -1) {
        setActiveIndex(idx);
        const height = containerRef.current.clientHeight;
        containerRef.current.scrollTo({ top: idx * height, behavior: 'smooth' });
        onClearJump?.();
      }
    }
  }, [initialVideoId, displayVideos, onClearJump]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollPos = containerRef.current.scrollTop;
    const height = containerRef.current.clientHeight;
    const newIndex = Math.round(scrollPos / height);
    if (newIndex !== activeIndex) setActiveIndex(newIndex);
  };

  return (
    <div className="h-full w-full relative bg-black">
       {/* Top Navigation */}
       <div className="absolute top-0 left-0 w-full z-30 flex justify-between items-center px-6 py-8 pointer-events-none">
          <h1 className="text-xl font-black tracking-tighter text-white pointer-events-auto italic">VIBE<span className="text-indigo-500">.</span></h1>
          
          <div className="flex gap-4 pointer-events-auto bg-black/40 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/10 shadow-lg">
            <button 
              onClick={() => { setFeedTab('following'); setActiveIndex(0); if(containerRef.current) containerRef.current.scrollTop = 0; }}
              className={`text-sm font-black transition-all ${feedTab === 'following' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
            >
              Seguindo
            </button>
            <div className="w-[1px] h-4 bg-white/10 self-center"></div>
            <button 
              onClick={() => { setFeedTab('foryou'); setActiveIndex(0); if(containerRef.current) containerRef.current.scrollTop = 0; }}
              className={`text-sm font-black transition-all ${feedTab === 'foryou' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
            >
              Para Você
            </button>
          </div>

          <button onClick={onSearchClick} className="w-10 h-10 pointer-events-auto bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 active:scale-90 transition-all">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </button>
       </div>

      {displayVideos.length > 0 ? (
        <div ref={containerRef} onScroll={handleScroll} className="video-snap-container no-scrollbar h-full">
          {displayVideos.map((video, index) => (
            <div key={video.id} className="video-snap-item p-2">
              <div className="h-full w-full overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl relative bg-[#0a0a0c]">
                  <VideoPlayer 
                    video={video} 
                    isActive={index === activeIndex}
                    onLike={onLike}
                    onFollow={onFollow}
                    onRepost={onRepost}
                    onShare={onShare}
                    onNavigateToProfile={onNavigateToProfile}
                    currentUser={currentUser}
                    onAddComment={onAddComment}
                    onDeleteComment={onDeleteComment}
                    onToggleComments={onToggleComments}
                    onDeleteVideo={onDeleteVideo}
                    isFollowing={!!followingMap[video.username]}
                    onLikeComment={onLikeComment}
                    isMuted={isMuted}
                    setIsMuted={setIsMuted}
                    isRepostedByMe={currentUser.repostedVideoIds.includes(video.id)}
                    allAccounts={allAccounts}
                  />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-full w-full flex flex-col items-center justify-center p-12 text-center animate-view">
           <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeWidth="1.5" strokeLinecap="round"/></svg>
           </div>
           <h3 className="text-xl font-black mb-2 uppercase tracking-tighter italic">Vazio por aqui...</h3>
           <p className="text-sm text-gray-500 max-w-xs leading-relaxed">Ninguém postou nada recentemente.</p>
        </div>
      )}
    </div>
  );
};

export default Feed;
