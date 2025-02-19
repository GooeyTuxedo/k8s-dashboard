import { NextResponse, NextRequest } from 'next/server'
import * as k8s from '@kubernetes/client-node'

// Initialize the Kubernetes client
const kc = new k8s.KubeConfig()
kc.loadFromDefault()
const k8sApi = kc.makeApiClient(k8s.CoreV1Api)

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ namespace: string; name: string }> }
) {
  try {
    const params = await context.params
    const { searchParams } = new URL(request.url)
    const container = searchParams.get('container')
    const tailLines = parseInt(searchParams.get('tailLines') || '100')

    if (!params.name) {
      return NextResponse.json(
        { error: 'Container name is required' },
        { status: 400 }
      )
    }

    const response = await k8sApi.readNamespacedPodLog({
      name: params.name,
      namespace: params.namespace,
      pretty: "true",
      container: container ? container : undefined,
      tailLines
    })

    console.log("LOGSSS: ", response)

    return new NextResponse(response)
  } catch (error) {
    console.error('Error fetching pod logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pod logs' },
      { status: 500 }
    )
  }
}
