'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatTimeRemaining } from '@/lib/utils';

interface ConnectionData {
  session: {
    id: string;
    room: string;
    device: {
      name: string;
      ipAddress: string;
    };
    mobileIp: string;
    expiresAt: string;
  };
}

export default function ConnectPage() {
  const searchParams = useSearchParams();
  const room = searchParams.get('room');
  const [connectionData, setConnectionData] = useState<ConnectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!room) {
      setError('Room parameter required');
      setLoading(false);
      return;
    }

    connectToRoom();
  }, [room]);

  useEffect(() => {
    if (!connectionData) return;

    const interval = setInterval(() => {
      const expiresAt = new Date(connectionData.session.expiresAt);
      setTimeRemaining(formatTimeRemaining(expiresAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [connectionData]);

  const connectToRoom = async () => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ room }),
      });

      if (response.ok) {
        const data = await response.json();
        setConnectionData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || errorData.error || 'Connection failed');
      }
    } catch (err) {
      setError('Failed to connect to room');
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    if (!connectionData || !confirm('End your casting session?')) return;

    try {
      const response = await fetch(`/api/sessions/${connectionData.session.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Session ended successfully');
        window.location.href = '/';
      } else {
        const errorData = await response.json();
        alert(`Failed to end session: ${errorData.error}`);
      }
    } catch (err) {
      alert('Failed to end session');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Connecting to room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card max-w-md mx-auto text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Connection Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-2">
            <button onClick={() => window.history.back()} className="btn btn-primary">
              ← Go Back
            </button>
            <Link href="/" className="btn btn-primary">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!connectionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No connection data available</p>
          <Link href="/" className="btn btn-primary mt-4">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const expiresAt = new Date(connectionData.session.expiresAt);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="card">
          {/* Success Header */}
          <div className="bg-green-500 text-white rounded-lg p-6 mb-6 text-center">
            <h1 className="text-3xl font-bold">✅ Connected Successfully!</h1>
            <p className="mt-2">You can now cast to Room {connectionData.session.room}</p>
          </div>

          {/* Connection Details */}
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <h3 className="text-xl font-semibold mb-4">Connection Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Room:</span>
                <span className="font-bold">{connectionData.session.room}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Device:</span>
                <span>{connectionData.session.device.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Your IP:</span>
                <span>{connectionData.session.mobileIp}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Chromecast IP:</span>
                <span>{connectionData.session.device.ipAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Session ID:</span>
                <span className="font-mono text-sm">{connectionData.session.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Expires:</span>
                <span>{expiresAt.toLocaleString()} UTC</span>
              </div>
            </div>
          </div>

          {/* Casting Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-yellow-800 mb-2">📱 How to Cast:</h4>
            <ol className="list-decimal list-inside space-y-1 text-yellow-700">
              <li>Open any cast-enabled app (YouTube, Netflix, Spotify, etc.)</li>
              <li>Look for the cast icon (📺)</li>
              <li>Select "{connectionData.session.device.name}" from the list</li>
              <li>Start casting!</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-x-4 mb-6">
            <button onClick={endSession} className="btn btn-danger">
              End Session
            </button>
            <Link href="/" className="btn btn-primary">
              Dashboard
            </Link>
          </div>

          {/* Countdown */}
          <div className="text-center">
            <p className="text-gray-600">
              Session will automatically expire in{' '}
              <span className="text-xl font-bold text-primary-500">{timeRemaining}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
