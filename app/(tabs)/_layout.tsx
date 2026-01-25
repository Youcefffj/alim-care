import React from 'react';
import { Tabs } from 'expo-router';
import { CustomTabBar } from '../../components/CustomTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="recettes" />
      <Tabs.Screen name="sante" />
      <Tabs.Screen name="communaute" />
      <Tabs.Screen name="compte" />
    </Tabs>
  );
}
