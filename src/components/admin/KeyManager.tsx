'use client'

import React, { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import CreateKeyModal from './CreateKeyModal'
import ClientSecretModal from './ClientSecretModal'
import KeyRevealModal from './KeyRevealModal'
import { ApiKey, Application } from '@/types/api'

interface KeyManagerProps {
  application: Application
  onBack: () => void
}

export default function KeyManager({ application, onBack }: KeyManagerProps) {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isClientSecretModalOpen, setIsClientSecretModalOpen] = useState(false)
  const [isKeyRevealModalOpen, setIsKeyRevealModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState<{ [keyId: string]: 'rotating' | 'revoking' }>({})
  const [revealModalData, setRevealModalData] = useState<{
    keyValue: string
    keyType: 'api-key' | 'client-secret'
    action: 'created' | 'rotated'
  } | null>(null)

  useEffect(() => {
    fetchKeys()
  }, [application.id])

  const fetchKeys = async () => {
    try {
      const response = await fetch(`/api/admin/applications/${application.id}/keys`)
      const data = await response.json()
      
      if (response.ok) {
        setKeys(data.keys || [])
      } else {
        console.error('Failed to fetch keys:', data.error)
      }
    } catch (error) {
      console.error('Error fetching keys:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyCreated = (newKey: ApiKey) => {
    setKeys([newKey, ...keys])
    setIsCreateModalOpen(false)
    // Show the new key in reveal modal
    setRevealModalData({
      keyValue: newKey.keyValue,
      keyType: 'api-key',
      action: 'created'
    })
    setIsKeyRevealModalOpen(true)
  }

  const maskKey = (key: string) => {
    if (key.length <= 8) return '••••••••'
    return key.substring(0, 8) + '••••••••••••••••••••••••••••••••'
  }

  const handleClientSecretRotated = (newSecret: string) => {
    application.clientSecret = newSecret
    setIsClientSecretModalOpen(false)
    // Show the new secret in reveal modal
    setRevealModalData({
      keyValue: newSecret,
      keyType: 'client-secret',
      action: 'rotated'
    })
    setIsKeyRevealModalOpen(true)
  }

  const handleRotateKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to rotate this API key? The old key will be invalidated immediately.')) {
      return
    }

    setActionLoading(prev => ({ ...prev, [keyId]: 'rotating' }))

    try {
      const response = await fetch(`/api/admin/keys/${keyId}/rotate`, {
        method: 'PUT',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to rotate key')
      }

      // Update the key in the list
      setKeys(prev => prev.map(key => 
        key.id === keyId ? data.key : key
      ))

      // Show the rotated key in reveal modal
      setRevealModalData({
        keyValue: data.key.keyValue,
        keyType: 'api-key',
        action: 'rotated'
      })
      setIsKeyRevealModalOpen(true)
    } catch (error) {
      console.error('Error rotating key:', error)
      alert('Failed to rotate API key. Please try again.')
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev }
        delete newState[keyId]
        return newState
      })
    }
  }

  const handleRevokeKey = async (keyId: string, metadata: string | null) => {
    const keyDescription = metadata ? `key for "${metadata}"` : 'this API key'
    if (!confirm(`Are you sure you want to revoke ${keyDescription}? This action cannot be undone.`)) {
      return
    }

    setActionLoading(prev => ({ ...prev, [keyId]: 'revoking' }))

    try {
      const response = await fetch(`/api/admin/keys/${keyId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to revoke key')
      }

      // Remove the key from the list
      setKeys(prev => prev.filter(key => key.id !== keyId))
      
      alert('API key revoked successfully!')
    } catch (error) {
      console.error('Error revoking key:', error)
      alert('Failed to revoke API key. Please try again.')
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev }
        delete newState[keyId]
        return newState
      })
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading API keys...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={onBack} 
            size="sm"
            className="text-xs px-3 py-2 w-auto"
          >
            <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Applications
          </Button>
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-2">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{application.name}</h2>
              <p className="text-sm text-gray-500">
                Prefix: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{application.keyPrefix.replace('-', '')}</code>
              </p>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={() => setIsClientSecretModalOpen(true)}
            size="sm"
            className="text-xs px-3 py-2 w-auto"
          >
            <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Manage Client Secret
          </Button>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            size="sm" 
            className="text-xs px-3 py-2 w-auto"
          >
            <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Generate New Key
          </Button>
        </div>
      </div>

      {keys.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔑</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No API keys yet</h3>
          <p className="text-gray-600 mb-4">Generate your first API key for this application</p>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            size="sm"
            className="text-xs px-4 py-2 w-auto"
          >
            Generate First API Key
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {keys.map((key) => (
            <div key={key.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <code className="bg-gray-100 px-2 py-1 rounded-md text-xs font-mono break-all">
                          {maskKey(key.keyValue)}
                        </code>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {key.metadata ? key.metadata : 'No metadata'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Created</span>
                    <span className="text-sm text-gray-600">
                      {formatDate(key.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    onClick={() => handleRotateKey(key.id)}
                    disabled={!!actionLoading[key.id]}
                    size="sm"
                    className="text-xs px-2 py-1 w-auto"
                  >
                    {actionLoading[key.id] === 'rotating' ? (
                      <>
                        <svg className="animate-spin w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Rotating...
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Rotate
                      </>
                    )}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleRevokeKey(key.id, key.metadata)}
                    disabled={!!actionLoading[key.id]}
                    size="sm"
                    className="text-xs px-2 py-1 w-auto"
                  >
                    {actionLoading[key.id] === 'revoking' ? (
                      <>
                        <svg className="animate-spin w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Revoking...
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Revoke
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateKeyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        application={application}
        onKeyCreated={handleKeyCreated}
      />

      <ClientSecretModal
        isOpen={isClientSecretModalOpen}
        onClose={() => setIsClientSecretModalOpen(false)}
        application={application}
        onSecretRotated={handleClientSecretRotated}
      />

      {revealModalData && (
        <KeyRevealModal
          isOpen={isKeyRevealModalOpen}
          onClose={() => {
            setIsKeyRevealModalOpen(false)
            setRevealModalData(null)
          }}
          keyValue={revealModalData.keyValue}
          keyType={revealModalData.keyType}
          action={revealModalData.action}
          applicationName={application.name}
        />
      )}
    </div>
  )
}