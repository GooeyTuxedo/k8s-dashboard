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

        // Calculate current usage from all nodes
        const usage = response.items.reduce(
          (acc, node) => {
            // Parse CPU from nanoseconds to cores (1 core = 1000000000 nanoseconds)
            const cpuValue = parseInt(node.usage.cpu.replace('n', '')) / 1000000000;
            // Parse memory from Kibibytes to Megabytes
            const memValue = parseInt(node.usage.memory.replace('Ki', '')) / 1024;

            return {
              cpu: acc.cpu + cpuValue,
              memory: acc.memory + memValue
            };
          },
          { cpu: 0, memory: 0 }
        );

        const aggregatedMetrics = {
          cpu: {
            used: usage.cpu,
            total: Math.max(usage.cpu, 4) // Set a minimum of 4 cores for visualization
          },
          memory: {
            used: usage.memory,
            total: Math.max(usage.memory, 8192) // Set a minimum of 8GB for visualization
          }
        };

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
