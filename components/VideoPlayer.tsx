
import React, { useState, useRef, useEffect } from 'react';
import { Video, UserProfile } from '../types';
import { HeartIcon, CommentIcon, ShareIcon, RepostIcon, MusicIcon, VerifiedBadge } from './Icons';
import CommentsDrawer from './CommentsDrawer';
import { renderWithMentions } from '../utils/mentionHelper';

interface VideoPlayerProps {
  video: Video;
  isActive: boolean;
  onLike: (id: string) => void;
  onFollow: (username: string) => void;
  onRepost: (id: string) => void;
  onShare: (id: string) => void;
  onAddComment: (vId: string, text: string, parentId?: string) => void;
  onNavigateToProfile: (username: string) => void;
  currentUser: UserProfile;
  isFollowing: boolean;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
  isRepostedByMe: boolean;
  onDeleteComment?: (vId: string, cId: string) => void;
  onToggleComments?: (vId: string) => void;
  onDeleteVideo?: (vId: string) => void;
  onLikeComment?: (vId: string, cId: string) => void;
  allAccounts?: UserProfile[];
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  video, isActive, onLike, onFollow, onRepost, onShare, onAddComment, onNavigateToProfile, currentUser, isFollowing, isMuted, setIsMuted, isRepostedByMe,
  onDeleteComment, onToggleComments, onDeleteVideo, onLikeComment, allAccounts = []
}) => {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play().catch(() => console.log("Auto-play blocked"));
    } else {
      videoRef.current?.pause();
      if (videoRef.current) videoRef.current.currentTime = 0;
    }
  }, [isActive]);

  return (
    <div className="relative w-full h-full bg-black group">
      <video 
        ref={videoRef} 
        src={video.url} 
        loop 
        muted={isMuted} 
        playsInline
        className="w-full h-full object-cover" 
        onClick={() => setIsMuted(!isMuted)}
      />

      {/* Info do Criador e Legenda */}
      <div className="absolute bottom-8 left-6 right-20 z-10 pointer-events-none">
        <div className="flex items-center gap-3 mb-3 pointer-events-auto" onClick={(e) => { e.stopPropagation(); onNavigateToProfile(video.username); }}>
          <div className="w-11 h-11 rounded-full border-2 border-white/20 overflow-hidden shadow-lg">
            {video.avatar ? <img src={video.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-indigo-600 flex items-center justify-center font-black">{video.username.charAt(0).toUpperCase()}</div>}
          </div>
          <div>
            <p className="font-black text-sm flex items-center gap-1">@{video.username} {video.isVerified && <VerifiedBadge size="14" />}</p>
            {!isFollowing && video.username !== currentUser.username && (
               <button onClick={(e) => { e.stopPropagation(); onFollow(video.username); }} className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mt-0.5">Seguir</button>
            )}
          </div>
        </div>
        <div className="text-sm font-medium mb-4 line-clamp-3 leading-relaxed drop-shadow-md pointer-events-auto">
          {renderWithMentions(video.description, onNavigateToProfile)}
        </div>
        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full w-fit border border-white/10">
          <MusicIcon />
          <p className="text-[10px] font-black uppercase tracking-tighter truncate max-w-[150px]">{video.music}</p>
        </div>
      </div>

      {/* Ações Laterais */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-7 z-20">
        <button onClick={() => onLike(video.id)} className="flex flex-col items-center group/btn">
          <div className="p-2 transition-transform group-active/btn:scale-125">
            <HeartIcon liked={video.isLiked} />
          </div>
          <span className="text-[10px] font-black mt-1 drop-shadow-lg">{video.likes}</span>
        </button>
        
        <button onClick={() => setIsCommentsOpen(true)} className="flex flex-col items-center group/btn">
          <div className="p-2 transition-transform group-active/btn:scale-125">
            <CommentIcon />
          </div>
          <span className="text-[10px] font-black mt-1 drop-shadow-lg">{video.comments.length}</span>
        </button>

        <button onClick={() => onRepost(video.id)} className="flex flex-col items-center group/btn">
          <div className="p-2 transition-transform group-active/btn:scale-125">
            <RepostIcon active={isRepostedByMe} />
          </div>
          <span className="text-[10px] font-black mt-1 drop-shadow-lg">{video.reposts}</span>
        </button>

        <button onClick={() => onShare(video.id)} className="flex flex-col items-center group/btn">
          <div className="p-2 transition-transform group-active/btn:scale-125">
            <ShareIcon />
          </div>
          <span className="text-[10px] font-black mt-1 drop-shadow-lg">{video.shares}</span>
        </button>

        <div className="w-12 h-12 rounded-full border-4 border-white/10 bg-zinc-900 flex items-center justify-center animate-spin-slow">
           <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-rose-500" />
        </div>
      </div>

      <CommentsDrawer 
        isOpen={isCommentsOpen} 
        onClose={() => setIsCommentsOpen(false)} 
        comments={video.comments} 
        onAddComment={(t, pId) => onAddComment(video.id, t, pId)} 
        videoOwner={video.username}
        currentUser={currentUser.username}
        onUserClick={onNavigateToProfile}
        onLikeComment={(cId) => onLikeComment?.(video.id, cId)}
        onDeleteComment={(cId) => onDeleteComment?.(video.id, cId)}
        allAccounts={allAccounts}
      />
    </div>
  );
};

export default VideoPlayer;
