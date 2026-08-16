import { ReactNode } from 'react';
import { ActivityIndicator, TouchableOpacity, TouchableOpacityProps, View, Text } from 'react-native';

import { cn } from './cn';

export type ButtonVariant = 'primary' | 'outline' | 'destructive';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  icon?: ReactNode;
  loading?: boolean;
  className?: string;
  fullWidth?: boolean;
  variant?: ButtonVariant;
}

const VARIANTS: Record<
  ButtonVariant,
  { container: string; disabledContainer: string; disabledText: string; spinnerColor: string; text: string }
> = {
  destructive: {
    container: 'bg-red-600',
    disabledContainer: 'bg-red-600/30',
    disabledText: 'text-white/50',
    spinnerColor: '#ffffff',
    text: 'text-white',
  },
  outline: {
    container: 'bg-transparent border border-border',
    disabledContainer: 'bg-transparent border border-border opacity-50',
    disabledText: 'text-muted-foreground',
    spinnerColor: '#ffffff',
    text: 'text-foreground',
  },
  primary: {
    container: 'bg-primary',
    disabledContainer: 'bg-gray-400',
    disabledText: 'text-gray-200',
    spinnerColor: '#000000',
    text: 'text-primary-foreground',
  },
};

export function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const styles = VARIANTS[variant];

  return (
    <TouchableOpacity
      disabled={isDisabled}
      activeOpacity={0.7}
      className={cn(
        'py-3 px-4 rounded-xl items-center justify-center',
        fullWidth && 'w-full',
        isDisabled ? styles.disabledContainer : styles.container,
        className,
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={styles.spinnerColor} />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {icon}
          <Text className={cn('text-center font-semibold text-base', isDisabled ? styles.disabledText : styles.text)}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
