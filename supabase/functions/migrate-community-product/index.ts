// supabase/functions/migrate-community-product/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface MigrateRequest {
  communityProductId: string
  prototypeData: {
    name: string
    description?: string
    sku?: string
    upc?: string
    category?: string
    retailPrice?: number
    imageUrl?: string
    thumbnailUrl?: string
    variants?: any
  }
}

serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing authorization')

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) throw new Error('Unauthorized')

    const { communityProductId, prototypeData }: MigrateRequest = await req.json()

    // Get community product
    const { data: communityProduct, error: cpError } = await supabase
      .from('CommunityProduct')
      .select('*, Brand:brandName')
      .eq('id', communityProductId)
      .single()

    if (cpError || !communityProduct) throw new Error('Community product not found')

    // Verify user is brand admin
    const { data: brand } = await supabase
      .from('Brand')
      .select('i, name')
      .ilike('name', communityProduct.brandName)
      .single()
    if (!brand) throw new Error('Brand not found')

    const { data: brandAdmin } = await supabase
      .from('BrandAdmin')
      .select('id')
      .eq('brandId', brand.id)
      .eq('userId', user.id)
      .single()

    if (!brandAdmin) throw new Error('Not authorized - must be brand admin')

    // Create prototype
    const { data: prototype, error: prototypeError } = await supabase
      .from('Prototype')
      .insert({
        ...prototypeData,
        brandId: brand.id,
        isVerified: true,
        verifiedBy: user.id,
        verifiedAt: new Date().toISOString(),
        isActive: true
      })
      .select()
      .single()

    if (prototypeError) throw prototypeError

    // Migrate ownerships
    const { data: result } = await supabase
      .rpc('migrate_community_product_to_prototype', {
        community_product_id: communityProductId,
        prototype_id: prototype.id
      })

    return new Response(
      JSON.stringify({
        success: true,
        prototype,
        migration: result
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