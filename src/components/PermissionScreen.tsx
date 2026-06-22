import type { PermissionState } from '@/types';

interface PermissionScreenProps {
  permissions: PermissionState;
  onRequestAll: () => Promise<void>;
}

export function PermissionScreen({ permissions, onRequestAll }: PermissionScreenProps) {
  const allGranted = Object.values(permissions).every(p => p === 'granted');

  if (allGranted) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      zIndex: 1000,
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>
        🌌 Skylight WebAR
      </h1>

      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <p style={{ marginBottom: '1rem' }}>需要以下权限才能使用：</p>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '0.5rem' }}>
            {permissions.camera === 'granted' ? '✅' : '📷'} 相机访问
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            {permissions.location === 'granted' ? '✅' : '📍'} 位置信息
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            {permissions.motion === 'granted' ? '✅' : '📱'} 设备方向传感器
          </li>
        </ul>
      </div>

      <button
        onClick={onRequestAll}
        style={{
          padding: '1rem 2rem',
          fontSize: '1rem',
          background: '#3C5A78',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '500'
        }}
      >
        授权并开始
      </button>

      <p style={{
        marginTop: '2rem',
        fontSize: '0.875rem',
        color: '#999',
        textAlign: 'center',
        maxWidth: '300px'
      }}>
        举起手机对准天空，精准查看飞机与星体的实时位置
      </p>
    </div>
  );
}
