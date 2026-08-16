// supabase/functions/create-community-product/index.ts
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

function generateSignature(params: Record<string, any>, apiSecret: string): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  const hash = createHash('sha256');
  hash.update(sortedParams + apiSecret);
  return hash.digest('hex');
}

async function processWithCloudinary(
  imageBuffer: ArrayBuffer,
  userId: string,
  timestamp: number,
  cloudName: string,
  apiKey: string,
  apiSecret: string,
): Promise<{ original: ArrayBuffer; processed: ArrayBuffer; thumbnail: ArrayBuffer }> {
  console.log('🎨 Processing with Cloudinary...');

  const publicId = `temp/${userId}/${timestamp}`;
  const timestamp_unix = Math.floor(Date.now() / 1000);

  const uploadParams = { timestamp: timestamp_unix, public_id: publicId };
  const signature = generateSignature(uploadParams, apiSecret);

  const formData = new FormData();
  formData.append('file', new Blob([imageBuffer]));
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp_unix.toString());
  formData.append('signature', signature);
  formData.append('public_id', publicId);

  const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Cloudinary upload failed: ${await uploadResponse.text()}`);
  }

  const result = await uploadResponse.json();
  const uploadedPublicId = result.public_id;
  console.log('✅ Uploaded to Cloudinary:', uploadedPublicId);

  const originalUrl = `https://res.cloudinary.com/${cloudName}/image/upload/q_auto:best/f_auto/${uploadedPublicId}.jpg`;
  const processedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/e_background_removal/b_white/q_auto:good/f_png/${uploadedPublicId}`;
  const thumbnailUrl = `https://res.cloudinary.com/${cloudName}/image/upload/e_background_removal/b_white/c_fill,w_400,h_400/q_auto/f_auto/${uploadedPublicId}`;

  console.log('📥 Downloading processed versions...');

  const originalResponse = await fetch(originalUrl);
  if (!originalResponse.ok) throw new Error(`Original download failed: ${originalResponse.status}`);
  const original = await originalResponse.arrayBuffer();

  let processedResponse = await fetch(processedUrl);
  if (!processedResponse.ok || processedResponse.headers.get('content-length') === '0') {
    console.log('⚠️ Retrying with simpler transformation...');
    processedResponse = await fetch(
      `https://res.cloudinary.com/${cloudName}/image/upload/e_background_removal/${uploadedPublicId}.png`,
    );
  }
  if (!processedResponse.ok) throw new Error(`Processed download failed: ${processedResponse.status}`);
  const processed = await processedResponse.arrayBuffer();
  if (processed.byteLength === 0) throw new Error('Processed image is empty');

  let thumbnailBuffer: ArrayBuffer;
  const thumbnailResponse = await fetch(thumbnailUrl);
  if (!thumbnailResponse.ok) {
    const fallback = await fetch(
      `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_400,h_400/q_auto/${uploadedPublicId}.jpg`,
    );
    thumbnailBuffer = await fallback.arrayBuffer();
  } else {
    thumbnailBuffer = await thumbnailResponse.arrayBuffer();
  }

  // Cleanup
  try {
    const deleteParams = { timestamp: Math.floor(Date.now() / 1000), public_id: uploadedPublicId };
    await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...deleteParams, signature: generateSignature(deleteParams, apiSecret), api_key: apiKey }),
    });
    console.log('🗑️ Cleaned up Cloudinary');
  } catch {
    console.log('⚠️ Cloudinary cleanup failed (ok)');
  }

  return { original, processed, thumbnail: thumbnailBuffer };
}

serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) throw new Error('Unauthorized');

    const formData = await req.formData();

    // Community product fields
    const name = formData.get('name') as string;
    const brandName = formData.get('brandName') as string;
    const description = formData.get('description') as string | null;
    const upc = formData.get('upc') as string | null;
    const category = formData.get('category') as string | null;
    const imageFile = formData.get('image') as File | null;
    const processImage = formData.get('processImage') === 'true';

    // Ownership fields
    const condition = formData.get('condition') as string | null;
    const purchaseDate = formData.get('purchaseDate') as string | null;
    const purchasePrice = formData.get('purchasePrice') ? parseFloat(formData.get('purchasePrice') as string) : null;
    const notes = formData.get('notes') as string | null;

    if (!name?.trim()) throw new Error('Product name is required');
    if (!brandName?.trim()) throw new Error('Brand name is required');

    console.log('📦 Creating community product for user:', user.id);

    let originalImageUrl: string | null = null;
    let processedImageUrl: string | null = null;
    let thumbnailImageUrl: string | null = null;
    let processingStatus = 'completed';

    // Handle image upload
    if (imageFile) {
      const timestamp = Date.now();
      const arrayBuffer = await imageFile.arrayBuffer();

      console.log('📊 Image size:', (arrayBuffer.byteLength / 1024 / 1024).toFixed(2), 'MB');

      const canProcess = processImage && CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET;

      if (canProcess) {
        try {
          console.log('🎨 Attempting Cloudinary processing...');
          const results = await processWithCloudinary(
            arrayBuffer,
            user.id,
            timestamp,
            CLOUDINARY_CLOUD_NAME!,
            CLOUDINARY_API_KEY!,
            CLOUDINARY_API_SECRET!,
          );

          // Upload original
          const originalFileName = `${user.id}/${timestamp}_original.jpg`;
          const { error: origErr } = await supabase.storage
            .from('item-originals')
            .upload(originalFileName, results.original, { contentType: 'image/jpeg', upsert: false });
          if (origErr) throw new Error(`Original upload failed: ${origErr.message}`);
          originalImageUrl = supabase.storage.from('item-originals').getPublicUrl(originalFileName).data.publicUrl;

          // Upload processed
          const processedFileName = `${user.id}/${timestamp}_processed.png`;
          const { error: procErr } = await supabase.storage
            .from('item-processed')
            .upload(processedFileName, results.processed, { contentType: 'image/png', upsert: false });
          if (procErr) throw new Error(`Processed upload failed: ${procErr.message}`);
          processedImageUrl = supabase.storage.from('item-processed').getPublicUrl(processedFileName).data.publicUrl;

          // Upload thumbnail
          const thumbFileName = `${user.id}/${timestamp}_thumb.jpg`;
          const { error: thumbErr } = await supabase.storage
            .from('item-thumbnails')
            .upload(thumbFileName, results.thumbnail, { contentType: 'image/jpeg', upsert: false });
          if (thumbErr) throw new Error(`Thumbnail upload failed: ${thumbErr.message}`);
          thumbnailImageUrl = supabase.storage.from('item-thumbnails').getPublicUrl(thumbFileName).data.publicUrl;

          processingStatus = 'completed';
          console.log('🎉 All images processed and saved!');
        } catch (processingError: any) {
          // Cloudinary failed — fall back to raw upload, no crash
          console.error('⚠️ Cloudinary failed, falling back to raw upload:', processingError.message);

          const originalFileName = `${user.id}/${timestamp}_original.jpg`;
          await supabase.storage.from('item-originals').upload(originalFileName, arrayBuffer, {
            contentType: imageFile.type || 'image/jpeg',
            upsert: false,
          });
          originalImageUrl = supabase.storage.from('item-originals').getPublicUrl(originalFileName).data.publicUrl;
          processingStatus = 'failed';
        }
      } else {
        // No processing requested — just upload raw
        console.log('📤 Uploading raw image (no processing)...');
        const originalFileName = `${user.id}/${timestamp}_original.jpg`;
        await supabase.storage.from('item-originals').upload(originalFileName, arrayBuffer, {
          contentType: imageFile.type || 'image/jpeg',
          upsert: false,
        });
        originalImageUrl = supabase.storage.from('item-originals').getPublicUrl(originalFileName).data.publicUrl;
        processingStatus = 'completed';
      }
    }

    // 1. Create the community product
    console.log('💾 Creating community product...');
    const { data: communityProduct, error: productError } = await supabase
      .from('CommunityProduct')
      .insert({
        name: name.trim(),
        brandName: brandName.trim(),
        description: description || null,
        upc: upc || null,
        category: category || null,
        imageUrl: originalImageUrl,
        thumbnailUrl: thumbnailImageUrl || originalImageUrl,
        createdBy: user.id,
        status: 'ACTIVE',
        ownershipCount: 1,
      })
      .select('*')
      .single();

    if (productError) throw new Error(`Failed to create community product: ${productError.message}`);
    console.log('✅ Community product created:', communityProduct.id);

    // 2. Automatically create ownership for the creator
    console.log('💾 Creating ownership for creator...');
    const { data: ownership, error: ownershipError } = await supabase
      .from('Ownership')
      .insert({
        ownerId: user.id,
        communityProductId: communityProduct.id,
        prototypeId: null,
        verified: false,
        useOfficialImage: !imageFile,
        originalImageUrl,
        processedImageUrl,
        thumbnailImageUrl,
        condition,
        purchaseDate: purchaseDate ? new Date(purchaseDate).toISOString() : null,
        purchasePrice,
        notes,
        status: 'owned',
        flagged: false,
        processingStatus,
      })
      .select(
        `
        *,
        communityProduct:communityProductId (*)
      `,
      )
      .single();

    if (ownershipError) throw new Error(`Failed to create ownership: ${ownershipError.message}`);
    console.log('✅ Ownership created:', ownership.id);

    return new Response(
      JSON.stringify({
        success: true,
        communityProduct,
        ownership,
        imageProcessing: {
          originalUrl: originalImageUrl,
          processedUrl: processedImageUrl,
          thumbnailUrl: thumbnailImageUrl,
          processed: !!processedImageUrl,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (error: any) {
    console.error('💥 Error:', error.message);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
