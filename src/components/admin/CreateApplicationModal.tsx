'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Application } from '@/types/api'

interface CreateApplicationModalProps {
  isOpen: boolean
  onClose: () => void
  onApplicationCreated: (application: Application) => void
}

export default function CreateApplicationModal({
  isOpen,
  onClose,
  onApplicationCreated
}: CreateApplicationModalProps) {
  const [name, setName] = useState('')
  const [prefixLabel, setPrefixLabel] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !prefixLabel.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          prefixLabel: prefixLabel.trim(),
          defaultTemplate: {}
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create application')
      }

      onApplicationCreated(data.application)
      setName('')
      setPrefixLabel('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create application')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setName('')
    setPrefixLabel('')
    setError('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Application">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-900 border border-red-400 text-red-100 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
            Application Name
          </label>
          <Input
            type="text"
            placeholder="Enter application name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            required
            className="w-full"
          />
          <p className="mt-1 text-sm text-gray-400">
            Internal name for this application (stored in database)
          </p>
        </div>

        <div>
          <label htmlFor="prefixLabel" className="block text-sm font-medium text-gray-200 mb-2">
            Key Prefix Label
          </label>
          <Input
            type="text"
            placeholder="e.g., myapp, test, api"
            value={prefixLabel}
            onChange={(e) => setPrefixLabel(e.target.value)}
            disabled={isLoading}
            required
            className="w-full"
          />
          <p className="mt-1 text-sm text-gray-400">
            Custom label for API keys (e.g., "sk-proj-abc12345-myapp-...")
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !name.trim() || !prefixLabel.trim()}
          >
            {isLoading ? 'Creating...' : 'Create Application'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}