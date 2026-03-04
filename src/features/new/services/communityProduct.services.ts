// src/features/products/services/communityProduct.services.ts
import { supabase } from '@/src/lib/supabase';
import { CreateCommunityProductPayload } from '@/src/features/new/types/item.types';

export async function createCommunityProductWithOwnership(payload: CreateCommunityProductPayload) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('brandName', payload.brandName);
    if (payload.description) formData.append('description', payload.description);
    if (payload.category) formData.append('category', payload.category);
    if (payload.upc) formData.append('upc', payload.upc);
    if (payload.condition) formData.append('condition', payload.condition);
    formData.append('processImage', String(payload.processImage ?? false));

    if (payload.imageUri) {
      const fileName = payload.imageUri.split('/').pop() || 'image.jpg';
      const fileType = fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';
      formData.append('image', {
        uri: payload.imageUri,
        name: fileName,
        type: fileType,
      } as any);
    }

    const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/create-community-product`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: formData,
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.error || 'Failed to create product');

    return { data: result, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to create community product' };
  }
}
