'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

// Beautiful Icons
const TvIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const WifiIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
  </svg>
);

const QrCodeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ActivityIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const LinkIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

interface Device {
  _id: string;
  room: string;
  deviceName: string;
  ipAddress: string;
  macAddress?: string;
  createdAt: string;
  status: 'active' | 'inactive';
  isOnline?: boolean;
}

interface Session {
  _id: string;
  id: string;
  room: string;
  mobileIp: string;
  chromecastIp: string;
  createdAt: string;
  expiresAt: string;
  active: boolean;
}

interface Log {
  _id: string;
  timestamp: string;
  level: string;
  message: string;
  sessionId?: string;
  ipAddress?: string;
}

interface SystemStatus {
  status: string;
  activeSessions: number;
  totalDevices: number;
  nftablesStatus: string;
  serverIp: string;
  timestamp: string;
}

export default function HomePage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [devicesRes, sessionsRes, logsRes, statusRes] = await Promise.all([
        fetch('/api/devices'),
        fetch('/api/sessions'),
        fetch('/api/logs?limit=10'),
        fetch('/api/status'),
      ]);

      if (devicesRes.ok) {
        const devicesData = await devicesRes.json();
        
        // Check connectivity for each device
        const devicesWithConnectivity = await Promise.all(
          (devicesData.devices || []).map(async (device: any) => {
            try {
              const response = await fetch(`/api/devices/${device.room}/ping`, {
                method: 'POST',
              });
              const pingResult = await response.json();
              return {
                ...device,
                isOnline: pingResult.online || false,
              };
            } catch (error) {
              return {
                ...device,
                isOnline: false,
              };
            }
          })
        );
        
        setDevices(devicesWithConnectivity);
      }

      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        setSessions(sessionsData.sessions || []);
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData.logs || []);
      }

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setSystemStatus(statusData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const endSession = async (sessionId: string) => {
    if (!confirm('End this session?')) return;

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchData(); // Refresh data
      } else {
        const error = await response.json();
        alert(`Failed to end session: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to end session:', error);
      alert('Failed to end session');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-95"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="floating text-white">
              <TvIcon />
            </div>
            <h1 className="mt-6 text-5xl font-bold text-white drop-shadow-lg">
              Chromecast Gateway
            </h1>
            <p className="mt-4 text-xl text-white drop-shadow-md max-w-2xl mx-auto">
              Beautiful, secure room-based network isolation for your Chromecast devices
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/admin" className="btn btn-success shadow-2xl">
                <SettingsIcon />
                <span className="ml-2">Admin Panel</span>
              </Link>
              <Link href="/status" className="btn btn-secondary shadow-2xl">
                <ActivityIcon />
                <span className="ml-2">System Status</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card-gradient text-center group hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TvIcon />
            </div>
            <div className="text-4xl font-bold gradient-text mb-2">{devices.length}</div>
            <div className="text-secondary-600 font-medium">Total Devices</div>
          </div>
          
          <div className="card-gradient text-center group hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LinkIcon />
            </div>
            <div className="text-4xl font-bold gradient-text mb-2">{sessions.length}</div>
            <div className="text-secondary-600 font-medium">Active Sessions</div>
          </div>
          
          <div className="card-gradient text-center group hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <WifiIcon />
            </div>
            <div className="text-4xl font-bold gradient-text mb-2">
              {systemStatus ? '🟢' : '🔴'}
            </div>
            <div className="text-secondary-600 font-medium">System Status</div>
          </div>
        </div>

        {/* Devices */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold gradient-text">Smart Devices</h2>
            <Link href="/admin" className="btn btn-ghost">
              <SettingsIcon />
              <span className="ml-2">Manage</span>
            </Link>
          </div>
          
          {devices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {devices.map((device) => (
                <div key={device._id} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-secondary-200/50 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                        <TvIcon />
                      </div>
                      <div className={device.isOnline ? 'status-online' : 'status-offline'}>
                        <div className={`status-dot ${device.isOnline ? 'status-dot-online' : 'status-dot-offline'}`}></div>
                        {device.isOnline ? 'Online' : 'Offline'}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-secondary-900 mb-2">Room {device.room}</h3>
                    <p className="font-semibold text-secondary-700 mb-4">{device.deviceName}</p>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-secondary-600">
                        <WifiIcon />
                        <span className="ml-2 font-mono">{device.ipAddress}</span>
                      </div>
                      {device.macAddress && (
                        <div className="text-sm text-secondary-500 font-mono">
                          {device.macAddress}
                        </div>
                      )}
                    </div>
                    
                    <Link
                      href={`/qr/${device.room}`}
                      className="btn btn-primary w-full group-hover:shadow-lg transition-all duration-300"
                    >
                      <QrCodeIcon />
                      <span className="ml-2">Show QR Code</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-secondary-200 to-secondary-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <TvIcon />
              </div>
              <h3 className="text-xl font-semibold text-secondary-700 mb-2">No devices configured</h3>
              <p className="text-secondary-500 mb-6">Add your first Chromecast device to get started</p>
              <Link href="/admin" className="btn btn-primary">
                <SettingsIcon />
                <span className="ml-2">Add Device</span>
              </Link>
            </div>
          )}
        </div>

        {/* Active Sessions */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold gradient-text">Active Sessions</h2>
            <div className="flex items-center text-success-600">
              <div className="status-dot status-dot-online"></div>
              <span className="font-semibold">{sessions.length} Active</span>
            </div>
          </div>
          
          {sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session._id} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-500/10 to-primary-500/10 rounded-2xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                  <div className="relative bg-gradient-to-r from-white/95 to-secondary-50/90 backdrop-blur-sm rounded-2xl p-6 border border-secondary-200/50 hover:shadow-xl transition-all duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center mr-4">
                            <LinkIcon />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-secondary-900">Room {session.room}</h3>
                            <p className="text-sm text-secondary-600">Connected Session</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
                            <span className="font-mono text-secondary-600">{session.mobileIp}</span>
                            <span className="mx-2 text-secondary-400">→</span>
                            <span className="font-mono text-secondary-600">{session.chromecastIp}</span>
                          </div>
                          <div className="flex items-center text-sm text-secondary-600">
                            <StarIcon />
                            <span className="ml-2">Expires: {formatDate(new Date(session.expiresAt))}</span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => endSession(session.id)}
                        className="btn btn-danger group-hover:shadow-lg transition-all duration-300"
                      >
                        End Session
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-secondary-200 to-secondary-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <LinkIcon />
              </div>
              <h3 className="text-xl font-semibold text-secondary-700 mb-2">No active sessions</h3>
              <p className="text-secondary-500">Connect your mobile device to start casting</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold gradient-text">Recent Activity</h2>
            <div className="flex items-center text-primary-600">
              <ActivityIcon />
              <span className="ml-2 font-semibold">Live Logs</span>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto space-y-3">
            {logs.length > 0 ? (
              logs.map((log) => (
                <div
                  key={log._id}
                  className={`p-4 rounded-xl border-l-4 ${
                    log.level === 'INFO' ? 'log-info' :
                    log.level === 'WARNING' ? 'log-warning' : 'log-error'
                  } hover:shadow-md transition-all duration-200`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          log.level === 'INFO' ? 'bg-primary-100 text-primary-800' :
                          log.level === 'WARNING' ? 'bg-warning-100 text-warning-800' : 
                          'bg-danger-100 text-danger-800'
                        }`}>
                          {log.level}
                        </span>
                        <span className="ml-3 text-xs text-secondary-500 font-mono">
                          {formatDate(new Date(log.timestamp))}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-secondary-900">{log.message}</p>
                      {log.ipAddress && (
                        <p className="text-xs text-secondary-500 mt-1">IP: {log.ipAddress}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-secondary-200 to-secondary-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <ActivityIcon />
                </div>
                <h3 className="text-xl font-semibold text-secondary-700 mb-2">No recent activity</h3>
                <p className="text-secondary-500">Activity logs will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
