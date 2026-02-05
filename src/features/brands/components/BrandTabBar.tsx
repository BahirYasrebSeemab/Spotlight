import React from 'react';
import { View, Text, Pressable } from 'react-native';

interface BrandTabBarProps {
  activeTab: 'products' | 'community' | 'about';
  onTabChange: (tab: 'products' | 'community' | 'about') => void;
}

export function BrandTabBar({ activeTab, onTabChange }: BrandTabBarProps) {
  const tabs = [
    { id: 'products' as const, label: 'Products' },
    { id: 'community' as const, label: 'Community' },
    { id: 'about' as const, label: 'About' },
  ];

  return (
    <View className="flex-row border-b border-white/10">
      {tabs.map(tab => (
        <Pressable
          key={tab.id}
          onPress={() => onTabChange(tab.id)}
          className="flex-1 py-3 items-center"
          style={{
            borderBottomWidth: activeTab === tab.id ? 2 : 0,
            borderBottomColor: '#ffffff',
          }}
        >
          <Text className={activeTab === tab.id ? 'text-white font-semibold' : 'text-gray-400'}>{tab.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
