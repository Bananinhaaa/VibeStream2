
export interface Comment {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  text: string;
  timestamp: number; // Alterado de string para number
  likes: number;
  isLikedByMe?: boolean;
  isVerified?: boolean;
  replies?: Comment[];
}

export interface Video {
  id: string;
  url: string;
  username: string;
  displayName: string;
  avatar: string;
  description: string;
  likes: number;
  comments: Comment[];
  shares: number;
  reposts: number;
  isLiked: boolean;
  isFollowing: boolean;
  music: string;
  isVerified?: boolean;
  commentsDisabled?: boolean;
}

export interface Notification {
  id: string;
  type: 'follow' | 'like' | 'comment' | 'repost' | 'mention' | 'reply';
  fromUser: string;
  fromAvatar: string;
  timestamp: number;
  text: string;
  videoId?: string; // ID do vídeo relacionado
}

export interface ChatMessage {
  id: string;
  sender: string;
  receiver: string;
  text: string;
  timestamp: number;
}

export interface UserProfile {
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  banner?: string;
  phone?: string;
  email: string;
  followers: number;
  following: number;
  likes: number;
  isVerified?: boolean;
  isAdmin?: boolean;
  isBanned?: boolean;
  banReason?: string;
  repostedVideoIds: string[];
  notifications: Notification[];
}
