import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function Layout({ children, active }) {
  const router = useRouter()
  async function logout() {
    await supabase.auth.signOut()
    router.push('/')
  }
  const nav = [
    { href: '/dashboard', label: '📊 Dashboard' },
    { href: '/devis/nouveau', label: '✏️ Nouveau devis' },
    { href: '/devis', label: '📄 Mes devis' },
    { href: '/paiements', label: '💶 Paiements' },
    { href: '/clients', label: '👤 Clients' },
  ]
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 bg-white border-r border-gray-100 min-h-screen flex flex-col fixed top-0 left-0 h-full">
        <div className="p-5 border-b border-gray-100">
          <h1 className="font-bold text-lg text-gray-900">DevisPlomb</h1>
          <p className="text-xs text-gray-400 mt-0.5">Pro</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(n => (
            <a key={n.href} href={n.href}
              className={`block px-3 py-2 rounded-lg text-sm transition ${active === n.href ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button onClick={logout} className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-50">
            🚪 Déconnexion
          </button>
        </div>
      </aside>
      <main className="ml-56 flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
