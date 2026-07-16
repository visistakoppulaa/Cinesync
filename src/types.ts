export interface Rating {
  userId: string;
  username: string;
  rating: number;
  comment?: string;
  timestamp: string;
}

export interface Movie {
  id: string;
  title: string;
  director: string;
  year: number;
  genre: string;
  synopsis: string;
  duration: number;
  imageUrl: string;
  bannerUrl: string;
  rating: number;
  ratings: Rating[];
  addedBy: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar: string; // 'popcorn' | 'clapperboard' | 'ticket' | 'camera' | 'film'
  genrePreferences: string[];
  watchlist: string[];
  joinedAt: string;
}

export interface SharedList {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  ownerName: string;
  movieIds: string[];
  comments: {
    userId: string;
    username: string;
    text: string;
    timestamp: string;
  }[];
  activeViewers: string[];
  isCollaborative: boolean;
}

export interface SystemAnalytics {
  totalMovies: number;
  genreDistribution: { [key: string]: number };
  totalAvgRating: number;
  totalRatingsCount: number;
  topSearchQueries: { text: string; value: number }[];
  movieSaves: { id: string; title: string; saves: number }[];
  activeWatchSessionsCount: number;
  profilesCount: number;
  sharedListsCount: number;
}
