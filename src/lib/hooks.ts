import { useState, useEffect, useCallback } from 'react';
import type { PermissionState, DeviceOrientationData } from '@/types';

export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionState>({
    camera: 'pending',
    location: 'pending',
    motion: 'pending',
  });

  const requestCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setPermissions(prev => ({ ...prev, camera: 'granted' }));
      return stream;
    } catch (err) {
      console.error('Camera permission denied:', err);
      setPermissions(prev => ({ ...prev, camera: 'denied' }));
      return null;
    }
  }, []);

  const requestLocation = useCallback(async () => {
    return new Promise<GeolocationPosition | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPermissions(prev => ({ ...prev, location: 'granted' }));
          resolve(position);
        },
        (error) => {
          console.error('Location permission denied:', error);
          setPermissions(prev => ({ ...prev, location: 'denied' }));
          resolve(null);
        },
        { enableHighAccuracy: true }
      );
    });
  }, []);

  const requestMotion = useCallback(async () => {
    // iOS 13+ 需要显式请求 DeviceMotion 权限
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setPermissions(prev => ({ ...prev, motion: 'granted' }));
          return true;
        } else {
          setPermissions(prev => ({ ...prev, motion: 'denied' }));
          return false;
        }
      } catch (err) {
        console.error('Motion permission error:', err);
        setPermissions(prev => ({ ...prev, motion: 'error' }));
        return false;
      }
    } else {
      // Android 或桌面浏览器，无需显式权限
      setPermissions(prev => ({ ...prev, motion: 'granted' }));
      return true;
    }
  }, []);

  const requestAll = useCallback(async () => {
    const [camera, location, motion] = await Promise.all([
      requestCamera(),
      requestLocation(),
      requestMotion(),
    ]);
    return { camera, location, motion };
  }, [requestCamera, requestLocation, requestMotion]);

  return {
    permissions,
    requestCamera,
    requestLocation,
    requestMotion,
    requestAll,
  };
}

export function useDeviceOrientation() {
  const [orientation, setOrientation] = useState<DeviceOrientationData | null>(null);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      setOrientation({
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
        absolute: event.absolute,
      });
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  return orientation;
}

export function useGeolocation() {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition(pos);
        setError(null);
      },
      (err) => {
        setError(err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { position, error };
}
