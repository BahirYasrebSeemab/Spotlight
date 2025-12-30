import { Text, View, ActivityIndicator } from 'react-native';

const CustomSplashScreen = ({ status }: { status: string }) => {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black">
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text className="mt-4 text-gray-700 dark:text-gray-300">{status}</Text>
    </View>
  );
};

export default CustomSplashScreen;
