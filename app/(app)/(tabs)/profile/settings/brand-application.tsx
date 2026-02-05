import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Spotlight } from '@/src/shared/components/Spotlight';
import { useAppSelector } from '@/src/shared/hooks/redux';
import { useBrandApplication } from '@/src/features/brands/hooks/useBrandApplication';
import * as ImagePicker from 'expo-image-picker';
import { ChevronLeft, Upload, X } from 'lucide-react-native';
import type { BrandApplication } from '@/src/features/brands/types/brand.types';

export default function BrandApplicationScreen() {
  const router = useRouter();
  const currentUser = useAppSelector(state => state.auth.user);
  const { submit, isSubmitting, isSuccess } = useBrandApplication();

  // Form state
  const [formData, setFormData] = useState<BrandApplication>({
    brandName: '',
    brandType: 'LOCAL',
    description: '',
    logoUri: undefined,
    website: '',
    instagram: '',
    contactEmail: currentUser?.email || '',
    applicationReason: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BrandApplication, string>>>({});

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BrandApplication, string>> = {};

    // Brand name
    if (!formData.brandName.trim()) {
      newErrors.brandName = 'Brand name is required';
    } else if (formData.brandName.length < 2 || formData.brandName.length > 50) {
      newErrors.brandName = 'Brand name must be 2-50 characters';
    }

    // Description
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50 || formData.description.length > 500) {
      newErrors.description = 'Description must be 50-500 characters';
    }

    // Contact email
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email';
    }

    // Application reason
    if (!formData.applicationReason.trim()) {
      newErrors.applicationReason = 'Application reason is required';
    } else if (formData.applicationReason.length < 100 || formData.applicationReason.length > 1000) {
      newErrors.applicationReason = 'Reason must be 100-1000 characters';
    }

    // Website (optional but validate format if provided)
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid URL (https://...)';
    }

    // Instagram (optional but validate format if provided)
    if (formData.instagram && formData.instagram.startsWith('@')) {
      setFormData(prev => ({ ...prev, instagram: formData.instagram && formData.instagram.replace('@', '') }));
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle logo picker
  const pickLogo = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library to upload a logo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData(prev => ({ ...prev, logoUri: result.assets[0].uri }));
    }
  };

  // Handle remove logo
  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logoUri: undefined }));
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting.');
      return;
    }

    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to apply for a brand.');
      return;
    }

    Alert.alert('Submit Application?', 'Are you sure you want to submit your brand application?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Submit',
        style: 'default',
        onPress: async () => {
          try {
            await submit({ userId: currentUser.id, application: formData });
            Alert.alert(
              'Application Submitted!',
              'Your brand application has been submitted successfully. You will be notified once it has been reviewed.',
              [
                {
                  text: 'OK',
                  onPress: () => router.back(),
                },
              ],
            );
          } catch (error: any) {
            Alert.alert('Submission Failed', error.message || 'Failed to submit application. Please try again.');
          }
        },
      },
    ]);
  };

  const getBrandTypeColor = (type: string) => {
    switch (type) {
      case 'INTERNATIONAL':
        return 'border-purple-500 bg-purple-500/20';
      case 'LOCAL':
        return 'border-blue-500 bg-blue-500/20';
      case 'TAILORED':
        return 'border-green-500 bg-green-500/20';
      default:
        return 'border-gray-500 bg-gray-500/20';
    }
  };

  return (
    <Spotlight intensity={0.2}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-black"
        keyboardVerticalOffset={100}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-6">
            {/* Header */}
            <View className="mb-6">
              <Text className="text-3xl font-bold text-white mb-2">Apply for Brand Status</Text>
              <Text className="text-gray-400 leading-6">
                Fill out this application to verify your brand and gain access to brand management features.
              </Text>
            </View>

            {/* Brand Name */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-2">
                Brand Name <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={formData.brandName}
                onChangeText={text => setFormData(prev => ({ ...prev, brandName: text }))}
                placeholder="Enter your brand name"
                placeholderTextColor="#6B7280"
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
                maxLength={50}
              />
              {errors.brandName && <Text className="text-red-500 text-sm mt-1">{errors.brandName}</Text>}
              <Text className="text-gray-500 text-xs mt-1">{formData.brandName.length}/50 characters</Text>
            </View>

            {/* Brand Type */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-2">
                Brand Type <Text className="text-red-500">*</Text>
              </Text>
              <View className="flex-row gap-3">
                {(['INTERNATIONAL', 'LOCAL', 'TAILORED'] as const).map(type => (
                  <Pressable
                    key={type}
                    onPress={() => setFormData(prev => ({ ...prev, brandType: type }))}
                    className={`flex-1 py-3 rounded-lg border-2 ${
                      formData.brandType === type ? getBrandTypeColor(type) : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <Text
                      className={`text-center font-semibold ${formData.brandType === type ? 'text-white' : 'text-gray-400'}`}
                    >
                      {type}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Logo Upload */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-2">Brand Logo (Optional but Recommended)</Text>
              {formData.logoUri ? (
                <View className="relative">
                  <Image source={{ uri: formData.logoUri }} className="w-32 h-32 rounded-lg bg-white/5" />
                  <Pressable onPress={removeLogo} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1.5">
                    <X size={16} color="white" />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={pickLogo}
                  className="border-2 border-dashed border-white/20 rounded-lg p-8 items-center"
                >
                  <Upload size={32} color="#9CA3AF" />
                  <Text className="text-gray-400 mt-2">Tap to upload logo</Text>
                  <Text className="text-gray-500 text-xs mt-1">JPG, PNG (Square, max 5MB)</Text>
                </Pressable>
              )}
            </View>

            {/* Description */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-2">
                Brand Description <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={formData.description}
                onChangeText={text => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Describe your brand, what you sell, your story..."
                placeholderTextColor="#6B7280"
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
              {errors.description && <Text className="text-red-500 text-sm mt-1">{errors.description}</Text>}
              <Text className="text-gray-500 text-xs mt-1">{formData.description.length}/500 characters</Text>
            </View>

            {/* Website */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-2">Website (Optional)</Text>
              <TextInput
                value={formData.website}
                onChangeText={text => setFormData(prev => ({ ...prev, website: text }))}
                placeholder="https://yourbrand.com"
                placeholderTextColor="#6B7280"
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
                keyboardType="url"
                autoCapitalize="none"
              />
              {errors.website && <Text className="text-red-500 text-sm mt-1">{errors.website}</Text>}
            </View>

            {/* Instagram */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-2">Instagram Handle (Optional)</Text>
              <View className="flex-row items-center bg-white/5 border border-white/10 rounded-lg px-4">
                <Text className="text-gray-400 mr-1">@</Text>
                <TextInput
                  value={formData.instagram}
                  onChangeText={text => setFormData(prev => ({ ...prev, instagram: text.replace('@', '') }))}
                  placeholder="yourbrand"
                  placeholderTextColor="#6B7280"
                  className="flex-1 py-3 text-white"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Contact Email */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-2">
                Contact Email <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={formData.contactEmail}
                onChangeText={text => setFormData(prev => ({ ...prev, contactEmail: text }))}
                placeholder="contact@yourbrand.com"
                placeholderTextColor="#6B7280"
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.contactEmail && <Text className="text-red-500 text-sm mt-1">{errors.contactEmail}</Text>}
            </View>

            {/* Application Reason */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-2">
                Why do you want to apply? <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={formData.applicationReason}
                onChangeText={text => setFormData(prev => ({ ...prev, applicationReason: text }))}
                placeholder="Tell us why you want brand status, what benefits you're looking for, how you plan to use the platform..."
                placeholderTextColor="#6B7280"
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                maxLength={1000}
              />
              {errors.applicationReason && (
                <Text className="text-red-500 text-sm mt-1">{errors.applicationReason}</Text>
              )}
              <Text className="text-gray-500 text-xs mt-1">{formData.applicationReason.length}/1000 characters</Text>
            </View>

            {/* Submit Button */}
            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitting}
              className={`py-4 rounded-lg ${isSubmitting ? 'bg-white/20' : 'bg-white'} mb-20`}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <Text className="text-black text-center font-bold text-lg">Submit Application</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Spotlight>
  );
}
