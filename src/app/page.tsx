'use client'

import { useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import { fetchClusterData } from '@/lib/redux/features/clusterThunks'
import ClusterMetrics from '@/components/ClusterMetrics'
import { formatDistanceToNow } from 'date-fns'

export default function DashboardPage() {
  const dispatch = useAppDispatch()
  const { nodes, pods, isLoading, error, clusterHealth } = useAppSelector((state) => state.cluster)
  const metrics = useAppSelector((state) => state.metrics)

  useEffect(() => {
    // Fetch initial data
    dispatch(fetchClusterData())

    // Set up polling every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchClusterData())
    }, 30000)

    return () => clearInterval(interval)
  }, [dispatch])

  const getHealthStatusColor = (status: typeof clusterHealth.status): string => {
    const colors = {
      Healthy: 'text-green-400',
      Degraded: 'text-yellow-400',
      Critical: 'text-red-400',
      Unknown: 'text-gray-400',
    }
    return colors[status]
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Status Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="card p-6">
            <h3 className="text-lg font-medium text-dark-text-secondary">Cluster Status</h3>
            <p className={`mt-2 text-3xl font-bold ${getHealthStatusColor(clusterHealth.status)}`}>
              {isLoading ? 'Loading...' : clusterHealth.status}
            </p>
            {clusterHealth.lastUpdated && (
              <p className="mt-2 text-sm text-dark-text-muted">
                Last updated: {formatDistanceToNow(new Date(clusterHealth.lastUpdated))} ago
              </p>
            )}
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-medium text-dark-text-secondary">Total Nodes</h3>
            <p className="mt-2 text-3xl font-bold text-dark-text-primary">
              {isLoading ? 'Loading...' : nodes.length}
            </p>
            <p className="mt-2 text-sm text-dark-text-muted">
              {nodes.filter(node => 
                node.status.conditions.some(condition => 
                  condition.type === 'Ready' && condition.status === 'True'
                )
              ).length} Ready
            </p>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-medium text-dark-text-secondary">Total Pods</h3>
            <p className="mt-2 text-3xl font-bold text-dark-text-primary">
              {isLoading ? 'Loading...' : pods.length}
            </p>
            <p className="mt-2 text-sm text-dark-text-muted">
              {pods.filter(pod => pod.status.phase === 'Running').length} Running
            </p>
          </div>
        </div>

        {/* Metrics Visualization */}
        {metrics && !isLoading && (
          <ClusterMetrics
            cpu={metrics.cpu}
            memory={metrics.memory}
          />
        )}

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}