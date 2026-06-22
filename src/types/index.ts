// 设备定向事件数据
export interface DeviceOrientationData {
  alpha: number | null; // 绕 Z 轴旋转 (0-360°, 指向北为0)
  beta: number | null;  // 绕 X 轴旋转 (-180 to 180°)
  gamma: number | null; // 绕 Y 轴旋转 (-90 to 90°)
  absolute: boolean;
}

// 地理位置数据
export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  heading: number | null;
}

// 权限状态
export type PermissionStatus = 'pending' | 'granted' | 'denied' | 'error';

export interface PermissionState {
  camera: PermissionStatus;
  location: PermissionStatus;
  motion: PermissionStatus;
}

// 天体对象
export interface CelestialObject {
  id: string;
  name: string;
  type: 'star' | 'planet' | 'satellite' | 'aircraft';
  azimuth: number;    // 方位角 (0-360°, 北为0)
  elevation: number;  // 仰角 (-90 to 90°)
  magnitude?: number; // 视星等
  distance?: number;  // 距离 (米)
}

// 飞机数据
export interface Aircraft {
  icao24: string;
  callsign: string | null;
  origin_country: string;
  longitude: number | null;
  latitude: number | null;
  baro_altitude: number | null;
  velocity: number | null;
  true_track: number | null;
  vertical_rate: number | null;
  on_ground: boolean;
}

// AR 标注配置
export interface ARMarkerConfig {
  showStars: boolean;
  showPlanets: boolean;
  showSatellites: boolean;
  showAircraft: boolean;
  starMagnitudeLimit: number;
  aircraftRadiusKm: number;
}
