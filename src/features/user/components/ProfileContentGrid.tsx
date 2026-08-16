import { MediaGrid } from '@/src/shared/ui';

interface Post {
  id: string;
  imageUrl: string;
  type?: 'photo' | 'video';
}

interface ProfileContentGridProps {
  posts: Post[];
  columns?: number;
  onPostPress: (postId: string) => void;
}

export function ProfileContentGrid({ columns = 3, onPostPress, posts }: ProfileContentGridProps) {
  return (
    <MediaGrid
      data={posts.map(post => ({ id: post.id, imageUri: post.imageUrl, isVideo: post.type === 'video' }))}
      columns={columns}
      onItemPress={item => onPostPress(item.id)}
    />
  );
}
