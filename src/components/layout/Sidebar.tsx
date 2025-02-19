import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()
  
  const navigation = [
    { name: 'Overview', href: '/' },
    { name: 'Clusters', href: '/clusters' },
    { name: 'Pods', href: '/pods' },
    { name: 'Deployments', href: '/deployments' },
    { name: 'Costs', href: '/costs' },
  ]

  return (
    <div className="w-64 bg-dark-bg-secondary border-r border-dark-border">
      <nav className="mt-5 px-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
            >
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}