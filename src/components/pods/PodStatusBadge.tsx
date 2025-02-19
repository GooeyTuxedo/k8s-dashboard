export default function PodStatusBadge({ status }: { status: string }) {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Running':
        return 'badge-success'
      case 'Pending':
        return 'badge-warning'
      case 'Succeeded':
        return 'badge-info'
      case 'Failed':
        return 'badge-error'
      default:
        return 'bg-gray-800 text-gray-300'
    }
  }

  return (
    <span className={`${getStatusClass(status)}`}>
      {status}
    </span>
  )
}