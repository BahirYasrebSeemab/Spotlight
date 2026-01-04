// app/(tabs)/notifications/index.tsx
import { View, FlatList, Text, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAppSelector } from '@/src/shared/hooks/redux';
import { useReceivedFollowRequests } from '@/src/features/user/hooks/useReceivedFollowRequests';
import { useFollowRequests } from '@/src/features/user/hooks/useFollowRequests';
import { Check, X, UserPlus } from 'lucide-react-native';

export default function NotificationsScreen() {
  const { user: currentUser } = useAppSelector(state => state.user);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'requests' | 'activity'>('requests');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const {
    data: requestsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useReceivedFollowRequests(currentUser?.id);

  const { accept, reject, isAccepting, isRejecting } = useFollowRequests();

  const requests = requestsData?.pages.flatMap(page => page) || [];

  const handleAccept = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      await accept(requestId);
      // Refetch to update UI
      await refetch();
      Alert.alert('Success', 'Follow request accepted!');
    } catch (error) {
      console.error('Error accepting request:', error);
      Alert.alert('Error', 'Failed to accept request. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      await reject(requestId);
      // Refetch to update UI
      await refetch();
      Alert.alert('Success', 'Follow request declined');
    } catch (error) {
      console.error('Error rejecting request:', error);
      Alert.alert('Error', 'Failed to decline request. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const renderRequest = ({ item }: any) => {
    const isProcessing = processingId === item.id;

    return (
      <View className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
        <View className="flex-row items-center mb-3">
          <TouchableOpacity
            onPress={() => router.push(`/user/${item.requesterId}`)}
            className="mr-3"
            disabled={isProcessing}
          >
            {item.requester?.avatarUrl ? (
              <Image source={{ uri: item.requester.avatarUrl }} className="w-14 h-14 rounded-full" />
            ) : (
              <View className="w-14 h-14 rounded-full bg-purple-500 items-center justify-center">
                <Text className="text-white text-xl font-bold">
                  {item.requester?.name?.[0] || item.requester?.username?.[0] || '?'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <View className="flex-1">
            <TouchableOpacity onPress={() => router.push(`/user/${item.requesterId}`)} disabled={isProcessing}>
              <Text className="font-bold text-base text-black dark:text-white">
                {item.requester?.name || item.requester?.username}
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">@{item.requester?.username}</Text>
            </TouchableOpacity>
            <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">wants to spot you</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => handleAccept(item.id)}
            disabled={isProcessing}
            className="flex-1 flex-row items-center justify-center bg-purple-600 py-2.5 rounded-lg"
            activeOpacity={0.8}
          >
            {isProcessing && isAccepting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Check size={18} color="white" strokeWidth={2.5} />
                <Text className="text-white font-semibold ml-2">Accept</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleReject(item.id)}
            disabled={isProcessing}
            className="flex-1 flex-row items-center justify-center bg-gray-200 dark:bg-gray-800 py-2.5 rounded-lg"
            activeOpacity={0.8}
          >
            {isProcessing && isRejecting ? (
              <ActivityIndicator size="small" color="#9CA3AF" />
            ) : (
              <>
                <X size={18} color="#9CA3AF" strokeWidth={2.5} />
                <Text className="text-gray-700 dark:text-gray-300 font-semibold ml-2">Decline</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* Tab Switcher */}
      <View className="flex-row border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
        <TouchableOpacity
          onPress={() => setActiveTab('requests')}
          className={`flex-1 py-4 items-center border-b-2 ${
            activeTab === 'requests' ? 'border-purple-600' : 'border-transparent'
          }`}
        >
          <View className="flex-row items-center">
            <Text
              className={`font-semibold text-base ${
                activeTab === 'requests' ? 'text-purple-600' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Spot Requests
            </Text>
            {requests.length > 0 && (
              <View className="ml-2 bg-purple-600 rounded-full w-5 h-5 items-center justify-center">
                <Text className="text-white text-xs font-bold">{requests.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('activity')}
          className={`flex-1 py-4 items-center border-b-2 ${
            activeTab === 'activity' ? 'border-purple-600' : 'border-transparent'
          }`}
        >
          <Text
            className={`font-semibold text-base ${
              activeTab === 'activity' ? 'text-purple-600' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Activity
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'requests' ? (
        <FlatList
          data={requests}
          renderItem={renderRequest}
          keyExtractor={item => item.id}
          onEndReached={() => {
            if (hasNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{ flexGrow: 1 }}
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center py-20 px-8">
              {isLoading ? (
                <ActivityIndicator size="large" color="#8B5CF6" />
              ) : (
                <>
                  <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-900 items-center justify-center mb-4">
                    <UserPlus size={32} color="#9CA3AF" strokeWidth={1.5} />
                  </View>
                  <Text className="text-xl font-bold text-black dark:text-white mb-2">No spot requests</Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-center">
                    When someone requests to spot you,{'\n'}
                    they'll appear here
                  </Text>
                </>
              )}
            </View>
          )}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-900 items-center justify-center mb-4">
            <Text className="text-3xl">🔔</Text>
          </View>
          <Text className="text-xl font-bold text-black dark:text-white mb-2">Activity feed</Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center">
            Your activity notifications will appear here soon
          </Text>
        </View>
      )}
    </View>
  );
}
