import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/src/shared/ui';

interface GoogleButtonProps {
  loading: boolean;
  className?: string;
  disabled?: boolean;
  handleGoogleLogin: () => void;
}

export const GoogleButton = ({ className, disabled, handleGoogleLogin, loading }: GoogleButtonProps) => (
  <Button
    variant="outline"
    title="Continue with Google"
    onPress={handleGoogleLogin}
    disabled={disabled}
    loading={loading}
    className={className}
    icon={<Ionicons name="logo-google" size={18} color="#DB4437" />}
  />
);
