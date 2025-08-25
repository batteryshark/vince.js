'use client'

import React, { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import ServiceKeyModal from './ServiceKeyModal'
import KeyRevealModal from './KeyRevealModal'

export default function ServiceKeyManager() {
  const [serviceKey, setServiceKey] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false)
  const [newlyRotatedKey, setNewlyRotatedKey] = useState<string>('')

  useEffect(() => {
    fetchServiceKey()
  }, [])

  const fetchServiceKey = async () => {
    try {
      const response = await fetch('/api/admin/service-key')
      const data = await response.json()
      
      if (response.ok) {
        setServiceKey(data.serviceKey)
      } else {
        console.error('Failed to fetch service key:', data.error)
      }
    } catch (error) {
      console.error('Error fetching service key:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyRotated = (newKey: string) => {
    setServiceKey(newKey)
    setNewlyRotatedKey(newKey)
    setIsModalOpen(false)
    setIsRevealModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-3">
            <svg className="animate-spin w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-blue-700 font-medium">Loading service key...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 rounded-lg p-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Service API Key</h3>
              <p className="text-sm text-blue-700">
                Used for validating API keys via the validation endpoint
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            size="sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Manage Service Key
          </Button>
        </div>
      </div>

      <ServiceKeyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceKey={serviceKey}
        onKeyRotated={handleKeyRotated}
      />

      <KeyRevealModal
        isOpen={isRevealModalOpen}
        onClose={() => setIsRevealModalOpen(false)}
        keyValue={newlyRotatedKey}
        keyType="service-key"
        action="rotated"
      />
    </>
  )
}
