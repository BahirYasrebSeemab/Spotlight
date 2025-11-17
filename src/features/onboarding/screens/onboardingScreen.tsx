// import { useState } from 'react';
// import { View, TextInput, Button } from 'react-native';
// import { useRouter } from 'expo-router';

// export default function UsernameScreen() {
//   const [username, setUsername] = useState('');
//   const router = useRouter();

//   return (
//     <View>
//       <TextInput placeholder="Username" value={username} onChangeText={setUsername} />
//       <Button
//         title="Next"
//         onPress={() => {
//           router.push({
//             pathname: '/onboarding/NameScreen',
//             params: { username },
//           });
//         }}
//       />
//     </View>
//   );
// }
