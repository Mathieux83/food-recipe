import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/ui/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | FoodApp',
    default: 'FoodApp - Recettes et listes de courses'
  },
  description: 'Trouvez des recettes avec vos ingrédients et créez vos listes de courses automatiquement.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="mt-16 bg-black">
            <div className="container mx-auto py-2 text-center text-white ">
              <p>&copy; 2025 FoodApp.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
