'use client'

import React, { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Application } from '@/types/api'

interface ClientSecretModalProps {
  isOpen: boolean
  onClose: () => void
  application: Application
  onSecretRotated: (newSecret: string) => void
}

export default function ClientSecretModal({
  isOpen,
  onClose,
  application,
  onSecretRotated
}: ClientSecretModalProps) {
  const [isRevealed, setIsRevealed] = useState(false)
  const [isRotating, setIsRotating] = useState(false)

  const maskSecret = (secret: string) => {
    if (secret.length <= 8) return '••••••••'
    return secret.substring(0, 8) + '••••••••••••••••••••••••••••••••'
  }

  const toggleSecretVisibility = () => {
    setIsRevealed(!isRevealed)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(application.clientSecret)
      alert('Client secret copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      alert('Failed to copy to clipboard')
    }
  }

  const handleRotateSecret = async () => {
    if (!confirm('Are you sure you want to regenerate the client secret? This will invalidate the current secret and may break existing integrations.')) {
      return
    }

    setIsRotating(true)
    
    try {
      const response = await fetch(`/api/admin/applications/${application.id}/regenerate-secret`, {
        method: 'POST'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to regenerate client secret')
      }

      onSecretRotated(data.clientSecret)
      setIsRevealed(true) // Show the new secret
      
      alert('Client secret regenerated successfully!')
      
    } catch (error) {
      console.error('Error regenerating client secret:', error)
      alert('Failed to regenerate client secret. Please try again.')
    } finally {
      setIsRotating(false)
    }
  }

  const handleClose = () => {
    setIsRevealed(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Manage Client Secret - ${application.name}`}>
      <div className="space-y-6">
        <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4 relative">
          <p className="text-sm text-yellow-100 mb-3 font-medium">
            Required for API key validation through the validation endpoint
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <code className="bg-gray-800 border border-gray-600 px-3 py-2 rounded-md text-sm font-mono flex-1 select-all text-white">
                {isRevealed ? application.clientSecret : maskSecret(application.clientSecret)}
              </code>
              
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSecretVisibility}
              >
                {isRevealed ? (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L8.464 8.464m5.656 5.656l1.415 1.415m-1.415-1.415l1.415 1.415" />
                    </svg>
                    Hide
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Show
                  </>
                )}
              </Button>
              
              {isRevealed && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </Button>
              )}
            </div>

            <div className="border-t border-gray-600 pt-4">
              <Button
                variant="danger"
                size="sm"
                onClick={handleRotateSecret}
                disabled={isRotating}
                className="text-xs px-4 py-2"
              >
                {isRotating ? (
                  <>
                    <svg className="animate-spin w-3 h-3 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Regenerating...
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Regenerate Secret
                  </>
                )}
              </Button>
              
              <p className="text-xs text-gray-300 mt-2 text-center font-medium">
                ⚠️ Regenerating will invalidate the current secret immediately
              </p>
            </div>
          </div>
        </div>

        <div className="text-sm text-yellow-100 bg-yellow-900 border border-yellow-600 rounded-lg p-3 relative">
          <p className="font-semibold text-yellow-100 mb-1">Usage Instructions:</p>
          <p className="text-yellow-200">Include this client secret along with your API key when validating through the <code className="bg-yellow-800 px-1 rounded text-yellow-100">/api/validate</code> endpoint. This ensures API keys can only be used by the intended application.</p>
        </div>
      </div>
    </Modal>
  )
}
