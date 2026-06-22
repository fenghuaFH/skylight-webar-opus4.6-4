# 部署指南

## 快速部署到 Vercel

### 方法 1: GitHub + Vercel 自动部署（推荐）

```bash
cd skylight-webar

# 1. 初始化 Git 仓库
git init
git add .
git commit -m "feat: initial skylight webar prototype"

# 2. 创建 GitHub 仓库并推送
# 方式 A: 使用 GitHub CLI
gh repo create skylight-webar --public --source=. --remote=origin
git push -u origin main

# 方式 B: 手动创建
# 访问 https://github.com/new 创建仓库，然后：
git remote add origin https://github.com/YOUR_USERNAME/skylight-webar.git
git branch -M main
git push -u origin main

# 3. 部署到 Vercel
# 访问 https://vercel.com/new
# 点击 "Import Git Repository"
# 选择刚创建的 skylight-webar 仓库
# 构建配置会自动识别（Vite 项目）
# 点击 "Deploy" 即可
```

### 方法 2: Vercel CLI 直接部署

```bash
cd skylight-webar

# 安装 Vercel CLI（如果没有）
npm install -g vercel

# 登录
vercel login

# 部署（首次会引导配置）
vercel --prod
```

## 本地测试

由于传感器 API 需要 HTTPS 或 localhost，本地开发时：

```bash
# 方式 1: localhost（推荐）
npm run dev
# 访问 http://localhost:5173

# 方式 2: 使用 ngrok 获取临时 HTTPS 域名
npm run dev &
ngrok http 5173
# 使用 ngrok 提供的 HTTPS URL 在手机上测试
```

## 环境变量（可选）

如果需要飞机数据 API（未来集成）：

```bash
# 创建 .env 文件
echo "VITE_OPENSKY_API_URL=https://opensky-network.org/api" > .env
```

在 Vercel 仪表板 → Settings → Environment Variables 中添加。

## 验证部署

部署成功后，访问 Vercel 提供的 URL（如 `https://skylight-webar.vercel.app`）：

1. **桌面浏览器**: 显示权限请求界面（传感器不可用是正常的）
2. **手机浏览器**: 
   - 授权相机/位置/传感器权限
   - 等待 GPS 定位（2-10秒）
   - 举起手机对准天空
   - 应该看到星体标注叠加

## 故障排查

### 权限被拒绝
- iOS: 检查 Safari 设置 → 隐私 → 运动与方向
- Android: 检查浏览器应用权限

### GPS 定位失败
- 确保手机开启定位服务
- 到室外或窗边增强 GPS 信号

### 看不到星体
- 检查调试信息面板显示的位置是否正确
- 确认方位角/仰角数值在变化
- 白天星体可能不可见（降低亮度测试）

## 自定义域名

Vercel 仪表板 → Domains → Add Domain → 输入你的域名并按指引配置 DNS。
