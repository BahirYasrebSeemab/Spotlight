// ========================================
// src/features/user/components/FollowRequestItem.tsx - NEW COMPONENT
// ========================================
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Check, X } from 'lucide-react-native';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';

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
          {item.requester?.avatarUrl ? (
            <Image source={{ uri: item.requester.avatarUrl }} className="w-14 h-14 rounded-full" />
          ) : (
            <View className="w-14 h-14 rounded-full bg-white items-center justify-center">
              <Text className="text-black text-xl font-bold">
                {item.requester?.name?.[0] || item.requester?.username?.[0] || '?'}
              </Text>
            </View>
          )}
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
        <TouchableOpacity
          onPress={handleAccept}
          disabled={isProcessing}
          className="flex-1 flex-row items-center justify-center bg-white py-2.5 rounded-lg"
          activeOpacity={0.8}
        >
          {isProcessing && action === 'accept' ? (
            <ActivityIndicator size="small" color="black" />
          ) : (
            <>
              <Check size={18} color="black" strokeWidth={2.5} />
              <Text className="text-black font-semibold ml-2">Accept</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleReject}
          disabled={isProcessing}
          className="flex-1 flex-row items-center justify-center bg-muted py-2.5 rounded-lg"
          activeOpacity={0.8}
        >
          {isProcessing && action === 'reject' ? (
            <ActivityIndicator size="small" color="#9CA3AF" />
          ) : (
            <>
              <X size={18} color="#9CA3AF" strokeWidth={2.5} />
              <Text className="text-muted-foreground font-semibold ml-2">Decline</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
