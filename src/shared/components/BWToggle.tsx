import { Pressable, View } from 'react-native';

type Props = {
  value: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

export function BWToggle({ disabled, onToggle, value }: Props) {
  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      className={`w-14 h-8 rounded-full border-2 border-foreground
        ${disabled ? 'opacity-50' : ''}
      `}
    >
      <View
        className={`absolute top-[2px]
          ${value ? 'right-[2px]' : 'left-[2px]'}
          w-6 h-6 rounded-full
          bg-foreground
        `}
      />
    </Pressable>
  );
}
