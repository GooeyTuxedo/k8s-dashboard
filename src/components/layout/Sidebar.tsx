import Link from 'next/link'

export default function Sidebar() {
  const navigation = [
    { name: 'Overview', href: '/' },
    { name: 'Clusters', href: '/clusters' },
    { name: 'Deployments', href: '/deployments' },
    { name: 'Costs', href: '/costs' },
  ]

  return (
    <div className="w-64 bg-white shadow">
      <nav className="mt-5 px-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  )
}