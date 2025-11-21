import { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { useRouter } from 'expo-router';

export default function OnboardingScreen() {
  const [username, setUsername] = useState('');
  const router = useRouter();

  return (
    <View>
      <Text>Onboarding screen</Text>
      <Button
        title="Next"
        onPress={() => {
          router.push({
            pathname: '/(tabs)',
          });
        }}
      />
    </View>
  );
}
