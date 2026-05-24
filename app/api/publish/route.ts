import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80)
}

export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-publish-secret') || 
                   request.nextUrl.searchParams.get('secret')
    
    const expectedSecret = process.env.PUBLISH_SECRET
    
    // Temp debug: return info about what we got
    const debugMode = request.nextUrl.searchParams.get('debug') === '1'
    if (debugMode) {
      return NextResponse.json({
        received_secret_length: secret?.length ?? null,
        received_secret_first3: secret?.substring(0, 3) ?? null,
        received_secret_last3: secret ? secret.substring(secret.length - 3) : null,
        expected_length: expectedSecret?.length ?? null,
        expected_first3: expectedSecret?.substring(0, 3) ?? null,
        expected_last3: expectedSecret ? expectedSecret.substring(expectedSecret.length - 3) : null,
        match: secret === expectedSecret
      })
    }
    
    if (!expectedSecret) {
      return NextResponse.json({ error: 'Server misconfiguration: PUBLISH_SECRET not set' }, { status: 500 })
    }
    
    if (secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized', hint: 'secret_mismatch' }, { status: 401 })
    }

    const body = await request.json()
    const { title, summary, body: articleBody, category, image_url } = body

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const baseSlug = slugify(title)
    const timestamp = Date.now().toString(36)
    const slug = `${baseSlug}-${timestamp}`

    const { data, error } = await supabase
      .from('articles')
      .insert({
        title,
        slug,
        summary: summary || null,
        body: articleBody || null,
        category: category || 'General',
        image_url: image_url || null,
        published_at: new Date().toISOString(),
        status: 'published',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, article: data, url: `/${data.slug}` }, { status: 201 })

  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  const secretSet = !!process.env.PUBLISH_SECRET
  const secretLen = process.env.PUBLISH_SECRET?.length || 0
  return NextResponse.json({ 
    status: 'Phantom Post API online',
    endpoint: 'POST /api/publish',
    required_header: 'x-publish-secret: <your-secret>',
    env_check: { PUBLISH_SECRET_set: secretSet, PUBLISH_SECRET_length: secretLen },
    body: { title: 'string', summary: 'string', body: 'markdown string', category: 'UK|World|Tech|Crime', image_url: 'string (optional)' }
  })
}
