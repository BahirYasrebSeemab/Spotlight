export interface BlurConfirmModalProps {
  title?: string;
  message: string;
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}
