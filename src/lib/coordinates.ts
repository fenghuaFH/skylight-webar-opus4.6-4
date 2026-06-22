import type { DeviceOrientationData } from '@/types';
import type { SkyBody } from './celestial';


/**
 * 将设备方向转换为天空视角（方位角 + 仰角）
 * @param orientation DeviceOrientation 数据
 * @param magneticDeclination 磁偏角（度数，东为正）
 */
export function deviceOrientationToSkyView(
  orientation: DeviceOrientationData,
  magneticDeclination: number = 0
): { azimuth: number; elevation: number } | null {
  if (orientation.alpha === null || orientation.beta === null || orientation.gamma === null) {
    return null;
  }

  // alpha: 设备绕 Z 轴旋转（0-360°，北为0）
  // beta: 设备绕 X 轴旋转（-180 to 180°，平放为0，竖立朝前为90）
  // gamma: 设备绕 Y 轴旋转（-90 to 90°，平放为0，向右倾为正）

  // 计算真北方位角（补偿磁偏角）
  let azimuth = (orientation.alpha + magneticDeclination + 360) % 360;

  // 计算仰角（手机竖立对准天空时 beta ≈ -90°）
  // 当设备平放（屏幕朝上）时 beta = 0°，对应仰角 90°（天顶）
  // 当设备竖立（屏幕朝前）时 beta = 90°，对应仰角 0°（地平线）
  let elevation = 90 - Math.abs(orientation.beta);

  // 处理设备倒置情况
  if (orientation.beta < -90) {
    elevation = -(90 + orientation.beta);
  }

  // 考虑设备横滚（gamma）对方位角的影响（简化处理）
  // 完整实现需要四元数或旋转矩阵

  return {
    azimuth: normalizeAzimuth(azimuth),
    elevation: Math.max(-90, Math.min(90, elevation))
  };
}

/**
 * 判断天体是否在设备视野内
 * @param body 天体对象
 * @param deviceAzimuth 设备方位角
 * @param deviceElevation 设备仰角
 * @param fovDegrees 视野角度（默认60°）
 */
export function isInViewport(
  body: SkyBody,
  deviceAzimuth: number,
  deviceElevation: number,
  fovDegrees: number = 60
): boolean {
  const azDiff = Math.abs(angleDifference(body.az, deviceAzimuth));
  const elDiff = Math.abs(body.alt - deviceElevation);

  const halfFov = fovDegrees / 2;
  return azDiff <= halfFov && elDiff <= halfFov;
}

/**
 * 将天体方位角/仰角转换为屏幕坐标
 * @param bodyAz 天体方位角
 * @param bodyAlt 天体仰角
 * @param deviceAzimuth 设备方位角
 * @param deviceElevation 设备仰角
 * @param screenWidth 屏幕宽度
 * @param screenHeight 屏幕高度
 * @param fovDegrees 视野角度
 */
export function skyToScreen(
  bodyAz: number,
  bodyAlt: number,
  deviceAzimuth: number,
  deviceElevation: number,
  screenWidth: number,
  screenHeight: number,
  fovDegrees: number = 60
): { x: number; y: number } {
  // 计算天体相对于设备中心的角度偏移
  const azDiff = angleDifference(bodyAz, deviceAzimuth);
  const elDiff = bodyAlt - deviceElevation;

  // 将角度映射到屏幕坐标（-1 到 1 的归一化坐标）
  const halfFov = fovDegrees / 2;
  const normalizedX = azDiff / halfFov;
  const normalizedY = -elDiff / halfFov; // Y 轴向下为正

  // 转换为像素坐标
  const x = screenWidth / 2 + normalizedX * (screenWidth / 2);
  const y = screenHeight / 2 + normalizedY * (screenHeight / 2);

  return { x, y };
}

/**
 * 计算两个角度之间的最小差值（考虑 0/360° 环绕）
 */
function angleDifference(a: number, b: number): number {
  let diff = a - b;
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  return diff;
}

/**
 * 规范化方位角到 0-360° 范围
 */
function normalizeAzimuth(azimuth: number): number {
  return ((azimuth % 360) + 360) % 360;
}

/**
 * 获取磁偏角（简化版，实际应查询 WMM 模型）
 * @param latitude 纬度
 * @param longitude 经度
 * @returns 磁偏角（度数，东为正）
 */
export function getMagneticDeclination(_latitude: number, longitude: number): number {
  // 简化实现：返回粗略估计值
  // 生产环境应使用 NOAA WMM API 或本地库
  // 示例：北京约为 -6°，纽约约为 -13°，伦敦约为 0°

  // 这里用简单的线性插值（不准确，仅演示）
  if (longitude > 0 && longitude < 140) {
    // 亚洲大部分地区西偏
    return -5;
  } else if (longitude >= 140 || longitude < -30) {
    // 美洲大部分地区西偏
    return -10;
  }
  return 0;
}
