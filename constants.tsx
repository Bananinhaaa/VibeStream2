
import { Video } from './types';

export const INITIAL_VIDEOS: Video[] = [
  {
    id: 'seed-1',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-city-lights-at-night-from-above-26615-large.mp4',
    username: 'vibe_official',
    displayName: 'Vibe Stream',
    avatar: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=100&h=100&fit=crop',
    description: 'Bem-vindo ao futuro das conexões. Sinta o ritmo da cidade! 🌃 #citylife #vibes',
    likes: 12400,
    comments: [
      {
        id: 'c1',
        username: 'tech_lover',
        displayName: 'Tech Enthusiast',
        avatar: '',
        text: 'A interface está incrível! Finalmente algo fluido.',
        timestamp: Date.now() - 100000,
        likes: 45,
        isVerified: true
      }
    ],
    shares: 850,
    reposts: 120,
    isLiked: false,
    isFollowing: false,
    music: 'Som Original - Vibe Stream',
    isVerified: true
  },
  {
    id: 'seed-2',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-spooky-forest-with-low-sunlight-4537-large.mp4',
    username: 'nature_explorer',
    displayName: 'Aventureiro Solo',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    description: 'Encontre a paz no silêncio da floresta. Respire. 🌲✨ #natureza #paz #vibe',
    likes: 8900,
    comments: [],
    shares: 430,
    reposts: 56,
    isLiked: false,
    isFollowing: false,
    music: 'Nature Ambience - Relaxing Sounds',
    isVerified: false
  },
  {
    id: 'seed-3',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-man-dancing-under-street-lights-1240-large.mp4',
    username: 'dance_master',
    displayName: 'Dançarino de Rua',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    description: 'O asfalto é o meu palco. Solta o som! 🕺🔥 #dance #streetstyle',
    likes: 45600,
    comments: [],
    shares: 1200,
    reposts: 890,
    isLiked: false,
    isFollowing: false,
    music: 'Phonk Night - Street Beats',
    isVerified: true
  }
];
