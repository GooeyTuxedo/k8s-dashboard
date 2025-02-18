'use client'

import { useState, useMemo } from 'react'
import PodDetailsModal from '@/components/pods/PodDetailsModal'
import { useAppSelector } from '@/lib/redux/store'
import DashboardLayout from '@/components/layout/DashboardLayout'
import type { Pod } from '@/types/kubernetes'

type SortField = 'name' | 'namespace' | 'status' | 'age' | 'cpu' | 'memory'
type SortOrder = 'asc' | 'desc'

export default function PodsPage() {
  const { pods, isLoading } = useAppSelector((state) => state.cluster)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [selectedPod, setSelectedPod] = useState<Pod | null>(null)
  const [selectedNamespace, setSelectedNamespace] = useState<string>('all')

  // Get unique namespaces for filter dropdown
  const namespaces = useMemo(() => {
    const uniqueNamespaces = new Set(pods.map(pod => pod.metadata.namespace))
    return ['all', ...Array.from(uniqueNamespaces)].sort()
  }, [pods])

  // Filter and sort pods
  const filteredPods = useMemo(() => {
    return pods
      .filter(pod => {
        const matchesSearch = pod.metadata.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesNamespace = selectedNamespace === 'all' || pod.metadata.namespace === selectedNamespace
        return matchesSearch && matchesNamespace
      })
      .sort((a, b) => {
        let comparison = 0
        switch (sortField) {
          case 'name':
            comparison = a.metadata.name.localeCompare(b.metadata.name)
            break
          case 'namespace':
            comparison = a.metadata.namespace.localeCompare(b.metadata.namespace)
            break
          case 'status':
            comparison = a.status.phase.localeCompare(b.status.phase)
            break
          case 'age':
            comparison = new Date(a.metadata.creationTimestamp).getTime() - 
                        new Date(b.metadata.creationTimestamp).getTime()
            break
          // Add more sort fields as needed
        }
        return sortOrder === 'asc' ? comparison : -comparison
      })
  }, [pods, searchTerm, selectedNamespace, sortField, sortOrder])

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Pods</h1>
          <div className="flex space-x-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search pods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-md border border-gray-300 px-4 py-2"
            />
            {/* Namespace filter */}
            <select
              value={selectedNamespace}
              onChange={(e) => setSelectedNamespace(e.target.value)}
              className="rounded-md border border-gray-300 px-4 py-2"
            >
              {namespaces.map(ns => (
                <option key={ns} value={ns}>
                  {ns === 'all' ? 'All Namespaces' : ns}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pods table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Name', 'Namespace', 'Status', 'Age', 'CPU', 'Memory'].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    onClick={() => handleSort(header.toLowerCase() as SortField)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{header}</span>
                      {sortField === header.toLowerCase() && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">Loading...</td>
                </tr>
              ) : filteredPods.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">No pods found</td>
                </tr>
              ) : (
                filteredPods.map((pod) => (
                  <tr key={pod.metadata.uid} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">{pod.metadata.name}</td>
                    <td className="whitespace-nowrap px-6 py-4">{pod.metadata.namespace}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <PodStatusBadge status={pod.status.phase} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {formatAge(new Date(pod.metadata.creationTimestamp))}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {/* Add CPU usage when available */}
                      -
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {/* Add Memory usage when available */}
                      -
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => setSelectedPod(pod)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pod Details Modal */}
      <PodDetailsModal
        pod={selectedPod}
        isOpen={selectedPod !== null}
        onClose={() => setSelectedPod(null)}
      />
    </DashboardLayout>
  )
}

function PodStatusBadge({ status }: { status: string }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Running':
        return 'bg-green-100 text-green-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Succeeded':
        return 'bg-blue-100 text-blue-800'
      case 'Failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(status)}`}>
      {status}
    </span>
  )
}

function formatAge(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return `${diffInSeconds}s`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
  return `${Math.floor(diffInSeconds / 86400)}d`
}
