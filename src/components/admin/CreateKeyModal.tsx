'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { ApiKey, Application } from '@/types/api'

interface CreateKeyModalProps {
  isOpen: boolean
  onClose: () => void
  application: Application
  onKeyCreated: (key: ApiKey) => void
}

export default function CreateKeyModal({
  isOpen,
  onClose,
  application,
  onKeyCreated
}: CreateKeyModalProps) {
  const [metadata, setMetadata] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/applications/${application.id}/keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata: metadata.trim() || null
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create API key')
      }

      onKeyCreated(data.key)
      setMetadata('')
      // Don't close here - parent will handle closing and showing reveal modal
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setMetadata('')
    setError('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Create API Key for ${application.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-900 border border-red-400 text-red-100 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <div>
          <label htmlFor="metadata" className="block text-sm font-medium text-gray-200 mb-2">
            Metadata (Optional)
          </label>
          <Input
            type="text"
            placeholder="e.g., user@example.com or user identifier"
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
          <p className="mt-1 text-sm text-gray-400">
            Optional metadata to associate with this API key (e.g., username, email, or description)
          </p>
        </div>

        <div className="bg-gray-800 p-3 rounded">
          <p className="text-sm text-gray-200">
            <strong>Key prefix:</strong> <code className="bg-gray-700 px-1 rounded text-white">{application.keyPrefix}</code>
          </p>
          <p className="text-sm text-gray-400 mt-1">
            A unique random suffix will be generated automatically
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
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create API Key'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}