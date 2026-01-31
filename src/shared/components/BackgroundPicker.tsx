// ========================================
// src/shared/components/BackgroundPicker.tsx
// Beautiful background template picker
// ========================================
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';
import { STUDIO_BACKGROUNDS, BackgroundTemplate } from '@/src/shared/constants/studioBackgrounds';

interface BackgroundPickerProps {
  selectedId: string;
  onSelect: (id: string) => void;
  enabled?: boolean;
}

export function BackgroundPicker({ selectedId, onSelect, enabled = true }: BackgroundPickerProps) {
  return (
    <View className="mb-6">
      <Text className="text-white font-semibold text-base mb-3">Background Style</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5">
        <View className="flex-row gap-3">
          {STUDIO_BACKGROUNDS.map(template => (
            <BackgroundOption
              key={template.id}
              template={template}
              selected={selectedId === template.id}
              onSelect={() => enabled && onSelect(template.id)}
              disabled={!enabled}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

interface BackgroundOptionProps {
  template: BackgroundTemplate;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

function BackgroundOption({ template, selected, onSelect, disabled }: BackgroundOptionProps) {
  return (
    <TouchableOpacity
      onPress={onSelect}
      disabled={disabled}
      className="items-center"
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      {/* Preview Circle */}
      <View className={`mb-2 rounded-2xl overflow-hidden border-2 ${selected ? 'border-white' : 'border-white/20'}`}>
        {template.type === 'gradient' && template.colors ? (
          <LinearGradient colors={template.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="w-20 h-20">
            {selected && (
              <View className="flex-1 items-center justify-center bg-black/20">
                <View className="bg-white rounded-full p-1">
                  <Check size={16} color="#000000" />
                </View>
              </View>
            )}
          </LinearGradient>
        ) : (
          <View className="w-20 h-20" style={{ backgroundColor: template.preview }}>
            {selected && (
              <View className="flex-1 items-center justify-center bg-black/20">
                <View className="bg-white rounded-full p-1">
                  <Check size={16} color="#000000" />
                </View>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Label */}
      <Text
        className={`text-xs font-medium text-center ${selected ? 'text-white' : 'text-gray-400'}`}
        style={{ width: 80 }}
      >
        {template.name}
      </Text>
    </TouchableOpacity>
  );
}
