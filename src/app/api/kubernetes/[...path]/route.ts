import { NextRequest, NextResponse } from 'next/server'
import * as k8s from '@kubernetes/client-node'
import { NodeMetrics } from '@/app/types/kubernetes'

// Initialize the Kubernetes client
const kc = new k8s.KubeConfig()
kc.loadFromDefault() // This will work with Minikube
const k8sApi = kc.makeApiClient(k8s.CoreV1Api)
const metricsApi = kc.makeApiClient(k8s.CustomObjectsApi)

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  try {
    const params = await context.params;
    const path = params.path[0]

    switch (path) {
      case 'nodes': {
        const response = await k8sApi.listNode()
        return NextResponse.json(response.items)
      }

      case 'pods': {
        const response = await k8sApi.listPodForAllNamespaces()
        return NextResponse.json(response.items)
      }

      case 'metrics': {
        // Get metrics from the metrics-server
        const response = await metricsApi.listClusterCustomObject({
          group: 'metrics.k8s.io',
          version: 'v1beta1',
          plural: 'nodes'
        }) as NodeMetrics

        // Verify we have items before processing
        if (!response.items) {
          throw new Error('No metrics items found')
        }

        // Aggregate metrics across all nodes
        const aggregatedMetrics = response.items.reduce(
          (acc, node) => {
            // Parse CPU (remove any non-numeric characters except dots)
            const cpuValue = parseInt(node.usage.cpu.replace(/[^0-9.]/g, '')) || 0
            const memValue = parseInt(node.usage.memory.replace(/[^0-9.]/g, '')) || 0

            return {
              cpu: {
                used: acc.cpu.used + cpuValue,
                total: acc.cpu.total
              },
              memory: {
                used: acc.memory.used + memValue,
                total: acc.memory.total
              }
            }
          },
          { 
            cpu: { used: 0, total: 0 }, 
            memory: { used: 0, total: 0 } 
          }
        )

        return NextResponse.json(aggregatedMetrics)
      }

      default:
        return NextResponse.json(
          { error: 'Invalid endpoint' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Kubernetes API error:', error)
    
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      })
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch Kubernetes data' },
      { status: 500 }
    )
  }
}
