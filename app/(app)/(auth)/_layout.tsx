import { Stack } from "expo-router";
import { useAppSelector } from "@/src/shared/hooks/redux";

export default function AuthLayout() {
  const isPasswordResetSession = useAppSelector(state => state.auth.isPasswordResetSession);
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="verify-email" options={{ headerShown: false }} />
      <Stack.Screen name="forget-password" options={{ headerShown: false }} />
      <Stack.Protected guard={isPasswordResetSession}>
        <Stack.Screen name="reset-password" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Screen name="callback" options={{ headerShown: false }} />
    </Stack>
  );
}
