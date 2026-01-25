import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, BookOpen, Heart, Users, User } from 'lucide-react-native';
import { Colors } from '../constants/Colors';

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const tabs = [
  { name: 'dashboard', label: 'Accueil', icon: Home },
  { name: 'recettes', label: 'Recettes', icon: BookOpen },
  { name: 'sante', label: 'Santé', icon: Heart },
  { name: 'communaute', label: 'Communauté', icon: Users },
  { name: 'compte', label: 'Compte', icon: User },
];

export const CustomTabBar = ({ state, descriptors, navigation }: TabBarProps) => {
  return (
    <View style={styles.container}>
      {state.routes.map((route: any, index: number) => {
        const tab = tabs.find(t => t.name === route.name);
        if (!tab) return null;

        const isFocused = state.index === index;
        const IconComponent = tab.icon;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <IconComponent
                size={24}
                color={isFocused ? Colors.primary : Colors.grayMedium}
                strokeWidth={isFocused ? 2.5 : 2}
              />
              {isFocused && <View style={styles.indicator} />}
            </View>
            <Text style={[
              styles.label,
              { color: isFocused ? Colors.primary : Colors.grayMedium }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: 10,
    paddingBottom: 25,
    borderTopWidth: 1,
    borderTopColor: Colors.gris,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    bottom: -8,
    width: 20,
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  label: {
    fontSize: 10,
    marginTop: 8,
    fontWeight: '500',
  },
});
