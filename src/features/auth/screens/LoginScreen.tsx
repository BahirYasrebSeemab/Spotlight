import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleLogin = () => {
    console.log('Logging in with:', email, password);
  };

  const handleGoogleLogin = () => {
    console.log('Google login');
  };

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

          {/* Email Input */}
          <View className="w-full mb-4">
            <Text className="text-sm text-gray-600 dark:text-gray-300 mb-1">Email</Text>
            <TextInput
              className="w-full border border-gray-300 dark:border-gray-700 rounded-xl p-3 text-black dark:text-white"
              placeholder="Enter your email"
              placeholderTextColor="#888"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password Input */}
          <View className="w-full mb-2 relative">
            <Text className="text-sm text-gray-600 dark:text-gray-300 mb-1">Password</Text>
            <TextInput
              className="w-full border border-gray-300 dark:border-gray-700 rounded-xl p-3 pr-10 text-black dark:text-white"
              placeholder="Enter your password"
              placeholderTextColor="#888"
              secureTextEntry={!showPass}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} className="absolute right-3 top-[50%]">
              <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="#888" />
            </TouchableOpacity>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity className="self-end mb-6">
            <Text className="text-sm text-blue-500 dark:text-blue-400">Forgot password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity onPress={handleLogin} className="w-full bg-blue-500 dark:bg-blue-600 py-3 rounded-xl mb-4">
            <Text className="text-white text-center font-semibold text-base">Log in</Text>
          </TouchableOpacity>

          {/* Google Login */}
          <TouchableOpacity
            onPress={handleGoogleLogin}
            className="w-full border border-gray-300 dark:border-gray-700 flex-row items-center justify-center py-3 rounded-xl mb-6"
          >
            <Ionicons name="logo-google" size={18} color="#DB4437" />
            <Text className="text-black dark:text-white font-medium ml-2">Continue with Google</Text>
          </TouchableOpacity>

          {/* Signup Link */}
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

// src/features/auth/hooks/useSignup.ts
// import { useState } from "react";
// import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
// import { signup } from "../slices/authSlice";
// import { SignupForm } from "@/src/shared/types/form.types";

// export const useSignup = () => {
//   const dispatch = useAppDispatch();
//   const { loading, error } = useAppSelector((state) => state.auth);

//   const [form, setForm] = useState<SignupForm>({
//     fullName: "",
//     email: "",
//     password: "",
//   });
//   const [step, setStep] = useState(1);

//   const updateField = (key: keyof SignupForm, value: string) => {
//     setForm((prev) => ({ ...prev, [key]: value }));
//   };

//   const nextStep = () => setStep((prev) => prev + 1);
//   const prevStep = () => setStep((prev) => prev - 1);

//   const handleSignup = async () => {
//     await dispatch(signup(form));
//   };

//   return { form, step, nextStep, prevStep, updateField, handleSignup, loading, error };
// };
