'use client'

import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import type { Pod } from '@/types/kubernetes'
import PodLogs from './PodLogs'

interface PodDetailsModalProps {
  pod: Pod | null
  isOpen: boolean
  onClose: () => void
}

export default function PodDetailsModal({ pod, isOpen, onClose }: PodDetailsModalProps) {
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  if (!pod) return null

  const getContainerStatus = (container: string) => {
    const status = pod.status.containerStatuses?.find(
      status => status.name === container
    )
    return status
  }

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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-dark-bg-secondary border border-dark-border p-6 text-left shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-dark-text-primary">
                    Pod Details: {pod.metadata.name}
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

                <div className="mt-4 space-y-6">
                  {/* Basic Information */}
                  <section className="rounded-lg bg-dark-bg-tertiary p-4">
                    <h4 className="text-sm font-medium text-dark-text-tertiary">Basic Information</h4>
                    <dl className="mt-2 grid grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-dark-text-tertiary">Namespace</dt>
                        <dd className="mt-1 text-sm text-dark-text-secondary">{pod.metadata.namespace}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-dark-text-tertiary">Node</dt>
                        <dd className="mt-1 text-sm text-dark-text-secondary">{pod.spec.nodeName}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-dark-text-tertiary">Pod IP</dt>
                        <dd className="mt-1 text-sm text-dark-text-secondary">{pod.status.podIP}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-dark-text-tertiary">Host IP</dt>
                        <dd className="mt-1 text-sm text-dark-text-secondary">{pod.status.hostIP}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-dark-text-tertiary">Created</dt>
                        <dd className="mt-1 text-sm text-dark-text-secondary">
                          {new Date(pod.metadata.creationTimestamp).toLocaleString()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-dark-text-tertiary">Status</dt>
                        <dd className="mt-1 text-sm text-dark-text-secondary">{pod.status.phase}</dd>
                      </div>
                    </dl>
                  </section>

                  {/* Containers */}
                  <section>
                    <h4 className="mb-4 text-sm font-medium text-dark-text-tertiary">Containers</h4>
                    <div className="space-y-4">
                      {pod.spec.containers.map(container => {
                        const status = getContainerStatus(container.name)
                        return (
                          <div key={container.name} className="rounded-lg border border-dark-border bg-dark-bg-tertiary p-4">
                            <div className="flex items-center justify-between">
                              <h5 className="text-sm font-medium text-dark-text-secondary">{container.name}</h5>
                              <div className="flex items-center space-x-2">
                                <span 
                                  className={status?.ready ? 'badge-success' : 'badge-warning'}
                                >
                                  {status?.ready ? 'Ready' : 'Not Ready'}
                                </span>
                                <button
                                  onClick={() => {
                                    setSelectedContainer(container.name)
                                    setShowLogs(true)
                                  }}
                                  className="rounded-md bg-dark-accent-blue bg-opacity-20 px-2 py-1 text-xs font-medium text-dark-accent-blue hover:bg-opacity-30"
                                >
                                  View Logs
                                </button>
                              </div>
                            </div>

                            <dl className="mt-4 grid grid-cols-2 gap-4">
                              <div>
                                <dt className="text-sm font-medium text-dark-text-tertiary">Image</dt>
                                <dd className="mt-1 text-sm text-dark-text-secondary">{container.image}</dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-dark-text-tertiary">Restarts</dt>
                                <dd className="mt-1 text-sm text-dark-text-secondary">{status?.restartCount || 0}</dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-dark-text-tertiary">State</dt>
                                <dd className="mt-1 text-sm text-dark-text-secondary">
                                  {Object.keys(status?.state || {})[0] || 'Unknown'}
                                </dd>
                              </div>
                              {container.resources.requests && (
                                <>
                                  <div>
                                    <dt className="text-sm font-medium text-dark-text-tertiary">CPU Request</dt>
                                    <dd className="mt-1 text-sm text-dark-text-secondary">
                                      {container.resources.requests.cpu || 'None'}
                                    </dd>
                                  </div>
                                  <div>
                                    <dt className="text-sm font-medium text-dark-text-tertiary">Memory Request</dt>
                                    <dd className="mt-1 text-sm text-dark-text-secondary">
                                      {container.resources.requests.memory || 'None'}
                                    </dd>
                                  </div>
                                </>
                              )}
                            </dl>
                          </div>
                        )
                      })}
                    </div>
                  </section>

                  {/* Labels */}
                  {Object.keys(pod.metadata.labels || {}).length > 0 && (
                    <section>
                      <h4 className="mb-2 text-sm font-medium text-gray-500">Labels</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(pod.metadata.labels || {}).map(([key, value]) => (
                          <span 
                            key={key}
                            className="inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-sm font-medium text-blue-800"
                          >
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>

      {/* Logs Modal */}
      {selectedContainer && (
        <PodLogs
          isOpen={showLogs}
          onClose={() => setShowLogs(false)}
          podName={pod.metadata.name}
          namespace={pod.metadata.namespace}
          containerName={selectedContainer}
        />
      )}
    </Transition>
  )
}
