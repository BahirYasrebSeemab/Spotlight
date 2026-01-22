// supabase/functions/create-item-ownership/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
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

    // Case 1: User selected existing prototype
    if (existingPrototypeId) {
      productId = existingPrototypeId
      productType = 'prototype'
    }
    // Case 2: User selected existing community product
    else if (existingCommunityProductId) {
      productId = existingCommunityProductId
      productType = 'community'
    }
    // Case 3: Check if prototype exists (brand verified)
    else {
      let prototypeFilter = 'isActive.eq.true'
      if (upc) {
        prototypeFilter += `,upc.eq.${upc}`
      }

      const { data: existingPrototype } = await supabase
        .from('Prototype')
        .select('id, brandId')
        .or(prototypeFilter)
        .ilike('name', `%${name}%`)
        .limit(1)
        .maybeSingle()

      if (existingPrototype) {
        productId = existingPrototype.id
        productType = 'prototype'
        console.log('Found existing prototype:', productId)
      }
      // Case 4: Check if community product exists
      else {
        const { data: existingCommunity } = await supabase
          .from('CommunityProduct')
          .select('*')
          .eq('brandName', brandName)
          .ilike('name', `%${name}%`)
          .eq('status', 'ACTIVE')
          .limit(1)
          .maybeSingle()

        if (existingCommunity) {
          productId = existingCommunity.id
          productType = 'community'
          console.log('Found existing community product:', productId)
        }
        // Case 5: Create new community product
        else {
          const { data: newCommunityProduct, error: createError } = await supabase
            .from('CommunityProduct')
            .insert({
              name,
              brandName,
              upc,
              category,
              description,
              createdBy: user.id,
              status: 'ACTIVE'
            })
            .select()
            .single()

          if (createError) {
            console.error('Error creating community product:', createError)
            throw createError
          }

          productId = newCommunityProduct.id
          productType = 'community'
          console.log('Created new community product:', productId)
        }
      }
    }

    // Create ownership
    const ownershipData: any = {
      ownerId: user.id,
      status: 'owned',
      verified: false,
      processingStatus: imageFile ? 'pending' : 'completed',
      condition,
      notes,
      purchasePrice,
      purchaseDate
    }

    if (productType === 'prototype') {
      ownershipData.prototypeId = productId
    } else {
      ownershipData.communityProductId = productId
    }

    const { data: ownership, error: ownershipError } = await supabase
      .from('Ownership')
      .insert(ownershipData)
      .select()
      .single()

    if (ownershipError) {
      console.error('Error creating ownership:', ownershipError)
      throw ownershipError
    }

    console.log('Created ownership:', ownership.id)

    // If image provided, upload it
    if (imageFile) {
      try {
        const fileExt = imageFile.name.split('.').pop() || 'jpg'
        const fileName = `${ownership.id}_original.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        console.log('Uploading image to:', filePath)

        // Convert File to ArrayBuffer for Supabase storage
        const arrayBuffer = await imageFile.arrayBuffer()

        const { error: uploadError } = await supabase.storage
          .from('item-originals')
          .upload(filePath, arrayBuffer, {
            contentType: imageFile.type || 'image/jpeg',
            upsert: true
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          throw new Error(`Failed to upload image: ${uploadError.message}`)
        }

        console.log('Image uploaded successfully')

        const { data: { publicUrl: originalUrl } } = supabase.storage
          .from('item-originals')
          .getPublicUrl(filePath)

        // Update ownership with original URL
        await supabase
          .from('Ownership')
          .update({ originalImageUrl: originalUrl })
          .eq('id', ownership.id)
          
      } catch (imageError) {
        console.error('Image processing error:', imageError)
        // Don't fail the whole request, just mark processing as failed
        await supabase
          .from('Ownership')
          .update({ processingStatus: 'failed' })
          .eq('id', ownership.id)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        ownership,
        productType,
        productId
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})