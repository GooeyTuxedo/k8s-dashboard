import { NextResponse } from 'next/server'
import * as k8s from '@kubernetes/client-node'

// Initialize the Kubernetes client
const kc = new k8s.KubeConfig()
kc.loadFromDefault() // This will work with Minikube
const k8sApi = kc.makeApiClient(k8s.CoreV1Api)
const metricsApi = kc.makeApiClient(k8s.CustomObjectsApi)

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
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
        })
        
        // Type assertion since we know the structure
        const metrics = response.body as {
          items: Array<{
            metadata: { name: string };
            usage: {
              cpu: string;
              memory: string;
            };
          }>;
        }

        // Aggregate metrics across all nodes
        const aggregatedMetrics = metrics.items.reduce(
          (acc, node) => {
            acc.cpu.used = (parseInt(acc.cpu.used) + parseInt(node.usage.cpu)).toString();
            acc.memory.used = (parseInt(acc.memory.used) + parseInt(node.usage.memory)).toString();
            return acc;
          },
          { cpu: { used: '0', total: '0' }, memory: { used: '0', total: '0' } }
        );

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
    return NextResponse.json(
      { error: 'Failed to fetch Kubernetes data' },
      { status: 500 }
    )
  }
}