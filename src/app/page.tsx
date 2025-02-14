'use client'

import { formatDistanceToNow } from 'date-fns'
import DashboardLayout from '@/app/components/layout/DashboardLayout'
import { useAppSelector } from '@/app/lib/redux/store'

export default function DashboardPage() {
  const { nodes, pods, isLoading, error, clusterHealth } = useAppSelector((state) => state.cluster)

  const getHealthStatusColor = (status: typeof clusterHealth.status): string => {
    const colors = {
      Healthy: 'text-green-600',
      Degraded: 'text-yellow-600',
      Critical: 'text-red-600',
      Unknown: 'text-gray-600',
    }
    return colors[status]
  }

  return (
    <DashboardLayout>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Overview Cards */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium">Cluster Status</h3>
          <p className={`mt-2 text-3xl font-bold ${getHealthStatusColor(clusterHealth.status)}`}>
            {isLoading ? 'Loading...' : clusterHealth.status}
          </p>
          {clusterHealth.lastUpdated && (
            <p className="mt-2 text-sm text-gray-500">
              Last updated: {formatDistanceToNow(new Date(clusterHealth.lastUpdated))} ago
            </p>
          )}
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium">Total Nodes</h3>
          <p className="mt-2 text-3xl font-bold">
            {isLoading ? 'Loading...' : nodes.length}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {nodes.filter(node => 
              node.status.conditions.some(condition => 
                condition.type === 'Ready' && condition.status === 'True'
              )
            ).length} Ready
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium">Total Pods</h3>
          <p className="mt-2 text-3xl font-bold">
            {isLoading ? 'Loading...' : pods.length}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {pods.filter(pod => pod.status.phase === 'Running').length} Running
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
