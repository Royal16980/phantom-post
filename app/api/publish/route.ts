import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

// Public Supabase credentials (NEXT_PUBLIC_ = safe to expose in client/edge code)
const SUPABASE_URL = 'https://mhryuiogffrmidtkvrxl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ocnl1aW9nZmZybWlkdGt2cnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDY1ODksImV4cCI6MjA5MjcyMjU4OX0.6XmHq29jYu-wYbZY3Xetr0gzhWsVE3aWLkG4eQ8HJHw'

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
    
    // Strip BOM (﻿) that Windows CLI may prepend when setting env vars
    const expectedSecret = (process.env.PUBLISH_SECRET || '').replace(/^﻿/, '').trim()
    
    if (!expectedSecret) {
      return NextResponse.json({ error: 'Server misconfiguration: PUBLISH_SECRET not set' }, { status: 500 })
    }
    
    if (secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, summary, body: articleBody, category, image_url } = body

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

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
