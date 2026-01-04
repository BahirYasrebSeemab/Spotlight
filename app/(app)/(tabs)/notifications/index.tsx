// ========================================
// app/(tabs)/notifications/index.tsx - Follow Requests Tab
// ========================================
import { View, FlatList, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAppSelector } from '@/src/shared/hooks/redux';
import { useReceivedFollowRequests } from '@/src/features/user/hooks/useReceivedFollowRequests';
import { useFollowRequests } from '@/src/features/user/hooks/useFollowRequests';
import { Check, X } from 'lucide-react-native';

export default function NotificationsScreen() {
  const { user: currentUser } = useAppSelector(state => state.user);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'requests' | 'activity'>('requests');

  const { data: requestsData, isLoading, fetchNextPage, hasNextPage } = useReceivedFollowRequests(currentUser?.id);

  const { accept, reject, isLoading: actionLoading } = useFollowRequests();

  const requests = requestsData?.pages.flatMap(page => page) || [];

  const renderRequest = ({ item }: any) => (
    <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
      <TouchableOpacity
        onPress={() => router.push(`/user/${item.requesterId}`)}
        className="flex-row items-center flex-1"
      >
        <Image source={{ uri: item.requester?.avatarUrl }} className="w-12 h-12 rounded-full mr-3" />
        <View className="flex-1">
          <Text className="font-semibold text-black dark:text-white">
            {item.requester?.name || item.requester?.username}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">wants to spot you</Text>
        </View>
      </TouchableOpacity>

      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={() => accept(item.id)}
          disabled={actionLoading}
          className="bg-purple-600 w-10 h-10 rounded-full items-center justify-center"
        >
          <Check size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => reject(item.id)}
          disabled={actionLoading}
          className="bg-gray-200 dark:bg-gray-800 w-10 h-10 rounded-full items-center justify-center"
        >
          <X size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* Tab Switcher */}
      <View className="flex-row border-b border-gray-200 dark:border-gray-800">
        <TouchableOpacity
          onPress={() => setActiveTab('requests')}
          className={`flex-1 py-4 items-center border-b-2 ${
            activeTab === 'requests' ? 'border-purple-600' : 'border-transparent'
          }`}
        >
          <Text
            className={`font-semibold ${
              activeTab === 'requests' ? 'text-purple-600' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Spot Requests
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('activity')}
          className={`flex-1 py-4 items-center border-b-2 ${
            activeTab === 'activity' ? 'border-purple-600' : 'border-transparent'
          }`}
        >
          <Text
            className={`font-semibold ${
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
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center py-20">
              {isLoading ? (
                <ActivityIndicator size="large" color="#8B5CF6" />
              ) : (
                <>
                  <Text className="text-xl font-bold text-black dark:text-white mb-2">No spot requests</Text>
                  <Text className="text-gray-500 dark:text-gray-400">Requests will appear here</Text>
                </>
              )}
            </View>
          )}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500 dark:text-gray-400">Activity feed coming soon</Text>
        </View>
      )}
    </View>
  );
}

