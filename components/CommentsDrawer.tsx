
import React, { useState, useEffect } from 'react';
import { Comment, UserProfile } from '../types';
import { formatNumber, formatTimeAgo } from '../utils/formatters';
import { TrashIcon, VerifiedBadge } from './Icons';
import { renderWithMentions } from '../utils/mentionHelper';
import MentionSuggestions from './MentionSuggestions';

interface CommentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  comments: Comment[];
  onAddComment: (text: string, parentId?: string) => void;
  onLikeComment: (cId: string) => void;
  onDeleteComment?: (cId: string) => void;
  videoOwner: string;
  currentUser: string;
  onUserClick: (username: string) => void;
  disabled?: boolean;
  allAccounts?: UserProfile[];
}

const CommentsDrawer: React.FC<CommentsDrawerProps> = ({ 
  isOpen, onClose, comments, onAddComment, onLikeComment, 
  onDeleteComment, videoOwner, currentUser, onUserClick, disabled,
  allAccounts = []
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);
  const [mentionQuery, setMentionQuery] = useState('');

  useEffect(() => {
    const lastWord = newComment.split(/\s/).pop() || '';
    if (lastWord.startsWith('@')) {
      setMentionQuery(lastWord.substring(1));
    } else {
      setMentionQuery('');
    }
  }, [newComment]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment, replyTo?.id);
      setNewComment('');
      setReplyTo(null);
    }
  };

  const handleSelectMention = (username: string) => {
    const words = newComment.split(/\s/);
    words.pop();
    setNewComment([...words, `@${username} `].join(' '));
    setMentionQuery('');
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`group ${isReply ? 'ml-10 mt-4 opacity-90' : 'mb-6 animate-view'}`}>
      <div className="flex gap-3">
        <div onClick={() => onUserClick(comment.username)} className={`${isReply ? 'w-7 h-7' : 'w-9 h-9'} rounded-full bg-zinc-800 shrink-0 overflow-hidden cursor-pointer border border-white/5`}>
          {comment.avatar ? <img src={comment.avatar} className="w-full h-full object-cover" alt="avatar" /> : <div className="w-full h-full flex items-center justify-center font-black text-[10px] uppercase">{comment.displayName.charAt(0)}</div>}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className={`font-black text-white flex items-center gap-1 ${isReply ? 'text-[10px]' : 'text-[11px]'}`}>
                {comment.displayName}
                {comment.isVerified && <VerifiedBadge size={isReply ? "10" : "12"} />}
              </p>
              <p className={`font-bold text-gray-500 uppercase tracking-tighter ${isReply ? 'text-[7px]' : 'text-[8px]'}`}>@{comment.username}</p>
            </div>
            <div className="flex items-center gap-2">
              {(comment.username === currentUser || videoOwner === currentUser) && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteComment?.(comment.id); }} 
                  className="p-1.5 bg-rose-600/10 text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <TrashIcon size="10" />
                </button>
              )}
              <button onClick={() => onLikeComment(comment.id)} className="flex flex-col items-center">
                 <svg className={`w-3.5 h-3.5 transition-all ${comment.isLikedByMe ? 'text-rose-500 fill-current' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeWidth="2.5"/></svg>
                 <span className="text-[7px] font-black mt-0.5 text-gray-500">{formatNumber(comment.likes)}</span>
              </button>
            </div>
          </div>
          <p className={`${isReply ? 'text-xs' : 'text-sm'} font-medium leading-relaxed mt-1 text-gray-200`}>
            {renderWithMentions(comment.text, onUserClick)}
          </p>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-[8px] text-gray-500 uppercase font-black tracking-tighter">{formatTimeAgo(comment.timestamp)}</p>
            {!isReply && (
              <button 
                onClick={() => {
                  setReplyTo({ id: comment.id, username: comment.username });
                  setNewComment(`@${comment.username} `);
                }}
                className="text-[8px] text-indigo-500 uppercase font-black tracking-widest hover:underline"
              >
                Responder
              </button>
            )}
          </div>
        </div>
      </div>
      {!isReply && comment.replies && comment.replies.length > 0 && (
        <div className="border-l border-white/5 mt-2">
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} isReply />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0d0d0d] rounded-t-[2.5rem] h-[80vh] flex flex-col overflow-hidden animate-slide-up border-t border-white/5 shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/80">
            {disabled ? 'Comentários Desativados' : `${formatNumber(comments.length)} Comentários`}
          </h3>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 no-scrollbar bg-gradient-to-b from-transparent to-black/30">
          {disabled ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 italic px-10">
               <p className="text-sm">O autor desativou os comentários.</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>

        {!disabled && (
          <div className="p-6 border-t border-white/5 pb-10 bg-[#0d0d0d] relative">
            <MentionSuggestions query={mentionQuery} users={allAccounts} onSelect={handleSelectMention} />
            {replyTo && (
              <div className="absolute -top-10 left-0 w-full px-6 py-2 bg-indigo-600/10 flex items-center justify-between border-t border-indigo-500/10">
                <p className="text-[9px] font-black uppercase text-indigo-400">Respondendo a <span className="underline">@{replyTo.username}</span></p>
                <button onClick={() => { setReplyTo(null); setNewComment(''); }} className="text-[9px] font-black uppercase text-rose-500/60">Cancelar</button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input 
                type="text" 
                autoFocus={!!replyTo}
                value={newComment} 
                onChange={e => setNewComment(e.target.value)} 
                placeholder={replyTo ? `Sua resposta...` : "Adicione um comentário..."} 
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all text-white placeholder:text-gray-600" 
              />
              <button 
                type="submit" 
                disabled={!newComment.trim()} 
                className="bg-indigo-600 text-white px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
              >
                Postar
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsDrawer;
