'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface QRData {
  room: string;
  device: {
    name: string;
    ipAddress: string;
    macAddress?: string;
  };
  qrCode: string;
  url: string;
  deviceOnline: boolean;
}

export default function QRCodePage() {
  const params = useParams();
  const room = params.room as string;
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQRData();
  }, [room]);

  const fetchQRData = async () => {
    try {
      const response = await fetch(`/api/qr/${room}`);
      if (response.ok) {
        const data = await response.json();
        setQrData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load QR code');
      }
    } catch (err) {
      setError('Failed to load QR code');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading QR code...</p>
        </div>
      </div>
    );
  }

  if (error || !qrData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card max-w-md mx-auto text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error || 'Room not found'}</p>
          <Link href="/" className="btn btn-primary">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="card text-center">
          <h1 className="text-3xl font-bold mb-6">📱 Room {qrData.room}</h1>

          {/* Device Info */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="text-xl font-semibold">{qrData.device.name}</h3>
            <p className="text-gray-600">IP: {qrData.device.ipAddress}</p>
            <p className="text-gray-600">MAC: {qrData.device.macAddress || 'N/A'}</p>
            <p className="mt-2">
              Status:{' '}
              <span className={qrData.deviceOnline ? 'status-online' : 'status-offline'}>
                ● {qrData.deviceOnline ? 'Online' : 'Offline'}
              </span>
            </p>
          </div>

          {qrData.deviceOnline ? (
            <>
              {/* QR Code */}
              <div className="mb-6">
                <img
                  src={qrData.qrCode}
                  alt="QR Code"
                  className="mx-auto border-2 border-gray-300 rounded-lg"
                  width={250}
                  height={250}
                />
              </div>

              <h3 className="text-xl font-semibold mb-4">📱 Scan with your mobile device</h3>
              <p className="text-gray-600 mb-2">Or visit this URL:</p>
              <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm break-all mb-4">
                {qrData.url}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Make sure your mobile device is on the 192.168.10.x network
                </p>
              </div>
            </>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-red-600 mb-2">⚠️ Device Offline</h3>
              <p className="text-red-700">
                The Chromecast in this room is currently offline. Please check the device and try again.
              </p>
            </div>
          )}

          <Link href="/" className="btn btn-primary">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
