import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Heart } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';

export default function SanteScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Heart size={60} color={Colors.primary} />
        <Text style={styles.title}>Santé</Text>
        <Text style={styles.subtitle}>À venir...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: Colors.contrastMainII,
    marginTop: 20,
  },
  subtitle: { 
    fontSize: 16, 
    color: Colors.grayMedium,
    marginTop: 10,
  },
});
