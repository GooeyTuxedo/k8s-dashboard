'use client'

import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import type { Pod } from '@/types/kubernetes'

interface PodDetailsModalProps {
  pod: Pod | null
  isOpen: boolean
  onClose: () => void
}

export default function PodDetailsModal({ pod, isOpen, onClose }: PodDetailsModalProps) {
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
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
                  <section className="rounded-lg bg-gray-50 p-4">
                    <h4 className="text-sm font-medium text-gray-500">Basic Information</h4>
                    <dl className="mt-2 grid grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Namespace</dt>
                        <dd className="mt-1 text-sm text-gray-900">{pod.metadata.namespace}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Node</dt>
                        <dd className="mt-1 text-sm text-gray-900">{pod.spec.nodeName}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Pod IP</dt>
                        <dd className="mt-1 text-sm text-gray-900">{pod.status.podIP}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Host IP</dt>
                        <dd className="mt-1 text-sm text-gray-900">{pod.status.hostIP}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Created</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {new Date(pod.metadata.creationTimestamp).toLocaleString()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                        <dd className="mt-1 text-sm text-gray-900">{pod.status.phase}</dd>
                      </div>
                    </dl>
                  </section>

                  {/* Containers */}
                  <section>
                    <h4 className="mb-4 text-sm font-medium text-gray-500">Containers</h4>
                    <div className="space-y-4">
                      {pod.spec.containers.map(container => {
                        const status = getContainerStatus(container.name)
                        return (
                          <div key={container.name} className="rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                              <h5 className="text-sm font-medium">{container.name}</h5>
                              <span 
                                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                  status?.ready ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {status?.ready ? 'Ready' : 'Not Ready'}
                              </span>
                            </div>

                            <dl className="mt-4 grid grid-cols-2 gap-4">
                              <div>
                                <dt className="text-sm font-medium text-gray-500">Image</dt>
                                <dd className="mt-1 text-sm text-gray-900">{container.image}</dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-gray-500">Restarts</dt>
                                <dd className="mt-1 text-sm text-gray-900">{status?.restartCount || 0}</dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-gray-500">State</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                  {Object.keys(status?.state || {})[0] || 'Unknown'}
                                </dd>
                              </div>
                              {container.resources.requests && (
                                <>
                                  <div>
                                    <dt className="text-sm font-medium text-gray-500">CPU Request</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                      {container.resources.requests.cpu || 'None'}
                                    </dd>
                                  </div>
                                  <div>
                                    <dt className="text-sm font-medium text-gray-500">Memory Request</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
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
    </Transition>
  )
}
