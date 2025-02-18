import { createAsyncThunk } from '@reduxjs/toolkit'
import { kubernetesService } from '@/app/lib/kubernetes/client'
import { setNodes, setPods, setLoading, setError, setClusterHealth } from './clusterSlice'
import { setMetrics, setMetricsLoading, setMetricsError } from './metricsSlice'
import type { Node, Pod } from '@/app/types/kubernetes'

export const fetchClusterData = createAsyncThunk(
  'cluster/fetchData',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true))
      dispatch(setMetricsLoading(true))
      dispatch(setError(null))
      dispatch(setMetricsError(null))

      // Fetch data in parallel
      const [nodes, pods, metricsResponse] = await Promise.all([
        kubernetesService.getNodes(),
        kubernetesService.getPods(),
        kubernetesService.getClusterMetrics(),
      ])

      console.log('Metrics response:', metricsResponse) // Debug log

      dispatch(setNodes(nodes))
      dispatch(setPods(pods))
      dispatch(setMetrics(metricsResponse))

      // Determine cluster health
      const health = determineClusterHealth(nodes, pods)
      dispatch(setClusterHealth({
        status: health,
        lastUpdated: new Date().toISOString(),
      }))

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch cluster data'
      dispatch(setError(errorMessage))
      dispatch(setMetricsError(errorMessage))
    } finally {
      dispatch(setLoading(false))
      dispatch(setMetricsLoading(false))
    }
  }
)

function determineClusterHealth(nodes: Node[], pods: Pod[]): 'Healthy' | 'Degraded' | 'Critical' | 'Unknown' {
  try {
    // Check if any nodes are not ready
    const unhealthyNodes = nodes.filter(node =>
      !node.status.conditions.some(condition =>
        condition.type === 'Ready' && condition.status === 'True'
      )
    )

    // Check if any pods are not running or pending
    const unhealthyPods = pods.filter(pod =>
      !['Running', 'Pending', 'Succeeded'].includes(pod.status.phase)
    )

    if (unhealthyNodes.length === 0 && unhealthyPods.length === 0) {
      return 'Healthy'
    }

    // If more than 20% of nodes or pods are unhealthy, consider it critical
    const nodeHealthPercentage = (unhealthyNodes.length / nodes.length) * 100
    const podHealthPercentage = (unhealthyPods.length / pods.length) * 100

    if (nodeHealthPercentage > 20 || podHealthPercentage > 20) {
      return 'Critical'
    }

    return 'Degraded'
  } catch (error) {
    console.error('Error determining cluster health:', error)
    return 'Unknown'
  }
}