import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function Signup() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black">
      <Text className="text-xl font-bold text-dark dark:text-white">Signup</Text>
      <View className="h-[1px] w-4/5 my-8 bg-[#eee] dark:bg-zinc-900" />
      <View className="mt-2 mx-5 items-center">
        <Text className="text-center text-blue-500 dark:text-white">hello this is Signup page</Text>
      </View>
      <View className="h-[1px] w-4/5 my-8 bg-[#eee] dark:bg-zinc-900" />
      <View className="mt-2 mx-5 items-center">
        <Link href={'./index'} className="text-center text-blue-500 dark:text-white">
          login
        </Link>
      </View>
    </View>
  );
}
