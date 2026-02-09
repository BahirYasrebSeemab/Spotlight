export interface Memory {
  id: string;
  userId: string;
  title: string | null;
  caption: string | null;
  mediaUrl: string;
  mediaType: 'photo' | 'video';
  thumbnailUrl: string | null;
  takenAt: string | null;
  location: string | null;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    username: string;
    name: string | null;
    avatarUrl: string;
  };
  items?: MemoryItem[];
  isLiked?: boolean;
}

export interface MemoryItem {
  id: string;
  memoryId: string;
  ownershipId: string;
  ownership: {
    id: string;
    prototype?: {
      id: string;
      name: string;
      brand: {
        id: string;
        name: string;
      };
    };
    communityProduct?: {
      id: string;
      name: string;
      brandName: string;
    };
  };
}

export interface Comment {
  id: string;
  memoryId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    name: string | null;
    avatarUrl: string;
  };
}

export interface Like {
  id: string;
  memoryId: string;
  userId: string;
  createdAt: string;
}

export interface CreateMemoryInput {
  userId: string;
  mediaUrl: string;
  mediaType: 'photo' | 'video';
  thumbnailUrl?: string;
  caption?: string;
  title?: string;
  location?: string;
  ownershipIds: string[];
}

export interface CreateCommentInput {
  memoryId: string;
  userId: string;
  content: string;
}
