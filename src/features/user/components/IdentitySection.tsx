import { View, Text, Image } from 'react-native';

export default function IdentitySection({ profile }: any) {
  return (
    <View className="items-center pb-16 pt-6 bg-white dark:bg-black border-gray-400 dark:border-gray-800 border rounded-lg w-full">
      {/* Avatar */}
      <View className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-gray-800">
        <Image source={{ uri: profile.avatarUrl }} className="w-28 h-28 rounded-full mb-4" />
      </View>
      
      {/* Name */}
      <Text className="text-2xl font-bold text-black dark:text-white">{profile.name || profile.username}</Text>

      {/* Username */}
      <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-3">@{profile.username}</Text>

      {/* Bio */}
      {profile.bio && (
        <Text className="text-center text-gray-700 dark:text-gray-300 px-10 leading-5">{profile.bio}</Text>
      )}

      {/* Followers row (placeholder for now) */}
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
