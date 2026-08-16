import { useState } from 'react';
import { X, Tag } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, Alert, Image } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { Button, Input } from '@/src/shared/ui';
import { useAppSelector } from '@/src/shared/hooks/redux';
import { useCreateMemory } from '@/src/features/memories/hooks/useCreateMemory';
import { ClosetItemSelector } from '@/src/features/memories/components/ClosetItemSelector';

export default function MemoryFormScreen() {
  const params = useLocalSearchParams<{ imageUri?: string }>();
  const router = useRouter();
  const authUser = useAppSelector(state => state.auth.user);

  const [caption, setCaption] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [selectedOwnershipIds, setSelectedOwnershipIds] = useState<string[]>([]);
  const [showClosetSelector, setShowClosetSelector] = useState(false);

  const { create, isCreating } = useCreateMemory();

  const handleSubmit = () => {
    if (!authUser) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    if (!params.imageUri) {
      Alert.alert('Error', 'No image provided');
      return;
    }

    create(
      {
        caption: caption.trim() || undefined,
        location: location.trim() || undefined,
        mediaType: 'photo',
        mediaUrl: params.imageUri,
        ownershipIds: selectedOwnershipIds,
        title: title.trim() || undefined,
        userId: authUser.id,
      },
      {
        onError: (err: Error) => {
          Alert.alert('Error', err.message || 'Failed to create memory');
        },
        onSuccess: () => {
          Alert.alert('Success', 'Memory created!', [
            {
              onPress: () => {
                router.replace('/(tabs)/profile');
              },
              text: 'OK',
            },
          ]);
        },
      },
    );
  };

  const handleRemoveOwnership = (ownershipId: string) => {
    setSelectedOwnershipIds(prev => prev.filter(id => id !== ownershipId));
  };

  return (
    <>
      <KeyboardAwareScrollView
        className="flex-1 bg-black"
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
      >
        <View className="flex-1 px-5 pt-12">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity onPress={() => router.back()} className="p-2">
              <X size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text className="text-2xl font-extrabold text-white">New Memory</Text>
            <View className="w-10" />
          </View>

          {/* Image Preview */}
          {params.imageUri && (
            <View className="mb-6">
              <Image
                source={{ uri: params.imageUri }}
                className="w-full h-80 rounded-2xl bg-gray-800"
                resizeMode="cover"
              />
            </View>
          )}

          {/* Form Fields */}
          <Input
            label="Title (Optional)"
            value={title}
            onChangeText={setTitle}
            placeholder="Give your memory a title"
            editable={!isCreating}
            maxLength={100}
          />

          <Input
            label="Caption (Optional)"
            value={caption}
            onChangeText={setCaption}
            placeholder="Write a caption..."
            multiline
            numberOfLines={3}
            editable={!isCreating}
            maxLength={500}
          />

          <Input
            label="Location (Optional)"
            value={location}
            onChangeText={setLocation}
            placeholder="Where was this taken?"
            editable={!isCreating}
            maxLength={100}
          />

          {/* Tag Items Section */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-3">Tag Items (Optional)</Text>
            <TouchableOpacity
              onPress={() => setShowClosetSelector(true)}
              disabled={isCreating}
              className="bg-white/10 border border-white/20 rounded-xl p-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-2">
                <Tag size={20} color="#ffffff" />
                <Text className="text-white font-medium">
                  {selectedOwnershipIds.length > 0
                    ? `${selectedOwnershipIds.length} item${selectedOwnershipIds.length !== 1 ? 's' : ''} tagged`
                    : 'Tag items from your closet'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Selected Items Preview */}
            {selectedOwnershipIds.length > 0 && (
              <View className="mt-3 bg-white/5 rounded-xl p-3">
                <Text className="text-gray-400 text-sm mb-2">Tagged Items:</Text>
                <View className="flex-row flex-wrap gap-2">
                  {selectedOwnershipIds.map((id, index) => (
                    <View key={id} className="bg-white/10 rounded-lg px-3 py-2 flex-row items-center gap-2">
                      <Text className="text-white text-sm">Item {index + 1}</Text>
                      <TouchableOpacity onPress={() => handleRemoveOwnership(id)}>
                        <X size={14} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Submit Button */}
          <Button
            title="Share Memory"
            loading={isCreating}
            disabled={isCreating || !params.imageUri}
            onPress={handleSubmit}
            className="mb-4"
          />
        </View>
      </KeyboardAwareScrollView>

      {/* Closet Item Selector Modal */}
      {authUser && (
        <ClosetItemSelector
          visible={showClosetSelector}
          userId={authUser.id}
          onClose={() => setShowClosetSelector(false)}
          onConfirm={ownershipIds => {
            setSelectedOwnershipIds(ownershipIds);
            setShowClosetSelector(false);
          }}
        />
      )}
    </>
  );
}
