# Skylight WebAR

移动端 Web AR 天空透视原型 - 举手机对准天空，精准叠加飞机与恒星/星座等天体位置

## 技术栈

- **前端**: Vite + React + TypeScript
- **3D渲染**: Canvas 2D (简化原型)
- **天文计算**: astronomy-engine + satellite.js
- **传感器**: DeviceOrientation API + Geolocation API

## 核心功能

✅ 实时获取设备方向（方位角 + 仰角）  
✅ GPS 定位 + 磁偏角校准  
✅ 精确计算天体位置（恒星/行星/卫星）  
✅ Canvas 2D AR 标注叠加  
✅ 移动端权限管理  

## 本地开发

```bash
cd skylight-webar
npm install
npm run dev
```

访问 `http://localhost:5173`（需 HTTPS 或 localhost 才能使用传感器）

## 部署到 Vercel

```bash
# 1. 初始化 Git
git init
git add .
git commit -m "Initial commit"

# 2. 推送到 GitHub
gh repo create skylight-webar --public --source=. --remote=origin
git push -u origin main

# 3. 部署到 Vercel
vercel --prod
```

或直接在 Vercel 仪表板导入 GitHub 仓库。

## 使用说明

1. 打开网页，授权相机、位置、传感器权限
2. 等待 GPS 定位完成（显示经纬度）
3. 举起手机对准天空
4. 屏幕上会叠加显示：
   - ⭐ 亮星（星等 < 3.0）
   - 🪐 行星（金星/木星/火星等）
   - 📊 实时调试信息（方位角/仰角/位置）

## 已知限制

- 传感器精度受设备影响（建议 iPhone/高端 Android）
- 磁偏角简化计算（生产环境需用 NOAA WMM）
- 暂不支持飞机数据（需集成 OpenSky Network API）
- iOS Safari 需用户手动触发 DeviceMotion 权限

## 下一步开发

- [ ] 集成飞机实时数据 API
- [ ] Three.js 3D 标注升级
- [ ] 性能优化（降低刷新率）
- [ ] 离线星图 PWA
- [ ] 磁力计校准 UI

## License

MIT
