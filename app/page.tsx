import { supabase, Article } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 60 // revalidate every 60 seconds

async function getArticles(): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching articles:', error)
    return []
  }
  return data || []
}

function CategoryBadge({ category }: { category: string | null }) {
  return (
    <span className="category-badge">{category || 'General'}</span>
  )
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

export default async function HomePage() {
  const articles = await getArticles()
  const [featured, ...rest] = articles

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
      
      {/* MASTHEAD */}
      <div style={{ textAlign: 'center', padding: '2.5rem 0 1.5rem', borderBottom: '4px solid #c0392b' }}>
        <h1 style={{
          fontFamily: 'Georgia, serif',
          fontSize: 'clamp(2.8rem, 8vw, 6rem)',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: '#f5f5f5',
          lineHeight: 1,
          marginBottom: '0.5rem'
        }}>
          THE PHANTOM POST
        </h1>
        <p style={{
          color: '#888',
          fontSize: '0.8rem',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          fontFamily: 'Inter, sans-serif'
        }}>
          Unfiltered &nbsp;·&nbsp; Automated &nbsp;·&nbsp; True
        </p>
      </div>

      {/* SECTION NAV */}
      <div style={{
        display: 'flex', gap: '0', borderBottom: '1px solid #222',
        margin: '0 0 2rem',
      }}>
        {['All', 'UK', 'World', 'Tech', 'Crime'].map((cat) => (
          <a key={cat} href={cat === 'All' ? '/' : `/?category=${cat}`}
            style={{
              padding: '0.6rem 1rem',
              color: '#888',
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              borderBottom: '2px solid transparent',
            }}>
            {cat}
          </a>
        ))}
      </div>

      {articles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#444' }}>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', marginBottom: '1rem' }}>No articles published yet.</p>
          <p style={{ fontSize: '0.85rem' }}>The Phantom Post is warming up. First dispatch incoming.</p>
        </div>
      ) : (
        <>
          {/* FEATURED HERO */}
          {featured && (
            <div style={{ marginBottom: '3rem', paddingBottom: '3rem', borderBottom: '1px solid #1e1e1e' }}>
              <Link href={`/${featured.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
                  <div>
                    {featured.image_url ? (
                      <img
                        src={featured.image_url}
                        alt={featured.title}
                        style={{ width: '100%', height: '320px', objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%', height: '320px', backgroundColor: '#141414',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <span style={{ color: '#c0392b', fontSize: '3rem', fontFamily: 'Georgia, serif' }}>P</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <CategoryBadge category={featured.category} />
                    <h2 style={{
                      fontFamily: 'Georgia, serif',
                      fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                      fontWeight: 700,
                      color: '#f5f5f5',
                      lineHeight: 1.15,
                      margin: '0.75rem 0 1rem',
                    }}>
                      {featured.title}
                    </h2>
                    {featured.summary && (
                      <p style={{ color: '#aaa', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                        {featured.summary}
                      </p>
                    )}
                    <p style={{ color: '#555', fontSize: '0.75rem', fontFamily: 'Inter, sans-serif' }}>
                      {formatDate(featured.published_at)}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* ARTICLE GRID */}
          {rest.length > 0 && (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem'
              }}>
                <span style={{ color: '#c0392b', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Latest</span>
                <div style={{ flex: 1, borderTop: '1px solid #222' }} />
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '2rem',
              }}>
                {rest.map((article) => (
                  <Link key={article.id} href={`/${article.slug}`} style={{ textDecoration: 'none' }} className="article-card">
                    <article>
                      {article.image_url ? (
                        <img
                          src={article.image_url}
                          alt={article.title}
                          style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block', marginBottom: '0.75rem' }}
                        />
                      ) : (
                        <div style={{
                          width: '100%', height: '180px', backgroundColor: '#141414',
                          marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <span style={{ color: '#c0392b', fontSize: '2rem', fontFamily: 'Georgia, serif' }}>P</span>
                        </div>
                      )}
                      <CategoryBadge category={article.category} />
                      <h3 className="article-title" style={{
                        fontFamily: 'Georgia, serif',
                        fontSize: '1.15rem',
                        fontWeight: 700,
                        color: '#f5f5f5',
                        lineHeight: 1.3,
                        margin: '0.5rem 0 0.5rem',
                        transition: 'color 0.2s',
                      }}>
                        {article.title}
                      </h3>
                      {article.summary && (
                        <p style={{ color: '#777', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                          {article.summary.substring(0, 120)}{article.summary.length > 120 ? '…' : ''}
                        </p>
                      )}
                      <p style={{ color: '#444', fontSize: '0.7rem' }}>{formatDate(article.published_at)}</p>
                    </article>
                  </Link>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
