import { useRouter } from 'expo-router';
import { MailCheck } from 'lucide-react-native';
import { View, Text, TouchableOpacity } from 'react-native';

import { useAppSelector } from '@/src/shared/hooks/redux';
import { selectCurrentUser } from '@/src/features/auth/slices/authSlice';

export function EmailVerifiedGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);

  const isVerified = !!user?.email_confirmed_at;

  if (!isVerified) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-8">
        <View className="w-20 h-20 rounded-full bg-white/5 items-center justify-center mb-6">
          <MailCheck size={40} color="#9CA3AF" />
        </View>
        <Text className="text-white text-2xl font-extrabold text-center mb-3">Verify Your Email</Text>
        <Text className="text-gray-400 text-center mb-8 leading-6">
          You need to verify your email address before accessing this page.
        </Text>
        <TouchableOpacity
          onPress={() => router.push(`/(auth)/verify-email?email=${user?.email}`)}
          className="bg-white px-8 py-4 rounded-xl w-full"
          activeOpacity={0.8}
        >
          <Text className="text-black font-bold text-base text-center">Verify Email</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
}
