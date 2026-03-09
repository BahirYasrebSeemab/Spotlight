import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppSelector } from '@/src/shared/hooks/redux';
import { Shirt, Search, Plus, Bell, User } from 'lucide-react-native';
import { Spotlight } from '@/src/shared/components/Spotlight';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: Shirt,
    title: 'Your Digital Closet',
    description:
      'Everything you own, in one place. Your closet is your personal catalog of items — shoes, clothes, accessories. Add anything you own and build your collection.',
  },
  {
    icon: Plus,
    title: 'Add What You Own',
    description:
      'Tap the Add button to log an item. Search for it in our database, pick a match, upload your own photo, and optionally remove the background for a clean professional look.',
  },
  {
    icon: Search,
    title: 'Discover & Search',
    description:
      'Search for products, brands, and other people. Find items you want to add to your closet or discover what others are wearing.',
  },
  {
    icon: Bell,
    title: 'Stay in the Loop',
    description:
      "Activity keeps you updated — see who followed you, who liked your memories, and what's happening in your community.",
  },
  {
    icon: User,
    title: 'Your Profile',
    description:
      'Your profile is your public identity. Others can follow you, browse your closet, and see your memories. Make it yours.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const user = useAppSelector(state => state.auth.user);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isLast = currentIndex === SLIDES.length - 1;
  const slide = SLIDES[currentIndex];
  const Icon = slide.icon;

  const markComplete = async () => {
    if (user?.id) {
      await AsyncStorage.setItem(`onboarding_completed_${user.id}`, 'true');
    }
    router.replace('/(tabs)');
  };

  const handleNext = async () => {
    if (isLast) {
      await markComplete();
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  const handleSkip = async () => {
    await markComplete();
  };

  return (
    <Spotlight intensity={0.2}>
      <View className="flex-1 bg-black px-6">
        {/* Skip */}
        <View className="pt-14 items-end">
          {!isLast && (
            <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
              <Text className="text-gray-400 text-base font-medium">Skip</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        <View className="flex-1 items-center justify-center">
          {/* Icon */}
          <View className="w-28 h-28 rounded-full bg-white/5 border border-white/10 items-center justify-center mb-10">
            <Icon size={52} color="#ffffff" strokeWidth={1.5} />
          </View>

          {/* Text */}
          <Text className="text-white text-3xl font-extrabold text-center mb-4">{slide.title}</Text>
          <Text className="text-gray-400 text-base text-center leading-7">{slide.description}</Text>
        </View>

        {/* Bottom */}
        <View className="pb-12">
          {/* Dots */}
          <View className="flex-row justify-center gap-2 mb-8">
            {SLIDES.map((_, i) => (
              <View
                key={i}
                className={`rounded-full ${i === currentIndex ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/20'}`}
              />
            ))}
          </View>

          {/* Button */}
          <TouchableOpacity onPress={handleNext} className="w-full bg-white py-4 rounded-xl" activeOpacity={0.8}>
            <Text className="text-black font-bold text-base text-center">{isLast ? 'Get Started' : 'Next'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Spotlight>
  );
}
