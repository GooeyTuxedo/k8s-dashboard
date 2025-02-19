'use client'

import { useEffect, useState, useMemo } from 'react'
import PodDetailsModal from '@/components/pods/PodDetailsModal'
import PodStatusBadge from '@/components/pods/PodStatusBadge'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { fetchClusterData } from '@/lib/redux/features/clusterThunks'
import type { Pod } from '@/types/kubernetes'

type SortField = 'name' | 'namespace' | 'status' | 'age' | 'cpu' | 'memory'
type SortOrder = 'asc' | 'desc'

export default function PodsPage() {
  const dispatch = useAppDispatch()
  const { pods, isLoading } = useAppSelector((state) => {
    console.log('Redux State:', state);
    return state.cluster;
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [selectedPod, setSelectedPod] = useState<Pod | null>(null)
  const [selectedNamespace, setSelectedNamespace] = useState<string>('all')

  useEffect(() => {
    console.log('PodsPage mounted, fetching data...');
    dispatch(fetchClusterData());

    // Set up polling every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchClusterData());
    }, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [dispatch]);

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
          <h1 className="text-2xl font-semibold text-dark-text-primary">Pods</h1>
          <div className="flex space-x-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search pods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
            />
            {/* Namespace filter */}
            <select
              value={selectedNamespace}
              onChange={(e) => setSelectedNamespace(e.target.value)}
              className="input"
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
        <div className="overflow-x-auto rounded-lg border border-dark-border">
          <table className="min-w-full divide-y divide-dark-border">
            <thead className="bg-dark-bg-secondary">
              <tr>
                {['Name', 'Namespace', 'Status', 'Age', 'CPU', 'Memory'].map((header) => (
                  <th
                    key={header}
                    className="table-header"
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
                <th className="table-header">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border bg-dark-bg-secondary">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="table-cell text-center">Loading...</td>
                </tr>
              ) : filteredPods.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-cell text-center">No pods found</td>
                </tr>
              ) : (
                filteredPods.map((pod) => (
                  <tr key={pod.metadata.uid} className="hover:bg-dark-bg-tertiary">
                    <td className="table-cell">{pod.metadata.name}</td>
                    <td className="table-cell">{pod.metadata.namespace}</td>
                    <td className="table-cell">
                      <PodStatusBadge status={pod.status.phase} />
                    </td>
                    <td className="table-cell">
                      {formatAge(new Date(pod.metadata.creationTimestamp))}
                    </td>
                    <td className="table-cell">
                      {/* Add CPU usage when available */}
                      -
                    </td>
                    <td className="table-cell">
                      {/* Add Memory usage when available */}
                      -
                    </td>
                    <td className="table-cell">
                      <button
                        className="text-blue-400 hover:text-blue-300"
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

function formatAge(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return `${diffInSeconds}s`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
  return `${Math.floor(diffInSeconds / 86400)}d`
}