import { Text, View, ActivityIndicator } from 'react-native';

const CustomSplashScreen = ({ status }: { status: string }) => {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color="#ffffff" />
      <Text className="mt-4 text-muted-foreground">{status}</Text>
    </View>
  );
};

export default CustomSplashScreen;
