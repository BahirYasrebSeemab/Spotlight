export interface Memory {
  id: string;
  userId: string;
  mediaUrl: string;
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean;
  likesCount: number;
  title: string | null;
  items?: MemoryItem[];
  commentsCount: number;
  caption: string | null;
  takenAt: string | null;
  location: string | null;
  thumbnailUrl: string | null;
  mediaType: 'photo' | 'video';
  user?: {
    id: string;
    username: string;
    name: string | null;
    avatarUrl: string;
  };
}

export interface MemoryItem {
  id: string;
  memoryId: string;
  ownershipId: string;
  ownership: {
    id: string;
    processedImageUrl: string;
    thumbnailImageUrl: string;
    prototype?: {
      id: string;
      name: string;
      imageUrl: string;
      thumbnailUrl: string;
      brand: {
        id: string;
        name: string;
      };
    };
    communityProduct?: {
      id: string;
      name: string;
      brandName: string;
      imageUrl: string;
      thumbnailUrl: string;
    };
  };
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  memoryId: string;
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
  userId: string;
  memoryId: string;
  createdAt: string;
}

export interface CreateMemoryInput {
  userId: string;
  title?: string;
  mediaUrl: string;
  caption?: string;
  location?: string;
  thumbnailUrl?: string;
  ownershipIds: string[];
  mediaType: 'photo' | 'video';
}

export interface CreateCommentInput {
  userId: string;
  content: string;
  memoryId: string;
}
