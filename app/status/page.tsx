'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SystemStatus {
  status: string;
  activeSessions: number;
  totalDevices: number;
  nftablesStatus: string;
  serverIp: string;
  timestamp: string;
}

export default function StatusPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading system status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-primary-500 text-white rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">📊 System Status</h1>
              <p className="mt-2">Chromecast Gateway Monitoring</p>
            </div>
            <Link href="/" className="btn bg-white bg-opacity-20 hover:bg-opacity-30 text-white">
              ← Dashboard
            </Link>
          </div>
        </div>

        {status ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* System Status */}
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Status</p>
                  <p className="text-2xl font-bold text-green-600 capitalize">{status.status}</p>
                </div>
                <div className="text-3xl">🟢</div>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                  <p className="text-2xl font-bold text-primary-500">{status.activeSessions}</p>
                </div>
                <div className="text-3xl">🔗</div>
              </div>
            </div>

            {/* Total Devices */}
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Devices</p>
                  <p className="text-2xl font-bold text-primary-500">{status.totalDevices}</p>
                </div>
                <div className="text-3xl">📱</div>
              </div>
            </div>

            {/* NFTables Status */}
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">NFTables Status</p>
                  <p className={`text-2xl font-bold ${
                    status.nftablesStatus === 'ok' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {status.nftablesStatus.toUpperCase()}
                  </p>
                </div>
                <div className="text-3xl">
                  {status.nftablesStatus === 'ok' ? '🛡️' : '⚠️'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Status Unavailable</h2>
            <p className="text-gray-600">Unable to fetch system status</p>
          </div>
        )}

        {/* Server Information */}
        {status && (
          <div className="card mt-8">
            <h2 className="text-2xl font-bold mb-4">Server Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Server IP</p>
                <p className="text-lg font-mono">{status.serverIp}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="text-lg">{new Date(status.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Network Configuration */}
        <div className="card mt-8">
          <h2 className="text-2xl font-bold mb-4">Network Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Mobile Network</p>
              <p className="text-lg font-mono">{process.env.NEXT_PUBLIC_MOBILE_NETWORK || '192.168.10.0/24'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Chromecast Network</p>
              <p className="text-lg font-mono">{process.env.NEXT_PUBLIC_CHROMECAST_NETWORK || '192.168.20.0/24'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
