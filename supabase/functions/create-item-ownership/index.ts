// supabase/functions/create-item-ownership/index.ts
// CLOUDINARY VERSION - Professional image processing

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHash } from 'https://deno.land/std@0.177.0/node/crypto.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Cloudinary configuration - these will come from secrets
const CLOUDINARY_CLOUD_NAME = Deno.env.get('CLOUDINARY_CLOUD_NAME')!
const CLOUDINARY_API_KEY = Deno.env.get('CLOUDINARY_API_KEY')!
const CLOUDINARY_API_SECRET = Deno.env.get('CLOUDINARY_API_SECRET')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Generate Cloudinary signature for secure uploads
 */
function generateCloudinarySignature(params: Record<string, any>, apiSecret: string): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')

  const hash = createHash('sha256')
  hash.update(sortedParams + apiSecret)
  return hash.digest('hex')
}

/**
 * Upload original image to Cloudinary without processing
 */
async function uploadOriginalToCloudinary(
  imageBuffer: ArrayBuffer,
  userId: string,
  timestamp: number,
): Promise<string> {
  console.log('Uploading original to Cloudinary...')

  const publicId = `users/${userId}/items/${timestamp}_original`
  const timestamp_unix = Math.floor(Date.now() / 1000)

  const uploadParams: Record<string, any> = {
    timestamp: timestamp_unix,
    public_id: publicId,
    folder: 'items',
  }

  const signature = generateCloudinarySignature(uploadParams, CLOUDINARY_API_SECRET)

  const formData = new FormData()
  formData.append('file', new Blob([imageBuffer]))
  formData.append('api_key', CLOUDINARY_API_KEY)
  formData.append('timestamp', timestamp_unix.toString())
  formData.append('signature', signature)
  formData.append('public_id', publicId)
  formData.append('folder', 'items')

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
  
  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to upload original: ${errorText}`)
  }

  const result = await response.json()
  return result.secure_url
}

/**
 * Process image with Cloudinary (remove background + add studio background)
 */
async function processWithCloudinary(
  imageBuffer: ArrayBuffer,
  userId: string,
  timestamp: number,
  backgroundType: string,
): Promise<{ url: string; publicId: string }> {
  console.log('Processing with Cloudinary...')
  console.log('Background type:', backgroundType)

  const backgroundMap: Record<string, string> = {
    minimal: 'rgb:FAFAFA',
    dramatic: 'rgb:1A1A1A',
    warm: 'rgb:FFF5F0',
    cool: 'rgb:F0F9FF',
    neutral: 'rgb:F3F4F6',
    studio: 'white',
  }

  const bgColor = backgroundMap[backgroundType] || 'rgb:FAFAFA'
  console.log('Using background color:', bgColor)

  const publicId = `users/${userId}/items/${timestamp}`

  const timestamp_unix = Math.floor(Date.now() / 1000)
  const uploadParams: Record<string, any> = {
    timestamp: timestamp_unix,
    public_id: publicId,
    folder: 'items',
  }

  const signature = generateCloudinarySignature(uploadParams, CLOUDINARY_API_SECRET)

  const transformation = `e_background_removal/b_${bgColor.replace(':', '_')}`
  console.log('Transformation:', transformation)

  const formData = new FormData()
  formData.append('file', new Blob([imageBuffer]))
  formData.append('api_key', CLOUDINARY_API_KEY)
  formData.append('timestamp', timestamp_unix.toString())
  formData.append('signature', signature)
  formData.append('public_id', publicId)
  formData.append('folder', 'items')
  formData.append('transformation', transformation)

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
  console.log('Uploading to Cloudinary:', uploadUrl)

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Cloudinary upload failed:', errorText)
    throw new Error(`Cloudinary upload failed: ${errorText}`)
  }

  const result = await response.json()
  console.log('Cloudinary upload successful:', result.secure_url)

  return {
    url: result.secure_url,
    publicId: result.public_id,
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing authorization')

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) throw new Error('Unauthorized')

    const formData = await req.formData()
    const name = formData.get('name') as string
    const brandName = formData.get('brandName') as string
    const upc = formData.get('upc') as string | null
    const category = formData.get('category') as string | null
    const description = formData.get('description') as string | null
    const condition = formData.get('condition') as string | null
    const notes = formData.get('notes') as string | null
    const purchasePrice = formData.get('purchasePrice') ? parseFloat(formData.get('purchasePrice') as string) : null
    const purchaseDate = formData.get('purchaseDate') ? new Date(formData.get('purchaseDate') as string) : null
    const imageFile = formData.get('image') as File | null
    const existingCommunityProductId = formData.get('existingCommunityProductId') as string | null
    const existingPrototypeId = formData.get('existingPrototypeId') as string | null

    if (!name || !brandName) {
      throw new Error('Name and brand name are required')
    }

    console.log('Processing request for:', { name, brandName, hasImage: !!imageFile })

    let productId: string | null = null
    let productType: 'prototype' | 'community' = 'community'

    if (existingPrototypeId) {
      productId = existingPrototypeId
      productType = 'prototype'
    } else if (existingCommunityProductId) {
      productId = existingCommunityProductId
      productType = 'community'
    } else {
      let prototypeFilter = 'isActive.eq.true'
    if (!prototypeId && !communityProductId) {
      throw new Error('Must provide either prototypeId or communityProductId');
    }

    if (prototypeId && communityProductId) {
      throw new Error('Cannot provide both prototypeId and communityProductId');
    }

    console.log('Creating ownership for user:', user.id);
    console.log('Product:', { prototypeId, communityProductId });
    console.log('Image settings:', { useOfficialImage, processImage, backgroundType, hasImageFile: !!imageFile });

    let originalImageUrl: string | null = null;
    let processedImageUrl: string | null = null;

    // ============================================
    // STEP 1: Handle Custom Image Upload
    // ============================================
    if (!useOfficialImage && imageFile) {
      try {
        const timestamp = Date.now();
        console.log('Processing custom image upload...');
        
        const arrayBuffer = await imageFile.arrayBuffer();

        // ============================================
        // STEP 2: Upload to Cloudinary
        // ============================================
        if (processImage) {
          // Process with background removal + studio background
          console.log('Processing image with Cloudinary (background removal)...');
          
          try {
            const cloudinaryResult = await processWithCloudinary(
              arrayBuffer,
              user.id,
              timestamp,
              backgroundType,
            );
            
            processedImageUrl = cloudinaryResult.url;
            console.log('Processed image URL:', processedImageUrl);

            // Also upload original for reference (without processing)
            try {
              originalImageUrl = await uploadOriginalToCloudinary(arrayBuffer, user.id, timestamp);
              console.log('Original image URL:', originalImageUrl);
            } catch (originalError) {
              console.warn('Failed to upload original, using processed as original:', originalError);
              originalImageUrl = processedImageUrl;
            }
          } catch (processingError: any) {
            console.error('Image processing error:', processingError);
            // Fallback: upload without processing
            console.log('Falling back to upload without processing...');
            originalImageUrl = await uploadOriginalToCloudinary(arrayBuffer, user.id, timestamp);
            processedImageUrl = null;
          }
        } else {
          // Upload without processing
          console.log('Uploading image without processing...');
          originalImageUrl = await uploadOriginalToCloudinary(arrayBuffer, user.id, timestamp);
          console.log('Original image URL:', originalImageUrl);
        }
      } catch (imageError: any) {
        console.error('Image handling error:', imageError);
        throw new Error(`Image upload failed: ${imageError.message}`);
      }
    }

    // ============================================
    // STEP 3: Create Ownership Record
    // ============================================
    let selectedVariant = null;
    if (selectedVariantStr) {
      try {
        selectedVariant = JSON.parse(selectedVariantStr);
      } catch (e) {
        console.error('Failed to parse selectedVariant:', e);
      }
    }

    const ownershipData: any = {
      ownerId: user.id,
      prototypeId: prototypeId || null,
      communityProductId: communityProductId || null,
      verified: false,
      useOfficialImage,
      originalImageUrl,
      processedImageUrl,
      condition,
      purchaseDate: purchaseDate ? new Date(purchaseDate).toISOString() : null,
      purchasePrice,
      selectedVariant,
      notes,
      status,
      flagged: false,
      processingStatus: processImage && processedImageUrl ? 'completed' : processImage ? 'failed' : 'completed',
    };

    console.log('Creating ownership record...');
    
    const { data: ownership, error: ownershipError } = await supabase
      .from('Ownership')
      .insert(ownershipData)
      .select(
        `
        *,
        prototype:prototypeId (
          *,
          brand:brandId (*)
        ),
        communityProduct:communityProductId (*)
      `,
      )
      .single();

    if (ownershipError) {
      console.error('Ownership creation error:', ownershipError);
      throw new Error(`Failed to create ownership: ${ownershipError.message}`);
    }

    console.log('Ownership created successfully:', ownership.id);

    return new Response(
      JSON.stringify({
        success: true,
        ownership,
        imageProcessing: {
          processor: 'cloudinary',
          originalUrl: originalImageUrl,
          processedUrl: processedImageUrl,
          processed: !!processedImageUrl,
          backgroundType,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error: any) {
    console.error('Error in create-ownership:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
