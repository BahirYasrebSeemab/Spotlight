import { View, Text, Image, ActivityIndicator } from 'react-native';

export default function IdentitySection({ user, loading }: { user?: any, loading: boolean }) {

  return (
    <View className="items-center pb-16 pt-6 bg-white dark:bg-black border-gray-400 dark:border-gray-800 border rounded-lg w-full">
      <View className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-gray-800 items-center justify-center">
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Image
            source={{ uri: user?.avatarUrl }}
            className="w-28 h-28 rounded-full mb-4"
          />
        )}
      </View>

      <Text className="text-2xl font-bold text-black dark:text-white">{user?.name || user?.username}</Text>

      <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-3">@{user?.username}</Text>

      {user?.bio && <Text className="text-center text-gray-700 dark:text-gray-300 px-10 leading-5">{user.bio}</Text>}

      <View className="flex-row mt-6 space-x-8">
        <View className="items-center">
          <Text className="text-lg font-semibold text-black dark:text-white">0</Text>
          <Text className="text-gray-600 dark:text-gray-400 text-sm">Followers</Text>
        </View>

        <View className="items-center">
          <Text className="text-lg font-semibold text-black dark:text-white">0</Text>
          <Text className="text-gray-600 dark:text-gray-400 text-sm">Following</Text>
        </View>
      </View>
    </View>
  );
}
