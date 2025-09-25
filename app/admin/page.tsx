'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { log } from 'console';

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

interface Log {
  _id: string;
  timestamp: string;
  level: string;
  message: string;
  sessionId?: string;
  ipAddress?: string;
}

interface AdminStats {
  totalDevices: number;
  activeSessions: number;
  totalSessions: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [stats, setStats] = useState<AdminStats>({ totalDevices: 0, activeSessions: 0, totalSessions: 0 });
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [formData, setFormData] = useState({
    room: '',
    name: '',
    ip: '',
    mac: '',
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchData();
      const interval = setInterval(fetchData, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [authenticated]);

  const checkAuth = () => {
    const token = localStorage.getItem('admin-token');
    if (token) {
      setAuthenticated(true);
    } else {
      router.push('/admin/login');
    }
  };

  const fetchData = async () => {
    try {
      const [devicesRes, logsRes, statusRes] = await Promise.all([
        fetch('/api/devices'),
        fetch('/api/logs?limit=20'),
        fetch('/api/status'),
      ]);

      if (devicesRes.ok) {
        const devicesData = await devicesRes.json();
        console.log("devicesData", devicesData);
        
        // Check connectivity for each device
        const devicesWithConnectivity = await Promise.all(
          (devicesData.devices || []).map(async (device: any) => {
            try {
              // Simple connectivity check - in production you'd use a proper ping
              const response = await fetch(`/api/devices/${device.room}/ping`, {
                method: 'POST',
              });
              const pingResult = await response.json();
              console.log("pingResult", pingResult);
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

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData.logs || []);
      }

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setStats({
          totalDevices: statusData.totalDevices,
          activeSessions: statusData.activeSessions,
          totalSessions: 0, // We'd need a separate endpoint for this
        });
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room: formData.room,
          deviceName: formData.name,
          ipAddress: formData.ip,
          macAddress: formData.mac,
        }),
      });

      if (response.ok) {
        setFormData({ room: '', name: '', ip: '', mac: '' });
        await fetchData();
      } else {
        const error = await response.json();
        alert(`Failed to add device: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to add device');
    }
  };

  const removeDevice = async (room: string) => {
    if (!confirm(`Remove device ${room}?`)) return;

    try {
      const response = await fetch(`/api/devices/${room}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchData();
      } else {
        const error = await response.json();
        alert(`Failed to remove device: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to remove device');
    }
  };

  const logout = () => {
    localStorage.removeItem('admin-token');
    router.push('/');
  };

  if (!authenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-admin-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl p-8 mb-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-lg">⚙️ Admin Panel</h1>
              <p className="mt-3 text-white/90 text-lg">Chromecast Gateway Management</p>
            </div>
            <div className="mt-4 sm:mt-0 space-x-2">
              <Link href="/" className="btn bg-white bg-opacity-20 hover:bg-opacity-30 text-white">
                ← Dashboard
              </Link>
              <button onClick={logout} className="btn btn-danger">
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card text-center">
            <div className="text-4xl font-bold text-admin-500">{stats.totalDevices}</div>
            <div className="text-gray-600">Total Devices</div>
          </div>
          <div className="card text-center">
            <div className="text-4xl font-bold text-admin-500">{stats.activeSessions}</div>
            <div className="text-gray-600">Active Sessions</div>
          </div>
          <div className="card text-center">
            <div className="text-4xl font-bold text-admin-500">{stats.totalSessions}</div>
            <div className="text-gray-600">Total Sessions</div>
          </div>
        </div>

        {/* Add Device Form */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-6">➕ Add/Update Device</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room ID:
              </label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="e.g., living-room"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Device Name:
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Living Room TV"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IP Address (192.168.20.x network):
              </label>
              <input
                type="text"
                value={formData.ip}
                onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                placeholder="e.g., 192.168.20.100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                MAC Address (optional):
              </label>
              <input
                type="text"
                value={formData.mac}
                onChange={(e) => setFormData({ ...formData, mac: e.target.value })}
                placeholder="e.g., AA:BB:CC:DD:EE:FF"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4">
              <button type="submit" className="btn btn-success">
                Add/Update Device
              </button>
            </div>
          </form>
        </div>

        {/* Configured Devices */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-6">📱 Configured Devices</h2>
          {devices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {devices.map((device) => (
                <div key={device._id} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold">Room {device.room}</h3>
                  <p className="font-medium">{device.deviceName}</p>
                  <p className="text-sm text-gray-600">IP: {device.ipAddress}</p>
                  <p className="text-sm text-gray-600">MAC: {device.macAddress || 'N/A'}</p>
                  <p className="text-sm text-gray-600">
                    
                    
                      Status:{' '}
                      <span className={device.isOnline ? 'status-online' : 'status-offline'}>
                        ● {device.isOnline ? 'Online' : 'Offline'}
                      </span>
                      <br />
                      <span className="text-xs text-gray-500">
                        Config: {device.status === 'active' ? 'Enabled' : 'Disabled'}
                      </span>
                  </p>
                  <p className="text-sm text-gray-600">Added: {new Date(device.createdAt).toLocaleDateString()}</p>
                  <div className="mt-3 space-x-2">
                    <Link href={`/qr/${device.room}`} className="btn btn-primary text-sm">
                      Show QR
                    </Link>
                    <button
                      onClick={() => removeDevice(device.room)}
                      className="btn btn-danger text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No devices configured yet.</p>
          )}
        </div>

        {/* System Logs */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">📋 System Logs</h2>
          <div className="max-h-96 overflow-y-auto bg-gray-50 rounded-lg p-4">
            {logs.length > 0 ? (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div
                    key={log._id}
                    className={`text-sm p-2 border-b border-gray-200 last:border-b-0 font-mono ${
                      log.level === 'INFO' ? 'log-info' :
                      log.level === 'WARNING' ? 'log-warning' : 'log-error'
                    }`}
                  >
                    <strong>{new Date(log.timestamp).toLocaleString()}</strong> [{log.level}] {log.message}
                    {log.sessionId && ` (Session: ${log.sessionId.substring(0, 8)})`}
                    {log.ipAddress && ` (IP: ${log.ipAddress})`}
                  </div>
                ))}
              </div>
            ) : (
              <p>No logs available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
