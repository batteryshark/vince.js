'use client'

import React, { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

interface KeyRevealModalProps {
  isOpen: boolean
  onClose: () => void
  keyValue: string
  keyType: 'api-key' | 'service-key' | 'client-secret'
  action: 'created' | 'rotated'
  applicationName?: string
}

export default function KeyRevealModal({
  isOpen,
  onClose,
  keyValue,
  keyType,
  action,
  applicationName
}: KeyRevealModalProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(keyValue)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      alert('Failed to copy to clipboard')
    }
  }

  const getTitle = () => {
    const actionText = action === 'created' ? 'Created' : 'Rotated'
    switch (keyType) {
      case 'api-key':
        return `API Key ${actionText}${applicationName ? ` - ${applicationName}` : ''}`
      case 'service-key':
        return `Service API Key ${actionText}`
      case 'client-secret':
        return `Client Secret ${actionText}${applicationName ? ` - ${applicationName}` : ''}`
      default:
        return `Key ${actionText}`
    }
  }

  const getDescription = () => {
    switch (keyType) {
      case 'api-key':
        return 'Your new API key has been generated. Copy it now and store it securely.'
      case 'service-key':
        return 'Your service API key has been updated. Copy it now and update your application configuration.'
      case 'client-secret':
        return 'Your client secret has been regenerated. Copy it now and update your application configuration.'
      default:
        return 'Your new key has been generated. Copy it now and store it securely.'
    }
  }

  const getIcon = () => {
    switch (keyType) {
      case 'api-key':
        return (
          <svg style={{width: '24px', height: '24px', color: '#60a5fa'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        )
      case 'service-key':
        return (
          <svg style={{width: '24px', height: '24px', color: '#a78bfa'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        )
      case 'client-secret':
        return (
          <svg style={{width: '24px', height: '24px', color: '#fbbf24'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        )
      default:
        return (
          <svg style={{width: '24px', height: '24px', color: '#4ade80'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const handleClose = () => {
    setCopied(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={getTitle()}>
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div style={{width: '24px', height: '24px'}} className="flex-shrink-0">
            {getIcon()}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-100">
            {action === 'created' ? 'Key Created Successfully!' : 'Key Rotated Successfully!'}
          </h3>
          <p className="text-gray-300 text-sm">
            {getDescription()}
          </p>
        </div>

        <div className="bg-red-900 border border-red-400 rounded-lg p-3">
          <div className="flex items-start space-x-3">
            <svg className="mt-0.5 flex-shrink-0" style={{width: '16px', height: '16px', color: '#fca5a5'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="text-left">
              <p className="text-sm font-semibold text-red-100">Important Security Notice</p>
              <p className="text-sm text-red-200 mt-1 font-medium">
                This is the only time you'll be able to see this key. Please copy it now and store it securely. We cannot recover this key if lost.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <code className="bg-gray-800 border border-gray-600 px-3 py-2 rounded-md text-sm font-mono flex-1 select-all break-all text-white">
              {keyValue}
            </code>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={copyToClipboard}
            className="w-full"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 mr-2 text-green-400" style={{width: '16px', height: '16px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied to Clipboard!
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" style={{width: '16px', height: '16px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy to Clipboard
              </>
            )}
          </Button>
        </div>

        <div className="pt-3 border-t border-gray-600">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full"
          >
            I've Saved the Key Securely
          </Button>
        </div>
      </div>
    </Modal>
  )
}
