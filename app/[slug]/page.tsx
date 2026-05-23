import { supabase, Article } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 60

async function getArticle(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !data) return null
  return data
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug)
  if (!article) return { title: 'Not Found' }
  return {
    title: `${article.title} | The Phantom Post`,
    description: article.summary || undefined,
    openGraph: {
      title: article.title,
      description: article.summary || undefined,
      images: article.image_url ? [article.image_url] : [],
    },
  }
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}

// Simple markdown renderer (no external dependency)
function renderMarkdown(text: string): string {
  return text
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Unordered list
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    // Paragraphs (double newline)
    .replace(/\n\n/g, '</p><p>')
    // Wrap in paragraphs
    .replace(/^(?!<[h|b|l|p|u|o])/gm, '')
    .trim()
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug)

  if (!article) {
    notFound()
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
      
      {/* Masthead link */}
      <div style={{ textAlign: 'center', padding: '1.5rem 0 1rem', borderBottom: '4px solid #c0392b' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <h1 style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(1.8rem, 5vw, 3.5rem)',
            fontWeight: 700,
            color: '#f5f5f5',
            letterSpacing: '-0.02em',
          }}>
            THE PHANTOM POST
          </h1>
        </Link>
      </div>

      {/* Article */}
      <article style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 0' }}>
        
        {/* Category + date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <span className="category-badge">{article.category || 'General'}</span>
          <span style={{ color: '#555', fontSize: '0.75rem', fontFamily: 'Inter, sans-serif' }}>
            {formatDate(article.published_at)}
          </span>
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily: 'Georgia, serif',
          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
          fontWeight: 700,
          lineHeight: 1.15,
          color: '#f5f5f5',
          marginBottom: '1rem',
        }}>
          {article.title}
        </h2>

        {/* Summary */}
        {article.summary && (
          <p style={{
            fontSize: '1.2rem',
            color: '#999',
            lineHeight: 1.6,
            marginBottom: '2rem',
            borderLeft: '3px solid #c0392b',
            paddingLeft: '1rem',
            fontStyle: 'italic',
          }}>
            {article.summary}
          </p>
        )}

        {/* Hero image */}
        {article.image_url && (
          <div style={{ marginBottom: '2rem' }}>
            <img
              src={article.image_url}
              alt={article.title}
              style={{ width: '100%', maxHeight: '480px', objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}

        <hr className="divider" style={{ marginBottom: '2rem' }} />

        {/* Body */}
        {article.body ? (
          <div
            className="prose"
            style={{ fontSize: '1.05rem', lineHeight: 1.8, color: '#ccc' }}
            dangerouslySetInnerHTML={{
              __html: `<p>${renderMarkdown(article.body)}</p>`
            }}
          />
        ) : (
          <p style={{ color: '#555', fontStyle: 'italic' }}>Full article coming soon.</p>
        )}

        {/* Back link */}
        <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid #1e1e1e' }}>
          <Link href="/" style={{ color: '#c0392b', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>
            ← Back to The Phantom Post
          </Link>
        </div>
      </article>
    </div>
  )
}
