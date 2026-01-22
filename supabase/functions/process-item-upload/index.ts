// supabase/functions/process-item-upload/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CLIPDROP_API_KEY = Deno.env.get('CLIPDROP_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: {
    id: string
    ownerId: string
    originalImageUrl: string
    processingStatus: string
  }
  old_record?: any
}

serve(async (req) => {
  try {
    console.log('=== Process Item Upload Triggered ===')
    
    const payload = await req.json()
    console.log('Received payload:', JSON.stringify(payload, null, 2))

    let ownershipId: string
    let originalPath: string

    // Check if it's a webhook payload or direct call
    if (payload.type && payload.record) {
      // Webhook format
      console.log('Processing webhook payload')
      const record = payload.record
      ownershipId = record.id
      
      if (!record.originalImageUrl) {
        console.log('No originalImageUrl in record, skipping')
        return new Response(
          JSON.stringify({ success: true, message: 'No image to process' }),
          { headers: { 'Content-Type': 'application/json' }, status: 200 }
        )
      }

      // Extract path from URL
      // URL format: https://[project].supabase.co/storage/v1/object/public/item-originals/[userId]/[filename]
      const urlParts = record.originalImageUrl.split('/item-originals/')
      if (urlParts.length < 2) {
        throw new Error('Invalid originalImageUrl format')
      }
      originalPath = urlParts[1]
      
    } else if (payload.ownershipId && payload.originalPath) {
      // Direct call format (backwards compatible)
      console.log('Processing direct call payload')
      ownershipId = payload.ownershipId
      originalPath = payload.originalPath
    } else {
      throw new Error('Invalid payload format')
    }
    
    console.log(`Processing ownership: ${ownershipId}, path: ${originalPath}`)

    // Initialize Supabase client with service role (bypass RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Step 1: Update ownership status to "processing"
    const { error: statusError } = await supabase
      .from('Ownership')
      .update({ processingStatus: 'processing' })
      .eq('id', ownershipId)

    if (statusError) {
      console.error('Failed to update status:', statusError)
      throw new Error('Failed to update processing status')
    }

    console.log('Status updated to processing')

    // Step 2: Download original image from item-originals bucket
    const { data: originalFile, error: downloadError } = await supabase.storage
      .from('item-originals')
      .download(originalPath)

    if (downloadError || !originalFile) {
      console.error('Download error:', downloadError)
      throw new Error('Failed to download original image')
    }

    console.log('Original file downloaded, size:', originalFile.size)

    // Step 3: Call Clipdrop API to remove background
    const formData = new FormData()
    formData.append('image_file', originalFile, 'image.jpg')

    console.log('Calling Clipdrop API...')

    const clipdropResponse = await fetch(
      'https://clipdrop-api.co/remove-background/v1',
      {
        method: 'POST',
        headers: {
          'x-api-key': CLIPDROP_API_KEY,
        },
        body: formData,
      }
    )

    if (!clipdropResponse.ok) {
      const errorText = await clipdropResponse.text()
      console.error('Clipdrop API error:', errorText)
      throw new Error(`Clipdrop processing failed: ${clipdropResponse.status}`)
    }

    const processedBlob = await clipdropResponse.blob()
    console.log('Background removed, processed size:', processedBlob.size)

    // Step 4: Upload processed image to item-processed bucket
    const userId = originalPath.split('/')[0]
    const originalFilename = originalPath.split('/')[1]
    const processedFilename = originalFilename.replace('_original', '_processed').replace(/\.(jpg|jpeg|heic)$/i, '.png')
    const processedPath = `${userId}/${processedFilename}`

    const { error: processedUploadError } = await supabase.storage
      .from('item-processed')
      .upload(processedPath, processedBlob, {
        contentType: 'image/png',
        upsert: true,
      })

    if (processedUploadError) {
      console.error('Upload processed error:', processedUploadError)
      throw new Error('Failed to upload processed image')
    }

    console.log('Processed image uploaded to:', processedPath)

    // Step 5: Create thumbnail (300x300)
    const thumbnailBlob = await createThumbnail(processedBlob)

    const thumbnailFilename = originalFilename.replace('_original', '_thumb').replace(/\.(jpg|jpeg|png|heic)$/i, '.webp')
    const thumbnailPath = `${userId}/${thumbnailFilename}`

    const { error: thumbnailUploadError } = await supabase.storage
      .from('item-thumbnails')
      .upload(thumbnailPath, thumbnailBlob, {
        contentType: 'image/webp',
        upsert: true,
      })

    if (thumbnailUploadError) {
      console.error('Upload thumbnail error:', thumbnailUploadError)
      throw new Error('Failed to upload thumbnail')
    }

    console.log('Thumbnail uploaded to:', thumbnailPath)

    // Step 6: Get public URLs
    const { data: { publicUrl: processedUrl } } = supabase.storage
      .from('item-processed')
      .getPublicUrl(processedPath)

    const { data: { publicUrl: thumbnailUrl } } = supabase.storage
      .from('item-thumbnails')
      .getPublicUrl(thumbnailPath)

    // Step 7: Update ownership with URLs and mark as completed
    const { error: updateError } = await supabase
      .from('Ownership')
      .update({
        processedImageUrl: processedUrl,
        thumbnailUrl: thumbnailUrl,
        processingStatus: 'completed',
      })
      .eq('id', ownershipId)

    if (updateError) {
      console.error('Failed to update ownership:', updateError)
      throw new Error('Failed to update ownership with image URLs')
    }

    console.log('Processing completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        ownershipId,
        processedUrl,
        thumbnailUrl,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Processing error:', error)

    // Try to mark ownership as failed
    try {
      const payload = await req.json()
      let ownershipId: string | undefined

      if (payload.record?.id) {
        ownershipId = payload.record.id
      } else if (payload.ownershipId) {
        ownershipId = payload.ownershipId
      }

      if (ownershipId) {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        await supabase
          .from('Ownership')
          .update({ processingStatus: 'failed' })
          .eq('id', ownershipId)
        console.log('Marked ownership as failed:', ownershipId)
      }
    } catch (e) {
      console.error('Failed to update error status:', e)
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

// Helper function to create thumbnail
async function createThumbnail(blob: Blob): Promise<Blob> {
  // Placeholder: Just return the blob for now
  // TODO: Implement actual thumbnail generation
  return blob
}