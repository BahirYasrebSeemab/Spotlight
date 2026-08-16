// ========================================
// src/features/user/components/FollowRequestItem.tsx - NEW COMPONENT
// ========================================
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Check, X } from 'lucide-react-native';
import { View, Text, TouchableOpacity } from 'react-native';

import { Avatar, Button } from '@/src/shared/ui';

interface FollowRequestItemProps {
  onAccept: (requestId: string) => Promise<void>;
  onReject: (requestId: string) => Promise<void>;
  item: {
    id: string;
    requesterId: string;
    requester?: {
      name: string | null;
      username: string;
      avatarUrl: string;
    };
  };
}

export function FollowRequestItem({ item, onAccept, onReject }: FollowRequestItemProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [action, setAction] = useState<'accept' | 'reject' | null>(null);

  const handleAccept = async () => {
    setIsProcessing(true);
    setAction('accept');
    try {
      await onAccept(item.id);
    } catch (error) {
      console.error('Error accepting request:', error);
    } finally {
      setIsProcessing(false);
      setAction(null);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    setAction('reject');
    try {
      await onReject(item.id);
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setIsProcessing(false);
      setAction(null);
    }
  };

  return (
    <View className="p-4 border-b border-border bg-background">
      <View className="flex-row items-center mb-3">
        <TouchableOpacity
          onPress={() => router.push(`/user/${item.requesterId}`)}
          className="mr-3"
          disabled={isProcessing}
        >
          <Avatar uri={item.requester?.avatarUrl} label={item.requester?.name || item.requester?.username} size={56} />
        </TouchableOpacity>

        <View className="flex-1">
          <TouchableOpacity onPress={() => router.push(`/user/${item.requesterId}`)} disabled={isProcessing}>
            <Text className="font-bold text-base text-foreground">
              {item.requester?.name || item.requester?.username}
            </Text>
            <Text className="text-sm text-muted-foreground">@{item.requester?.username}</Text>
          </TouchableOpacity>
          <Text className="text-sm text-muted-foreground mt-1">wants to spot you</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-2">
        <Button
          title="Accept"
          loading={isProcessing && action === 'accept'}
          disabled={isProcessing}
          onPress={handleAccept}
          className="flex-1 rounded-lg"
          icon={<Check size={18} color="black" strokeWidth={2.5} />}
        />

        <Button
          variant="outline"
          title="Decline"
          loading={isProcessing && action === 'reject'}
          disabled={isProcessing}
          onPress={handleReject}
          className="flex-1 rounded-lg border-0 bg-muted"
          icon={<X size={18} color="#9CA3AF" strokeWidth={2.5} />}
        />
      </View>
    </View>
  );
}
