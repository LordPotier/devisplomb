import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'

export default function Clients() {
  const router = useRouter()
  const [clients, setClients] = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (!data.session) router.push('/') })
    supabase.from('devis').select('client_nom, client_email, client_tel, total_ttc, created_at').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) {
        const map = {}
        data.forEach(d => {
          if (!map[d.client_nom]) map[d.client_nom] = { ...d, nb: 0, total: 0 }
          map[d.client_nom].nb++
          map[d.client_nom].total += d.total_ttc || 0
        })
        setClients(Object.values(map))
      }
    })
  }, [])

  return (
    <Layout active="/clients">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Clients</h1>
      <div className="bg-white rounded-xl border border-gray-100">
        {clients.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">👤</p>
            <p>Aucun client pour l'instant</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-400 text-xs border-b border-gray-100">
              <th className="p-4">Client</th><th className="p-4">Contact</th><th className="p-4">Devis</th><th className="p-4">CA total</th>
            </tr></thead>
            <tbody>
              {clients.map((c, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4 font-medium">{c.client_nom}</td>
                  <td className="p-4 text-gray-400">{c.client_email || c.client_tel || '—'}</td>
                  <td className="p-4">{c.nb} devis</td>
                  <td className="p-4 font-medium text-green-600">{c.total} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  )
}
