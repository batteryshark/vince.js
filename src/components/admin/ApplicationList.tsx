'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import CreateApplicationModal from './CreateApplicationModal'
import { Application } from '@/types/api'

interface ApplicationListProps {
  applications: Application[]
  onApplicationsChange: (applications: Application[]) => void
  onSelectApplication: (application: Application) => void
}

export default function ApplicationList({
  applications,
  onApplicationsChange,
  onSelectApplication
}: ApplicationListProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleApplicationCreated = (newApplication: Application) => {
    onApplicationsChange([newApplication, ...applications])
  }

  const handleDeleteApplication = async (applicationId: string, applicationName: string) => {
    if (!confirm(`Are you sure you want to delete "${applicationName}"? This will revoke all associated API keys.`)) {
      return
    }

    setDeletingId(applicationId)

    try {
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete application')
      }

      // Remove the application from the list
      onApplicationsChange(applications.filter(app => app.id !== applicationId))
    } catch (error) {
      console.error('Error deleting application:', error)
      alert('Failed to delete application. Please try again.')
    } finally {
      setDeletingId(null)
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Applications</h2>
          <p className="text-gray-600">Manage your applications and their API keys</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          Create Application
        </Button>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📱</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
          <p className="text-gray-600 mb-4">Create your first application to start managing API keys</p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Create Your First Application
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((application) => (
            <div key={application.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-2.5">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <button
                        onClick={() => onSelectApplication(application)}
                        className="font-semibold text-gray-900 hover:text-blue-600 text-left transition-colors duration-150 truncate block w-full"
                      >
                        {application.name}
                      </button>
                      <p className="text-sm text-gray-500 mt-1">
                        Prefix: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{application.keyPrefix.replace('-', '')}</code>
                      </p>
                    </div>
                  </div>
                  
                  {/* Action buttons in top right */}
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="primary"
                      onClick={() => onSelectApplication(application)}
                      size="sm"
                      className="text-xs px-3 py-1.5 w-auto"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
                      </svg>
                      Manage Keys
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDeleteApplication(application.id, application.name)}
                      disabled={deletingId === application.id}
                      size="sm"
                      className="px-2 py-1.5 text-xs w-auto"
                    >
                      {deletingId === application.id ? (
                        <>
                          <svg className="animate-spin w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">API Keys</span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {application.keyCount || 0} keys
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Created</span>
                    <span className="text-sm text-gray-600">
                      {formatDate(application.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateApplicationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onApplicationCreated={handleApplicationCreated}
      />
    </div>
  )
}
