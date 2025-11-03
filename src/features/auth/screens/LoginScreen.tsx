// import { View, Text, TouchableOpacity } from 'react-native';
// import { Link } from 'expo-router';
// import { useState } from 'react';
// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// import { useAppDispatch, useAppSelector } from '@/src/shared/hooks/redux';
// import { InputField } from '@/src/shared/components/InputField';
// import { Divider } from '@/src/shared/components/Divider';
// import { GoogleButton } from '@/src/shared/components/GoogleButton';

// export default function LoginScreen() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const dispatch = useAppDispatch();
//   const { loading, error } = useAppSelector(state => state.auth);

//   const handleLogin = async () => {

//   };

//   const handleGoogleLogin = () => {
//     console.log('Google login (later with Supabase OAuth)');
//   };

//   return (
//     <KeyboardAwareScrollView
//       className="flex-1 bg-white dark:bg-black"
//       enableOnAndroid
//       keyboardShouldPersistTaps="handled"
//       contentContainerStyle={{ flexGrow: 1 }}
//     >
//       <View className="flex-1 justify-center items-center px-8 py-12">
//         <View className="w-full max-w-md">
//           <Text className="text-3xl font-extrabold text-center text-black dark:text-white mb-10">Spotlight</Text>

//           {/* Email */}
//           <InputField
//             label='Email'
//             className="w-full border border-gray-300 dark:border-gray-700 rounded-xl p-3 text-black dark:text-white"
//             placeholderTextColor="#888"
//             keyboardType="email-address"
//             autoCapitalize="none"
//             value={email}
//             onChangeText={setEmail}
//           />

//           {/* Password */}
//           <View className="relative mb-2 flex justify-center">
//             <InputField
//               password={true}
//               label='Password'
//               className="w-full border border-gray-300 dark:border-gray-700 rounded-xl p-3 pr-10 text-black dark:text-white"
//               placeholderTextColor="#888"
//               value={password}
//               onChangeText={setPassword}
//             />
//           </View>

//           {/* Error message */}
//           {error && <Text className="text-red-500 text-center mb-2">{error}</Text>}

//           {/* Login button */}
//           <TouchableOpacity
//             onPress={handleLogin}
//             disabled={loading}
//             className={`w-full py-3 rounded-xl mb-4 ${loading ? 'bg-gray-400' : 'bg-blue-500 dark:bg-blue-600'}`}
//           >
//             <Text className="text-white text-center font-semibold text-base">
//               {loading ? 'Logging in...' : 'Log in'}
//             </Text>
//           </TouchableOpacity>

//           <Divider/>

//           {/* Google Login */}
//           <GoogleButton className="mb-4" onPress={handleGoogleLogin} />

//           {/* Signup link */}
//           <View className="flex-row justify-center">
//             <Text className="text-gray-600 dark:text-gray-300">Don’t have an account? </Text>
//             <Link href={'/signup'} className="text-blue-500 dark:text-blue-400 font-semibold">
//               Sign up
//             </Link>
//           </View>
//         </View>
//       </View>
//     </KeyboardAwareScrollView>
//   );
// }


import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { InputField } from '@/src/shared/components/InputField';
import { Divider } from '@/src/shared/components/Divider';
import { GoogleButton } from '@/src/shared/components/GoogleButton';
import { useLogin, useOAuth } from '@/src/features/auth/hooks';
import { useAppSelector } from '@/src/shared/hooks/redux';

export default function LoginScreen() {
  const { email, password, setEmail, setPassword, handleLogin, localError } = useLogin();
  const { loading, error } = useAppSelector(state => state.auth);
  const { handleGoogleLogin, loading: oAuthLoading } = useOAuth();

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-white dark:bg-black"
      enableOnAndroid
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="flex-1 justify-center items-center px-8 py-12">
        <View className="w-full max-w-md">
          <Text className="text-3xl font-extrabold text-center text-black dark:text-white mb-10">Spotlight</Text>

          {/* Email */}
          <InputField
            label="Email"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          {/* Password */}
          <InputField
            password
            label="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
          />

          {/* Error message */}
          {(localError || error) && <Text className="text-red-500 text-center mb-2">{localError || error}</Text>}

          {/* Login button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className={`w-full py-3 rounded-xl mb-4 ${loading ? 'bg-gray-400' : 'bg-blue-500 dark:bg-blue-600'}`}
          >
            <Text className="text-white text-center font-semibold text-base">
              {loading ? 'Logging in...' : 'Log in'}
            </Text>
          </TouchableOpacity>

          <Divider />

          {/* Google Login */}
          <GoogleButton loading={oAuthLoading} className="mb-4" handleGoogleLogin={handleGoogleLogin} />

          {/* Signup link */}
          <View className="flex-row justify-center">
            <Text className="text-gray-600 dark:text-gray-300">Don’t have an account? </Text>
            <Link href={'/signup'} className="text-blue-500 dark:text-blue-400 font-semibold">
              Sign up
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
