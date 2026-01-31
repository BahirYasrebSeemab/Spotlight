// ========================================
// src/shared/constants/studioBackgrounds.ts
// Professional studio background templates
// ========================================

export interface BackgroundTemplate {
  id: string;
  name: string;
  description: string;
  type: 'gradient' | 'solid' | 'image';
  preview: string; // Preview color/image for UI
  // For gradients
  colors?: string[];
  angle?: number;
  // For images
  imageUrl?: string;
  // For Cloudinary
  cloudinaryTransform?: string;
}

export const STUDIO_BACKGROUNDS: BackgroundTemplate[] = [
  {
    id: 'minimal',
    name: 'Minimal White',
    description: 'Clean white gradient - Perfect for everyday items',
    type: 'gradient',
    preview: '#FAFAFA',
    colors: ['#FFFFFF', '#F5F5F5'],
    angle: 135,
    cloudinaryTransform: 'e_background_removal/b_rgb:FAFAFA',
  },
  {
    id: 'dramatic',
    name: 'Dramatic Black',
    description: 'Bold black backdrop - Great for premium items',
    type: 'gradient',
    preview: '#1A1A1A',
    colors: ['#1A1A1A', '#000000'],
    angle: 180,
    cloudinaryTransform: 'e_background_removal/b_rgb:1A1A1A',
  },
  {
    id: 'warm',
    name: 'Warm Beige',
    description: 'Soft warm tones - Cozy, inviting feel',
    type: 'gradient',
    preview: '#FFF5F0',
    colors: ['#FFF5F0', '#FFE8DC'],
    angle: 135,
    cloudinaryTransform: 'e_background_removal/b_rgb:FFF5F0',
  },
  {
    id: 'cool',
    name: 'Cool Blue',
    description: 'Fresh blue gradient - Modern, clean aesthetic',
    type: 'gradient',
    preview: '#F0F9FF',
    colors: ['#F0F9FF', '#E0F2FE'],
    angle: 135,
    cloudinaryTransform: 'e_background_removal/b_rgb:F0F9FF',
  },
  {
    id: 'neutral',
    name: 'Neutral Gray',
    description: 'Professional gray - Versatile for any product',
    type: 'gradient',
    preview: '#F3F4F6',
    colors: ['#F9FAFB', '#E5E7EB'],
    angle: 135,
    cloudinaryTransform: 'e_background_removal/b_rgb:F3F4F6',
  },
  {
    id: 'studio',
    name: 'Studio White',
    description: 'Pure white - Classic e-commerce look',
    type: 'solid',
    preview: '#FFFFFF',
    colors: ['#FFFFFF'],
    cloudinaryTransform: 'e_background_removal/b_white',
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
