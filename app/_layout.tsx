import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
            // Bloque le swipe retour sur iOS pour toute la section (tabs)
            gestureEnabled: false 
          }} 
        />
      <Stack.Screen name="(account)" />
    </Stack>
  );
}