
// import { View, Text, TouchableOpacity } from 'react-native';
// import { useLocalSearchParams } from 'expo-router';
// import { useResendVerification } from '@/src/features/auth/hooks/useResendVerification';

// export default function VerifyEmailScreen() {
//   const { email } = useLocalSearchParams<{ email: string }>();
//   const { resendVerification, loading, message } = useResendVerification();

//   return (
//     <View className="flex-1 justify-center items-center bg-white dark:bg-black px-6">
//       <Text className="text-2xl font-semibold text-center text-black dark:text-white mb-4">Verify Your Email</Text>
//       <Text className="text-gray-600 dark:text-gray-400 text-center mb-6">
//         A verification link has been sent to {email}. Please check your inbox and click the link to verify your account.
//       </Text>

//       <TouchableOpacity
//         className={`px-6 py-3 rounded-xl bg-blue-500 ${loading && 'opacity-60'}`}
//         disabled={loading}
//         onPress={() => resendVerification(email)}
//       >
//         <Text className="text-white font-semibold">{loading ? 'Sending...' : 'Resend Email'}</Text>
//       </TouchableOpacity>

//       {message && <Text className="text-green-500 mt-4 text-center">{message}</Text>}
//     </View>
//   );
// }
