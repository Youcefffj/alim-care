import { Stack } from 'expo-router';

export default function CommunauteLayout() {
  return (
    <Stack 
      screenOptions={{ 
        // On cache le header par défaut car vous avez fait votre propre design
        // avec la flèche retour et le titre dans add-recipe.tsx
        headerShown: false,
        // Optionnel : Animation fluide style "carte" sur iOS
        presentation: 'card' 
      }} 
    >
      {/* On déclare l'écran explicitement (optionnel mais propre) */}
      <Stack.Screen name="add-recipe" />
    </Stack>
  );
}