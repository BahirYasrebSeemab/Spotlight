// ========================================
// supabase/functions/create-ownership/index.ts
// FIXED: Correct Cloudinary transformation URLs
// ========================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHash } from 'https://deno.land/std@0.177.0/node/crypto.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const CLOUDINARY_CLOUD_NAME = Deno.env.get('CLOUDINARY_CLOUD_NAME');
const CLOUDINARY_API_KEY = Deno.env.get('CLOUDINARY_API_KEY');
const CLOUDINARY_API_SECRET = Deno.env.get('CLOUDINARY_API_SECRET');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Generate Cloudinary signature
 */
function generateSignature(params: Record<string, any>, apiSecret: string): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  const hash = createHash('sha256');
  hash.update(sortedParams + apiSecret);
  return hash.digest('hex');
}

/**
 * Process image with Cloudinary and download results
 */
async function processWithCloudinary(
  imageBuffer: ArrayBuffer,
  userId: string,
  timestamp: number,
  cloudName: string,
  apiKey: string,
  apiSecret: string,
): Promise<{
  original: ArrayBuffer;
  processed: ArrayBuffer;
  thumbnail: ArrayBuffer;
}> {
  console.log('🎨 Processing with Cloudinary...');

  const publicId = `temp/${userId}/${timestamp}`;
  const timestamp_unix = Math.floor(Date.now() / 1000);

  // Generate signature
  const uploadParams = {
    timestamp: timestamp_unix,
    public_id: publicId,
  };
  const signature = generateSignature(uploadParams, apiSecret);

  // Upload to Cloudinary
  const formData = new FormData();
  formData.append('file', new Blob([imageBuffer]));
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp_unix.toString());
  formData.append('signature', signature);
  formData.append('public_id', publicId);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  console.log('📤 Uploading to Cloudinary...');
  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cloudinary upload failed: ${error}`);
  }

  const result = await response.json();
  const uploadedPublicId = result.public_id;
  console.log('✅ Uploaded to Cloudinary');
  console.log('Public ID:', uploadedPublicId);

  // ============================================
  // Generate URLs for different versions
  // ============================================

  // 1. Original (optimized but no background removal)
  const originalUrl = `https://res.cloudinary.com/${cloudName}/image/upload/q_auto:best/f_auto/${uploadedPublicId}.jpg`;

  // 2. Processed - FIXED TRANSFORMATION
  // We need to use separate transformations for better results
  const processedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/e_background_removal/b_white/q_auto:good/f_png/${uploadedPublicId}`;

  // 3. Thumbnail (small version for lists)
  const thumbnailUrl = `https://res.cloudinary.com/${cloudName}/image/upload/e_background_removal/b_white/c_fill,w_400,h_400/q_auto/f_auto/${uploadedPublicId}`;

  console.log('📥 Downloading processed versions...');
  console.log('Original URL:', originalUrl);
  console.log('Processed URL:', processedUrl);
  console.log('Thumbnail URL:', thumbnailUrl);

  // Download with error handling
  let originalBuffer: ArrayBuffer;
  let processedBuffer: ArrayBuffer;
  let thumbnailBuffer: ArrayBuffer;

  try {
    // Download original
    console.log('Downloading original...');
    const originalResponse = await fetch(originalUrl);
    if (!originalResponse.ok) {
      throw new Error(`Original download failed: ${originalResponse.status}`);
    }
    originalBuffer = await originalResponse.arrayBuffer();
    console.log('  ✓ Original:', (originalBuffer.byteLength / 1024).toFixed(1), 'KB');

    // Download processed - with retry
    console.log('Downloading processed...');
    let processedResponse = await fetch(processedUrl);

    // If first attempt fails, try without some optimizations
    if (!processedResponse.ok || processedResponse.headers.get('content-length') === '0') {
      console.log('  ⚠️  First attempt failed, trying simpler transformation...');
      const simpleProcessedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/e_background_removal/${uploadedPublicId}.png`;
      console.log('  Trying:', simpleProcessedUrl);
      processedResponse = await fetch(simpleProcessedUrl);
    }

    if (!processedResponse.ok) {
      throw new Error(`Processed download failed: ${processedResponse.status}`);
    }

    processedBuffer = await processedResponse.arrayBuffer();

    if (processedBuffer.byteLength === 0) {
      throw new Error('Processed image is empty (0 bytes)');
    }

    console.log('  ✓ Processed:', (processedBuffer.byteLength / 1024).toFixed(1), 'KB');

    // Download thumbnail
    console.log('Downloading thumbnail...');
    const thumbnailResponse = await fetch(thumbnailUrl);
    if (!thumbnailResponse.ok) {
      // Fallback: simple thumbnail without background removal
      const simpleThumbnailUrl = `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_400,h_400/q_auto/${uploadedPublicId}.jpg`;
      console.log('  ⚠️  Trying simple thumbnail:', simpleThumbnailUrl);
      const fallbackResponse = await fetch(simpleThumbnailUrl);
      thumbnailBuffer = await fallbackResponse.arrayBuffer();
    } else {
      thumbnailBuffer = await thumbnailResponse.arrayBuffer();
    }
    console.log('  ✓ Thumbnail:', (thumbnailBuffer.byteLength / 1024).toFixed(1), 'KB');
  } catch (downloadError: any) {
    console.error('❌ Download error:', downloadError.message);
    throw downloadError;
  }

  console.log('✅ Downloaded all versions');

  // Delete from Cloudinary (cleanup)
  try {
    const deleteParams = {
      timestamp: Math.floor(Date.now() / 1000),
      public_id: uploadedPublicId,
    };
    const deleteSignature = generateSignature(deleteParams, apiSecret);

    await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...deleteParams,
        signature: deleteSignature,
        api_key: apiKey,
      }),
    });

    console.log('🗑️  Cleaned up Cloudinary temp files');
  } catch (e) {
    console.log('⚠️  Cloudinary cleanup failed (ok to ignore)');
  }

  return {
    original: originalBuffer,
    processed: processedBuffer,
    thumbnail: thumbnailBuffer,
  };
}

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🔧 Cloudinary:', CLOUDINARY_CLOUD_NAME ? 'SET ✓' : 'MISSING ✗');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization');

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Unauthorized');

    const formData = await req.formData();

    const prototypeId = formData.get('prototypeId') as string | null;
    const communityProductId = formData.get('communityProductId') as string | null;
    const useOfficialImage = formData.get('useOfficialImage') === 'true';
    const condition = formData.get('condition') as string | null;
    const purchaseDate = formData.get('purchaseDate') as string | null;
    const purchasePrice = formData.get('purchasePrice') ? parseFloat(formData.get('purchasePrice') as string) : null;
    const selectedVariantStr = formData.get('selectedVariant') as string | null;
    const notes = formData.get('notes') as string | null;
    const status = (formData.get('status') as string) || 'owned';
    const imageFile = formData.get('image') as File | null;
    const processImage = formData.get('processImage') === 'true';

    if (!prototypeId && !communityProductId) {
      throw new Error('Must provide either prototypeId or communityProductId');
    }

    console.log('📦 Creating ownership for user:', user.id);
    console.log('📸 Settings:', { useOfficialImage, processImage, hasFile: !!imageFile });

    let originalImageUrl: string | null = null;
    let processedImageUrl: string | null = null;
    let thumbnailImageUrl: string | null = null;

    if (!useOfficialImage && imageFile) {
      try {
        const timestamp = Date.now();
        const arrayBuffer = await imageFile.arrayBuffer();

        console.log('📊 Original upload size:', (arrayBuffer.byteLength / 1024 / 1024).toFixed(2), 'MB');

        if (processImage && CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
          console.log('🎨 Processing with Cloudinary...');

          try {
            // Process with Cloudinary
            const results = await processWithCloudinary(
              arrayBuffer,
              user.id,
              timestamp,
              CLOUDINARY_CLOUD_NAME,
              CLOUDINARY_API_KEY,
              CLOUDINARY_API_SECRET,
            );

            // ============================================
            // Upload to Supabase Storage
            // ============================================

            // 1. Upload original
            const originalFileName = `${user.id}/${timestamp}_original.jpg`;
            console.log('📤 Uploading original to item-originals...');

            const { error: originalError } = await supabase.storage
              .from('item-originals')
              .upload(originalFileName, results.original, {
                contentType: 'image/jpeg',
                upsert: false,
              });

            if (originalError) throw new Error(`Original upload failed: ${originalError.message}`);

            const {
              data: { publicUrl: originalUrl },
            } = supabase.storage.from('item-originals').getPublicUrl(originalFileName);

            originalImageUrl = originalUrl;
            console.log('✅ Original saved');

            // 2. Upload processed
            const processedFileName = `${user.id}/${timestamp}_processed.png`;
            console.log('📤 Uploading processed to item-processed...');

            const { error: processedError } = await supabase.storage
              .from('item-processed')
              .upload(processedFileName, results.processed, {
                contentType: 'image/png',
                upsert: false,
              });

            if (processedError) throw new Error(`Processed upload failed: ${processedError.message}`);

            const {
              data: { publicUrl: processedUrl },
            } = supabase.storage.from('item-processed').getPublicUrl(processedFileName);

            processedImageUrl = processedUrl;
            console.log('✅ Processed saved');

            // 3. Upload thumbnail
            const thumbnailFileName = `${user.id}/${timestamp}_thumb.jpg`;
            console.log('📤 Uploading thumbnail to item-thumbnails...');

            const { error: thumbError } = await supabase.storage
              .from('item-thumbnails')
              .upload(thumbnailFileName, results.thumbnail, {
                contentType: 'image/jpeg',
                upsert: false,
              });

            if (thumbError) throw new Error(`Thumbnail upload failed: ${thumbError.message}`);

            const {
              data: { publicUrl: thumbUrl },
            } = supabase.storage.from('item-thumbnails').getPublicUrl(thumbnailFileName);

            thumbnailImageUrl = thumbUrl;
            console.log('✅ Thumbnail saved');

            console.log('🎉 All images processed and saved!');
          } catch (processingError: any) {
            console.error('❌ Processing failed:', processingError.message);

            // Fallback: Just upload original
            const originalFileName = `${user.id}/${timestamp}_original.jpg`;
            await supabase.storage.from('item-originals').upload(originalFileName, arrayBuffer, {
              contentType: imageFile.type || 'image/jpeg',
              upsert: false,
            });

            const {
              data: { publicUrl },
            } = supabase.storage.from('item-originals').getPublicUrl(originalFileName);
            originalImageUrl = publicUrl;
          }
        } else {
          // No processing - just upload original
          console.log('📤 Uploading original (no processing)...');

          const originalFileName = `${user.id}/${timestamp}_original.jpg`;
          await supabase.storage.from('item-originals').upload(originalFileName, arrayBuffer, {
            contentType: imageFile.type || 'image/jpeg',
            upsert: false,
          });

          const {
            data: { publicUrl },
          } = supabase.storage.from('item-originals').getPublicUrl(originalFileName);
          originalImageUrl = publicUrl;
          console.log('✅ Original saved');
        }
      } catch (imageError: any) {
        console.error('💥 Image error:', imageError.message);
        throw new Error(`Image upload failed: ${imageError.message}`);
      }
    }

    // Create ownership record
    let selectedVariant = null;
    if (selectedVariantStr) {
      try {
        selectedVariant = JSON.parse(selectedVariantStr);
      } catch (e) {}
    }

    const ownershipData: any = {
      ownerId: user.id,
      prototypeId: prototypeId || null,
      communityProductId: communityProductId || null,
      verified: false,
      useOfficialImage,
      originalImageUrl,
      processedImageUrl,
      thumbnailImageUrl,
      condition,
      purchaseDate: purchaseDate ? new Date(purchaseDate).toISOString() : null,
      purchasePrice,
      selectedVariant,
      notes,
      status,
      flagged: false,
      processingStatus: processImage && processedImageUrl ? 'completed' : processImage ? 'failed' : 'completed',
    };

    console.log('💾 Creating ownership record...');

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

    if (ownershipError) throw new Error(`Failed to create ownership: ${ownershipError.message}`);

    console.log('✅ Ownership created:', ownership.id);

    return new Response(
      JSON.stringify({
        success: true,
        ownership,
        imageProcessing: {
          processor: 'cloudinary',
          originalUrl: originalImageUrl,
          processedUrl: processedImageUrl,
          thumbnailUrl: thumbnailImageUrl,
          processed: !!processedImageUrl,
          storage: 'supabase',
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error: any) {
    console.error('💥 Error:', error.message);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
