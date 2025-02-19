export default function Header() {
  return (
    <header className="bg-dark-bg-secondary border-b border-dark-border">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-dark-text-primary">K8s Dashboard</h1>
          </div>
        </div>
      </div>
    </header>
  )
}