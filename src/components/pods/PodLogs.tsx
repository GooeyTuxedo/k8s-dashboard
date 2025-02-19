'use client'

import { useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

interface PodLogsProps {
  isOpen: boolean
  onClose: () => void
  podName: string
  namespace: string
  containerName: string
}

export default function PodLogs({ isOpen, onClose, podName, namespace, containerName }: PodLogsProps) {
  const [logs, setLogs] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [tailLines, setTailLines] = useState<number>(100)

  const fetchLogs = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(
        `/api/kubernetes/pods/${namespace}/${podName}/logs?` + 
        new URLSearchParams({
          container: containerName,
          tailLines: tailLines.toString(),
        })
      )

      if (!response.ok) {
        throw new Error('Failed to fetch logs')
      }

      const text = await response.text()
      setLogs(text.split('\n'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchLogs()
    }
  }, [isOpen, tailLines])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (autoRefresh && isOpen) {
      interval = setInterval(fetchLogs, 5000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [autoRefresh, isOpen])

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-dark-bg-secondary shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-dark-border px-6 py-4">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-dark-text-primary">
                    Logs: {podName} / {containerName}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Controls */}
                <div className="flex items-center space-x-4 border-b border-dark-border bg-dark-bg-tertiary px-6 py-3">
                  <div className="flex items-center space-x-2">
                    <label htmlFor="tailLines" className="text-sm font-medium text-dark-text-secondary">
                      Tail lines:
                    </label>
                    <select
                      id="tailLines"
                      value={tailLines}
                      onChange={(e) => setTailLines(Number(e.target.value))}
                      className="rounded-md border border-dark-border bg-dark-bg-secondary text-dark-text-primary text-sm"
                    >
                      <option value="100">100</option>
                      <option value="500">500</option>
                      <option value="1000">1000</option>
                      <option value="5000">5000</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="autoRefresh"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      className="h-4 w-4 rounded border-dark-border bg-dark-bg-secondary text-dark-accent-blue"
                    />
                    <label htmlFor="autoRefresh" className="text-sm font-medium text-dark-text-secondary">
                      Auto-refresh
                    </label>
                  </div>

                  <button
                    onClick={fetchLogs}
                    className="rounded-md bg-dark-bg-primary px-3 py-1 text-sm font-medium text-dark-text-secondary hover:bg-dark-bg-secondary"
                  >
                    Refresh
                  </button>
                </div>

                {/* Logs */}
                <div className="h-[60vh] overflow-auto bg-gray-900 p-4">
                  {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-white">Loading logs...</div>
                    </div>
                  ) : error ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-red-400">{error}</div>
                    </div>
                  ) : (
                    <pre className="font-mono text-sm text-gray-300">
                      {logs.join('\n')}
                    </pre>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
