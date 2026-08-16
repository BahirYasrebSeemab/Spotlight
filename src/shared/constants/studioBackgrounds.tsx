// ========================================
// src/shared/constants/studioBackgrounds.ts
// Professional studio background templates
// ========================================

export interface BackgroundTemplate {
  id: string;
  name: string;
  preview: string; // Preview color/image for UI
  description: string;
  type: 'gradient' | 'solid' | 'image';
  // For gradients
  angle?: number;
  colors?: string[];
  // For images
  imageUrl?: string;
  // For Cloudinary
  cloudinaryTransform?: string;
}

export const STUDIO_BACKGROUNDS: BackgroundTemplate[] = [
  {
    angle: 135,
    cloudinaryTransform: 'e_background_removal/b_rgb:FAFAFA',
    colors: ['#FFFFFF', '#F5F5F5'],
    description: 'Clean white gradient - Perfect for everyday items',
    id: 'minimal',
    name: 'Minimal White',
    preview: '#FAFAFA',
    type: 'gradient',
  },
  {
    angle: 180,
    cloudinaryTransform: 'e_background_removal/b_rgb:1A1A1A',
    colors: ['#1A1A1A', '#000000'],
    description: 'Bold black backdrop - Great for premium items',
    id: 'dramatic',
    name: 'Dramatic Black',
    preview: '#1A1A1A',
    type: 'gradient',
  },
  {
    angle: 135,
    cloudinaryTransform: 'e_background_removal/b_rgb:FFF5F0',
    colors: ['#FFF5F0', '#FFE8DC'],
    description: 'Soft warm tones - Cozy, inviting feel',
    id: 'warm',
    name: 'Warm Beige',
    preview: '#FFF5F0',
    type: 'gradient',
  },
  {
    angle: 135,
    cloudinaryTransform: 'e_background_removal/b_rgb:F0F9FF',
    colors: ['#F0F9FF', '#E0F2FE'],
    description: 'Fresh blue gradient - Modern, clean aesthetic',
    id: 'cool',
    name: 'Cool Blue',
    preview: '#F0F9FF',
    type: 'gradient',
  },
  {
    angle: 135,
    cloudinaryTransform: 'e_background_removal/b_rgb:F3F4F6',
    colors: ['#F9FAFB', '#E5E7EB'],
    description: 'Professional gray - Versatile for any product',
    id: 'neutral',
    name: 'Neutral Gray',
    preview: '#F3F4F6',
    type: 'gradient',
  },
  {
    cloudinaryTransform: 'e_background_removal/b_white',
    colors: ['#FFFFFF'],
    description: 'Pure white - Classic e-commerce look',
    id: 'studio',
    name: 'Studio White',
    preview: '#FFFFFF',
    type: 'solid',
  },
];

/**
 * Get background template by ID
 */
export function getBackgroundTemplate(id: string): BackgroundTemplate | undefined {
  return STUDIO_BACKGROUNDS.find(bg => bg.id === id);
}

/**
 * Generate CSS gradient string from template
 */
export function getGradientStyle(template: BackgroundTemplate): string {
  if (template.type === 'solid') {
    return template.colors![0];
  }

  const angle = template.angle || 135;
  const colors = template.colors!.join(', ');
  return `linear-gradient(${angle}deg, ${colors})`;
}

/**
 * Get Cloudinary transformation string
 */
export function getCloudinaryBackground(templateId: string): string {
  const template = getBackgroundTemplate(templateId);
  return template?.cloudinaryTransform || 'e_background_removal/b_white';
}
