// ========================================
// app/(tabs)/notifications/index.tsx - FIXED
// ========================================
import { View, FlatList, Text, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { useAppSelector } from '@/src/shared/hooks/redux';
import { useReceivedFollowRequests } from '@/src/features/user/hooks/useReceivedFollowRequests';
import { useFollowRequests } from '@/src/features/user/hooks/useFollowRequests';
import { UserPlus } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { FollowRequestItem } from '@/src/features/notifications/components/FollowRequestItem';

export default function NotificationsScreen() {
  const authUser = useAppSelector(state => state.auth.user);
  const [activeTab, setActiveTab] = useState<'requests' | 'activity'>('requests');

  const { data: requestsData, isLoading, fetchNextPage, hasNextPage } = useReceivedFollowRequests(authUser?.id);

  const { acceptAsync, rejectAsync } = useFollowRequests();

  const requests = requestsData?.pages.flatMap(page => page) || [];

  const handleAccept = async (requestId: string) => {
    try {
      const result = await acceptAsync(requestId);
      Alert.alert('Success', 'Follow request accepted!');
    } catch (error: any) {
      console.error('❌ Error accepting request:', error);
      Alert.alert('Error', error?.message || 'Failed to accept request. Please try again.');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectAsync(requestId);
    } catch (error: any) {
      console.error('❌ Error rejecting request:', error);
      Alert.alert('Error', 'Failed to decline request. Please try again.');
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* Tab Switcher */}
      <View className="flex-row border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
        <TouchableOpacity
          onPress={() => setActiveTab('requests')}
          className={`flex-1 py-4 items-center border-b-2 ${
            activeTab === 'requests' ? 'border-white' : 'border-transparent'
          }`}
        >
          <View className="flex-row items-center">
            <Text
              className={`font-semibold text-base ${
                activeTab === 'requests' ? 'text-white' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Spot Requests
            </Text>
            {requests.length > 0 && (
              <View className="ml-2 bg-white rounded-full w-5 h-5 items-center justify-center">
                <Text className="text-black text-xs font-bold">{requests.length}</Text>
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
          renderItem={({ item }) => <FollowRequestItem item={item} onAccept={handleAccept} onReject={handleReject} />}
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
