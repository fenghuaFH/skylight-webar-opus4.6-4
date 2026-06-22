import React, { useState, useEffect, useRef } from 'react';
import { CameraView } from './components/CameraView';
import { PermissionScreen } from './components/PermissionScreen';
import { usePermissions, useDeviceOrientation, useGeolocation } from './lib/hooks';
import { computeSky } from './lib/celestial';
import { deviceOrientationToSkyView, isInViewport, skyToScreen, getMagneticDeclination } from './lib/coordinates';
import type { SkyBody } from './lib/celestial';

function App() {
  const { permissions, requestAll } = usePermissions();
  const orientation = useDeviceOrientation();
  const { position } = useGeolocation();

  const [skyData, setSkyData] = useState<{ stars: SkyBody[], planets: SkyBody[], sats: SkyBody[] } | null>(null);
  const [magneticDeclination, setMagneticDeclination] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 更新天体数据（每5秒）
  useEffect(() => {
    if (!position) return;

    const updateSky = () => {
      const sky = computeSky(
        new Date(),
        position.coords.latitude,
        position.coords.longitude,
        {
          sun: true,
          moon: true,
          stars: true,
          satellites: false, // 暂不支持卫星
          planets: true,
          magLimit: 3.0,
          tles: []
        }
      );
      setSkyData(sky);
    };

    // 计算磁偏角
    const declination = getMagneticDeclination(
      position.coords.latitude,
      position.coords.longitude
    );
    setMagneticDeclination(declination);

    updateSky();
    const interval = setInterval(updateSky, 5000);
    return () => clearInterval(interval);
  }, [position]);

  // 渲染 AR 标注
  useEffect(() => {
    if (!canvasRef.current || !skyData || !orientation || !position) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 获取设备视角
    const deviceView = deviceOrientationToSkyView(orientation, magneticDeclination);
    if (!deviceView) return;

    // 绘制配置
    ctx.font = '14px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 绘制星体
    skyData.stars.forEach(star => {
      if (!isInViewport(star, deviceView.azimuth, deviceView.elevation, 70)) return;

      const pos = skyToScreen(
        star.az,
        star.alt,
        deviceView.azimuth,
        deviceView.elevation,
        canvas.width,
        canvas.height,
        70
      );

      // 根据星等调整大小和亮度
      const size = Math.max(2, 6 - star.mag!);
      const alpha = Math.min(1, Math.max(0.3, 1 - star.mag! / 3));

      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
      ctx.fill();

      // 标注亮星名称
      if (star.mag! < 1.5) {
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        ctx.fillText(star.name || '', pos.x, pos.y - size - 10);
      }
    });

    // 绘制行星
    skyData.planets.forEach(planet => {
      if (!isInViewport(planet, deviceView.azimuth, deviceView.elevation, 70)) return;

      const pos = skyToScreen(
        planet.az,
        planet.alt,
        deviceView.azimuth,
        deviceView.elevation,
        canvas.width,
        canvas.height,
        70
      );

      // 行星用彩色标记
      const colors: Record<string, string> = {
        'Venus': '#FFF4CC',
        'Mars': '#FF6B6B',
        'Jupiter': '#FFD93D',
        'Saturn': '#F4E4BA',
        'Mercury': '#C0C0C0'
      };

      ctx.fillStyle = colors[planet.name || ''] || '#FFFFFF';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(planet.name || '', pos.x, pos.y - 15);
    });

    // 显示调试信息
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 300, 120);
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.font = '12px monospace';
    ctx.fillText(`方位角: ${deviceView.azimuth.toFixed(1)}°`, 20, 30);
    ctx.fillText(`仰角: ${deviceView.elevation.toFixed(1)}°`, 20, 50);
    ctx.fillText(`位置: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`, 20, 70);
    ctx.fillText(`星体: ${skyData.stars.length} | 行星: ${skyData.planets.length}`, 20, 90);
    ctx.fillText(`磁偏角: ${magneticDeclination.toFixed(1)}°`, 20, 110);

  }, [skyData, orientation, position, magneticDeclination]);

  const handleRequestAll = async () => {
    await requestAll();
  };

  const allGranted = Object.values(permissions).every(p => p === 'granted');

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
      {allGranted && <CameraView />}

      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 10
        }}
      />

      <PermissionScreen
        permissions={permissions}
        onRequestAll={handleRequestAll}
      />

      {!position && allGranted && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '1rem',
          textAlign: 'center',
          zIndex: 5
        }}>
          📍 正在获取位置信息...
        </div>
      )}
    </div>
  );
}

export default App;
