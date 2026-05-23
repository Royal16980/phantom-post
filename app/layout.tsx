import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'The Phantom Post',
  description: 'Unfiltered. Automated. True.',
  openGraph: {
    title: 'The Phantom Post',
    description: 'Unfiltered. Automated. True.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {/* Site Nav */}
        <header style={{ backgroundColor: '#0a0a0a', borderBottom: '1px solid #1a1a1a' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
            <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '44px' }}>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                {['UK', 'World', 'Tech', 'Crime'].map((cat) => (
                  <a key={cat} href={`/?category=${cat}`}
                    style={{ color: '#888', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
                    {cat}
                  </a>
                ))}
              </div>
              <div style={{ color: '#888', fontSize: '0.7rem' }}>
                {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid #1a1a1a', marginTop: '4rem', padding: '2rem 1.5rem', textAlign: 'center' }}>
          <p style={{ color: '#444', fontSize: '0.75rem' }}>
            © {new Date().getFullYear()} The Phantom Post · Unfiltered. Automated. True.
          </p>
        </footer>
      </body>
    </html>
  )
}
