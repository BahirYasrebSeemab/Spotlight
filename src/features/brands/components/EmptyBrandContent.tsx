import React from 'react';
import { View, Text } from 'react-native';
import { Package, Users, FileText } from 'lucide-react-native';

interface EmptyBrandContentProps {
  activeTab: 'products' | 'community' | 'about';
}

export function EmptyBrandContent({ activeTab }: EmptyBrandContentProps) {
  const getEmptyState = () => {
    switch (activeTab) {
      case 'products':
        return {
          description: "This brand hasn't added any products to their catalog.",
          icon: <Package size={48} color="#6B7280" strokeWidth={1.5} />,
          title: 'No Products Yet',
        };
      case 'community':
        return {
          description: "No users have shared photos with this brand's products yet.",
          icon: <Users size={48} color="#6B7280" strokeWidth={1.5} />,
          title: 'No Community Posts',
        };
      case 'about':
        return {
          description: 'Brand information will appear here.',
          icon: <FileText size={48} color="#6B7280" strokeWidth={1.5} />,
          title: 'About This Brand',
        };
      default:
        return null;
    }
  };

  const state = getEmptyState();
  if (!state) return null;

  return (
    <View className="flex-1 items-center justify-center py-20 px-8">
      <View className="w-24 h-24 rounded-full bg-white/5 items-center justify-center mb-6">{state.icon}</View>
      <Text className="text-xl font-bold text-white mb-3 text-center">{state.title}</Text>
      <Text className="text-gray-400 text-center text-base leading-6">{state.description}</Text>
    </View>
  );
}
