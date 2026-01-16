import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function Welcome() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Alim Care 🥗</Text>
      <TouchableOpacity onPress={() => router.push('/register')} style={{ padding: 15, backgroundColor: 'blue', borderRadius: 8 }}>
        <Text style={{ color: 'white' }}>Commencer</Text>
      </TouchableOpacity>
    </View>
  );
}