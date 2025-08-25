'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ApplicationList from '@/components/admin/ApplicationList';
import KeyManager from '@/components/admin/KeyManager';
import ServiceKeyManager from '@/components/admin/ServiceKeyManager';
import Button from '@/components/ui/Button';
import { Application } from '@/types/api';

export default function AdminPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/applications');
      const data = await response.json();
      
      if (response.ok) {
        setApplications(data.applications || []);
      } else {
        console.error('Failed to fetch applications:', data.error);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSelectApplication = (application: Application) => {
    setSelectedApplication(application);
  };

  const handleBackToApplications = () => {
    setSelectedApplication(null);
    // Refresh applications list to get updated key counts
    fetchApplications();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              vince.js API Key Service - Admin Panel
            </h1>
            <Button variant="danger" onClick={handleLogout}>
              Logout
            </Button>
          </div>
          
          {/* Service API Key Management */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 mb-6">
            <ServiceKeyManager />
          </div>

          {/* Applications Management */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
            {selectedApplication ? (
              <KeyManager
                application={selectedApplication}
                onBack={handleBackToApplications}
              />
            ) : (
              <ApplicationList
                applications={applications}
                onApplicationsChange={setApplications}
                onSelectApplication={handleSelectApplication}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}