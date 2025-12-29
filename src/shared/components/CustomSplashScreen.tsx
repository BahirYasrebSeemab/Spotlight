import { View, ActivityIndicator } from 'react-native';

const CustomSplashScreen = () => {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black">
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  );
};

export default CustomSplashScreen;
