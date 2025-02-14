'use client'

import DashboardLayout from '@/app/components/layout/DashboardLayout'
import { useAppSelector } from '@/app/lib/redux/store'

export default function DashboardPage() {
  const { nodes, pods, isLoading, error } = useAppSelector((state) => state.cluster)

  return (
    <DashboardLayout>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Overview Cards */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium">Cluster Status</h3>
          <p className="mt-2 text-3xl font-bold">
            {isLoading ? 'Loading...' : 'Healthy'}
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium">Total Nodes</h3>
          <p className="mt-2 text-3xl font-bold">
            {isLoading ? 'Loading...' : nodes.length}
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium">Total Pods</h3>
          <p className="mt-2 text-3xl font-bold">
            {isLoading ? 'Loading...' : pods.length}
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}
    </DashboardLayout>
  )
}