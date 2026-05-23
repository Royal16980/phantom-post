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
    // Auth check
    const secret = request.headers.get('x-publish-secret') || 
                   request.nextUrl.searchParams.get('secret')
    
    if (secret !== process.env.PUBLISH_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // Generate unique slug
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
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      article: data,
      url: `/${data.slug}`
    }, { status: 201 })

  } catch (err) {
    console.error('Publish error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'Phantom Post API online',
    endpoint: 'POST /api/publish',
    required_header: 'x-publish-secret: <your-secret>',
    body: { title: 'string', summary: 'string', body: 'markdown string', category: 'UK|World|Tech|Crime', image_url: 'string (optional)' }
  })
}
