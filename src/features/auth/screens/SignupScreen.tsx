// import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
// import { useState } from 'react';
// import * as ImagePicker from 'expo-image-picker';
// import { Ionicons } from '@expo/vector-icons';
// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// export default function Signup() {
//   const [step, setStep] = useState(1);

//   // form data
//   const [fullName, setFullName] = useState('');
//   const [email, setEmail] = useState('');
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPass, setConfirmPass] = useState('');
//   const [avatar, setAvatar] = useState('');
//   const [age, setAge] = useState('');
//   const [showPass, setShowPass] = useState(false);
//   const [showConfirmPass, setShowConfirmPass] = useState(false);

//   const nextStep = () => setStep(step + 1);
//   const prevStep = () => setStep(step - 1);

//   const pickAvatar = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 0.8,
//     });
//     if (!result.canceled) setAvatar(result.assets[0].uri);
//   };

//   const handleSignup = () => {
//     console.log({ fullName, email, username, password, avatar, age });
//     // TODO: Supabase signup logic here
//   };

//   return (
//     <KeyboardAwareScrollView
//       className="flex-1 bg-white dark:bg-black"
//       enableOnAndroid
//       contentContainerStyle={{ flexGrow: 1 }}
//     >
//       <View className="flex-1 justify-center items-center px-8 py-12">
//         <View className="w-full max-w-md">
//           <Text className="text-3xl font-extrabold text-center text-black dark:text-white mb-10">Create Account</Text>

//           {/* Step 1 - Basic Info */}
//           {step === 1 && (
//             <>
//               <View className="mb-4">
//                 <Text className="text-sm text-gray-600 dark:text-gray-300 mb-1">Full Name</Text>
//                 <TextInput
//                   className="border border-gray-300 dark:border-gray-700 rounded-xl p-3 text-black dark:text-white"
//                   placeholder="Your full name"
//                   value={fullName}
//                   onChangeText={setFullName}
//                 />
//               </View>
//               <View className="mb-8">
//                 <Text className="text-sm text-gray-600 dark:text-gray-300 mb-1">Email</Text>
//                 <TextInput
//                   className="border border-gray-300 dark:border-gray-700 rounded-xl p-3 text-black dark:text-white"
//                   placeholder="Your email"
//                   keyboardType="email-address"
//                   autoCapitalize="none"
//                   value={email}
//                   onChangeText={setEmail}
//                 />
//               </View>
//               <TouchableOpacity disabled={fullName && email ? false : true} onPress={nextStep} className="bg-blue-500 dark:bg-blue-600 py-3 rounded-xl">
//                 <Text className="text-white text-center font-semibold text-base">Next</Text>
//               </TouchableOpacity>
//             </>
//           )}

//           {/* Step 2 - Credentials */}
//           {step === 2 && (
//             <>
//               <View className="mb-4">
//                 <Text className="text-sm text-gray-600 dark:text-gray-300 mb-1">Username</Text>
//                 <TextInput
//                   className="border border-gray-300 dark:border-gray-700 rounded-xl p-3 text-black dark:text-white"
//                   placeholder="Choose a username"
//                   value={username}
//                   onChangeText={setUsername}
//                 />
//               </View>
//               <View className="w-full mb-2 relative">
//                 <Text className="text-sm text-gray-600 dark:text-gray-300 mb-1">Password</Text>
//                 <TextInput
//                   className="border border-gray-300 dark:border-gray-700 rounded-xl p-3 text-black dark:text-white"
//                   secureTextEntry
//                   placeholder="Password"
//                   value={password}
//                   onChangeText={setPassword}
//                 />
//                 <TouchableOpacity onPress={() => setShowPass(!showPass)} className="absolute right-3 top-[50%]">
//                   <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="#888" />
//                 </TouchableOpacity>
//               </View>
//               <View className="w-full mb-2 relative">
//                 <Text className="text-sm text-gray-600 dark:text-gray-300 mb-1">Confirm Password</Text>
//                 <TextInput
//                   className="border border-gray-300 dark:border-gray-700 rounded-xl p-3 text-black dark:text-white"
//                   secureTextEntry
//                   placeholder="Confirm password"
//                   value={confirmPass}
//                   onChangeText={setConfirmPass}
//                 />
//                 <TouchableOpacity onPress={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-[50%]">
//                   <Ionicons name={showConfirmPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="#888" />
//                 </TouchableOpacity>
//               </View>
//               <View className="flex-row justify-between">
//                 <TouchableOpacity onPress={prevStep}>
//                   <Text className="text-blue-500">Back</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity onPress={nextStep} className="bg-blue-500 py-3 px-6 rounded-xl">
//                   <Text className="text-white font-semibold">Next</Text>
//                 </TouchableOpacity>
//               </View>
//             </>
//           )}

//           {/* Step 3 - Avatar + Optional Info */}
//           {step === 3 && (
//             <>
//               <TouchableOpacity onPress={pickAvatar} className="self-center mb-6">
//                 {avatar ? (
//                   <Image source={{ uri: avatar }} className="w-24 h-24 rounded-full" />
//                 ) : (
//                   <View className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-800 justify-center items-center">
//                     <Ionicons name="camera-outline" size={30} color="#777" />
//                   </View>
//                 )}
//               </TouchableOpacity>

//               <View className="mb-4">
//                 <Text className="text-sm text-gray-600 dark:text-gray-300 mb-1">Age (optional)</Text>
//                 <TextInput
//                   className="border border-gray-300 dark:border-gray-700 rounded-xl p-3 text-black dark:text-white"
//                   placeholder="Enter your age"
//                   keyboardType="numeric"
//                   value={age}
//                   onChangeText={setAge}
//                 />
//               </View>

//               <View className="flex-row justify-between">
//                 <TouchableOpacity onPress={prevStep}>
//                   <Text className="text-blue-500">Back</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity onPress={handleSignup} className="bg-blue-500 py-3 px-6 rounded-xl">
//                   <Text className="text-white font-semibold">Finish</Text>
//                 </TouchableOpacity>
//               </View>
//             </>
//           )}
//         </View>
//       </View>
//     </KeyboardAwareScrollView>
//   );
// }


import { View } from 'react-native';
import { SignupStep1, SignupStep2, SignupStep3, AuthHeader } from '@/src/features/auth/components';
import { useSignup } from '@/src/features/auth/hooks/useSignup';

export default function SignupScreen() {
  const { form, step, nextStep, prevStep, updateField, handleSignup } = useSignup();

  return (
    <View className="flex-1 justify-center px-8 py-12">
      <AuthHeader title="Create Account" />
      {step === 1 && <SignupStep1 form={form} onChange={updateField} onNext={nextStep} />}
      {step === 2 && <SignupStep2 form={form} onChange={updateField} onNext={nextStep} onBack={prevStep} />}
      {step === 3 && <SignupStep3 form={form} onChange={updateField} onBack={prevStep} onSubmit={handleSignup} />}
    </View>
  );
}
