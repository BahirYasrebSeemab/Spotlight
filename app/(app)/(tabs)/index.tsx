import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';


export default function Home() {
  
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black">
      <Text className="text-xl font-bold text-dark dark:text-white">Home</Text>
      <View className="h-[1px] w-4/5 my-8 bg-[#eee] dark:bg-zinc-900" />
      <View className="mt-6 mx-5 items-center">
        <Text className="text-center text-blue-500 dark:text-white">this is home page</Text>
      </View>
    </View>
  );
}
