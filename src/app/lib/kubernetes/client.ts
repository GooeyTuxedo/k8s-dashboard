import type { Node, Pod } from '@/app/types/kubernetes'

class KubernetesService {
  private readonly baseUrl: string

  constructor() {
    // In development, we'll proxy through Next.js API routes
    this.baseUrl = '/api/kubernetes'
  }

  private async fetchWithAuth(endpoint: string): Promise<Response> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Kubernetes API error: ${response.statusText}`)
    }

    return response
  }

  async getNodes(): Promise<Node[]> {
    const response = await this.fetchWithAuth('/nodes')
    return response.json()
  }

  async getPods(): Promise<Pod[]> {
    const response = await this.fetchWithAuth('/pods')
    return response.json()
  }

  async getClusterMetrics(): Promise<{
    cpu: { used: string; total: string };
    memory: { used: string; total: string };
  }> {
    const response = await this.fetchWithAuth('/metrics')
    return response.json()
  }
}

export const kubernetesService = new KubernetesService()
