
import React, { useState, useRef, useEffect } from 'react';
import { Video, UserProfile } from '../types';
import MentionSuggestions from '../components/MentionSuggestions';

interface CreateProps {
  onAddVideo: (video: Video) => void;
  currentUser: UserProfile;
  allAccounts: any[];
}

const Create: React.FC<CreateProps> = ({ onAddVideo, currentUser, allAccounts = [] }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [mentionQuery, setMentionQuery] = useState('');
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const lastWord = description.split(/\s/).pop() || '';
    if (lastWord.startsWith('@')) {
      setMentionQuery(lastWord.substring(1));
    } else {
      setMentionQuery('');
    }
  }, [description]);

  const handlePost = () => {
    if (!videoUrl || !description) return;
    onAddVideo({
      id: Date.now().toString(),
      url: videoUrl,
      username: currentUser.username,
      displayName: currentUser.displayName,
      avatar: currentUser.avatar,
      description,
      likes: 0,
      comments: [],
      shares: 0,
      reposts: 0,
      isLiked: false,
      isFollowing: true,
      music: `Som Original - ${currentUser.displayName}`,
      isVerified: !!currentUser.isVerified
    });
  };

  const handleSelectMention = (username: string) => {
    const words = description.split(/\s/);
    words.pop();
    setDescription([...words, `@${username} `].join(' '));
    setMentionQuery('');
  };

  return (
    <div className="h-full animate-view bg-black flex flex-col overflow-hidden pb-24 px-6">
      <div className="flex justify-center pt-8 pb-4 z-50">
        <h2 className="text-xl font-black italic tracking-tighter uppercase text-white">Novo Vídeo</h2>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="space-y-6 pt-4 max-w-md mx-auto">
          <div onClick={() => videoInputRef.current?.click()} className="relative bg-white/5 border-2 border-dashed border-white/10 rounded-[3rem] p-10 flex flex-col items-center justify-center transition-all cursor-pointer hover:bg-white/10 group">
            {videoUrl ? (
              <video src={videoUrl} className="w-full aspect-[9/16] max-h-[400px] rounded-[2.5rem] object-cover shadow-2xl" autoPlay muted loop />
            ) : (
              <div className="text-center">
                 <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-500 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                 </div>
                 <p className="font-black text-xs uppercase tracking-widest opacity-40">Selecionar arquivo</p>
              </div>
            )}
            <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={e => { if(e.target.files?.[0]) setVideoUrl(URL.createObjectURL(e.target.files[0])); }} />
          </div>
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10 relative">
             <MentionSuggestions query={mentionQuery} users={allAccounts.map(a => a.profile)} onSelect={handleSelectMention} />
             <label className="text-[9px] font-black uppercase text-gray-500 mb-2 block tracking-widest">Legenda do Vídeo</label>
             <textarea placeholder="O que você está pensando?" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-transparent text-sm outline-none h-20 resize-none text-white" />
          </div>
          <button onClick={handlePost} disabled={!videoUrl} className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">Publicar Agora</button>
        </div>
      </div>
    </div>
  );
};

export default Create;
