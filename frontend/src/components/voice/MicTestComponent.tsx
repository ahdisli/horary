'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

export function MicTestComponent() {
  const [status, setStatus] = useState<string>('Ready to test');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const testMicrophone = async () => {
    setStatus('Testing microphone access...');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });
      
      setStatus('Microphone access granted! ✅');
      setHasPermission(true);
      
      // Stop the stream after test
      stream.getTracks().forEach(track => track.stop());
      
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Microphone test failed:', error);
      setStatus(`Microphone access failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setHasPermission(false);
    }
  };

  const checkPermissions = async () => {
    setStatus('Checking permissions...');
    
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setStatus(`Permission status: ${result.state}`);
      setHasPermission(result.state === 'granted');
    } catch (error) {
      setStatus(`Permission check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Microphone Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          Status: {status}
        </div>
        
        {hasPermission !== null && (
          <div className="text-sm">
            Permission: {hasPermission ? '✅ Granted' : '❌ Denied'}
          </div>
        )}
        
        <div className="space-y-2">
          <Button onClick={checkPermissions} className="w-full">
            Check Permission Status
          </Button>
          
          <Button onClick={testMicrophone} className="w-full">
            Test Microphone Access
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
