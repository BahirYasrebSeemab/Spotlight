// app/(tabs)/search/index.tsx - Search Users Page
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Search, X } from 'lucide-react-native';
import { useDebounce } from '@/src/shared/hooks/useDebounce';
import { useSearchUsers } from '@/src/features/search/hooks/useSearchUsers';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);

  const { data: users, isLoading } = useSearchUsers(debouncedQuery);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleUserPress = (userId: string) => {
    router.push(`/user/${userId}`);
  };

  const renderUser = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => handleUserPress(item.id)}
      className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-800"
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.avatarUrl }} className="w-14 h-14 rounded-full mr-3" />
      <View className="flex-1">
        <Text className="text-base font-semibold text-black dark:text-white">{item.name || item.username}</Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400">@{item.username}</Text>
        {item.bio && (
          <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1" numberOfLines={1}>
            {item.bio}
          </Text>
        )}
        {item.followersCount > 0 && (
          <Text className="text-xs text-gray-500 dark:text-gray-500 mt-1">{item.followersCount} spotters</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      );
    }

    if (!searchQuery) {
      return (
        <View className="flex-1 items-center justify-center py-20 px-8">
          <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-900 items-center justify-center mb-4">
            <Search size={32} color="#9CA3AF" />
          </View>
          <Text className="text-xl font-bold text-black dark:text-white mb-2">Search for people</Text>
          <Text className="text-center text-gray-500 dark:text-gray-400">Find users by their username or name</Text>
        </View>
      );
    }

    if (searchQuery && users?.length === 0) {
      return (
        <View className="flex-1 items-center justify-center py-20 px-8">
          <Text className="text-lg font-semibold text-black dark:text-white mb-2">No users found</Text>
          <Text className="text-center text-gray-500 dark:text-gray-400">Try searching for a different username</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white dark:bg-black"
    >
      {/* Header */}
      <View className="pt-12 pb-3 px-4 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <Text className="text-2xl font-bold text-black dark:text-white mb-3">Search</Text>

        {/* Search Input */}
        <View className="flex-row items-center bg-gray-100 dark:bg-gray-900 rounded-full px-4 py-3">
          <Search size={20} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search users..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-3 text-base text-black dark:text-white"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} className="ml-2">
              <X size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results */}
      <FlatList
        data={users || []}
        renderItem={renderUser}
        keyExtractor={item => item.id}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      />
    </KeyboardAvoidingView>
  );
}
