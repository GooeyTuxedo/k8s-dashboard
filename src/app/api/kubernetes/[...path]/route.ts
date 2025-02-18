import { NextRequest, NextResponse } from 'next/server'
import * as k8s from '@kubernetes/client-node'
import { NodeMetrics } from '@/types/kubernetes'

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
        console.log('Fetching pods from Kubernetes API...');
        const response = await k8sApi.listPodForAllNamespaces();
        console.log('Kubernetes API Response:', response.items);
        return NextResponse.json(response.items)
      }

      case 'metrics': {
        // Get both metrics and nodes in parallel
        const [metricsResponse, nodesResponse] = await Promise.all([
          metricsApi.listClusterCustomObject({
            group: 'metrics.k8s.io',
            version: 'v1beta1',
            plural: 'nodes'
          }) as Promise<NodeMetrics>,
          k8sApi.listNode()
        ]);

        // Calculate total capacity from nodes
        const totalCapacity = nodesResponse.items.reduce((acc, node) => {
          if (node.status?.capacity?.cpu && node.status?.capacity?.memory) {
            // CPU capacity is typically in "cores" units
            const cpuCapacity = parseInt(node.status.capacity.cpu);
            // Memory capacity is typically in Ki units
            const memoryCapacity = parseInt(node.status.capacity.memory.replace('Ki', '')) / 1024; // Convert to Mi
            
            return {
              cpu: acc.cpu + cpuCapacity,
              memory: acc.memory + memoryCapacity
            };
          } else {
            return acc
          }
        }, { cpu: 0, memory: 0 });

        // Calculate current usage from metrics
        const currentUsage = metricsResponse.items.reduce(
          (acc, node) => {
            // Parse CPU from nanoseconds to cores
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
            used: currentUsage.cpu,
            total: totalCapacity.cpu
          },
          memory: {
            used: currentUsage.memory,
            total: totalCapacity.memory
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
