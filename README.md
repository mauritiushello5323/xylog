# xylog — 个人地图日志

全屏城市地图 + 拍立得照片日志网站。

---

## 目录

1. [本地预览](#本地预览)
2. [注册 Supabase（数据库 + 存储）](#注册-supabase)
3. [建表 SQL](#建表-sql)
4. [创建 Storage 桶](#创建-storage-桶)
5. [填写密钥到 .env](#填写密钥到-env)
6. [部署到 Vercel](#部署到-vercel)
7. [日常维护](#日常维护)
8. [自定义站名和配色](#自定义站名和配色)

---

## 本地预览

> 需要先安装 [Node.js](https://nodejs.org)（选 LTS 版本）。

打开终端（Windows 用 PowerShell 或 CMD），进入项目文件夹：

```
cd D:\sandbox\xylog   # 或你存放项目的路径
npm install           # 首次运行，安装依赖（约1分钟）
npm run dev           # 启动本地服务器
```

浏览器访问 **http://localhost:5173** 即可看到演示数据效果。
访问 **http://localhost:5173/admin** 进入管理后台（密码见下方 `.env` 配置）。

---

## 注册 Supabase

1. 打开 [https://supabase.com](https://supabase.com)，点击 **Start your project**。
2. 用 GitHub 账号或邮箱注册。
3. 注册后点击 **New Project**，填写项目名称（随意），选择离你最近的区域（Asia Southeast 或 Northeast Asia），设置数据库密码（记住它）。
4. 等待约 1 分钟，项目创建完成。

---

## 建表 SQL

进入你的 Supabase 项目后：

**左侧菜单 → SQL Editor → 点击 "+ New query"**

粘贴以下 SQL，然后点击 **Run**：

```sql
-- 日志条目表
CREATE TABLE entries (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  timestamptz DEFAULT now(),
  day         integer NOT NULL DEFAULT 1,
  location_name text NOT NULL,
  category    text DEFAULT 'other',
  lat         float8,           -- 纬度（点击地图自动填入）
  lng         float8,           -- 经度
  description text DEFAULT '',
  images      jsonb DEFAULT '[]'::jsonb,
  music_url   text
);

-- 允许公开读取（访客可以看到地图）
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON entries FOR SELECT USING (true);
CREATE POLICY "auth insert" ON entries FOR INSERT WITH CHECK (true);
CREATE POLICY "auth update" ON entries FOR UPDATE USING (true);
CREATE POLICY "auth delete" ON entries FOR DELETE USING (true);

-- 每天的背景音乐
CREATE TABLE day_music (
  day       integer PRIMARY KEY,
  music_url text
);
ALTER TABLE day_music ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON day_music FOR SELECT USING (true);
CREATE POLICY "auth all" ON day_music FOR ALL USING (true);
```

---

## 创建 Storage 桶

**左侧菜单 → Storage → New bucket**

创建两个桶：

| Bucket 名称 | Public |
|------------|--------|
| `images`   | ✅ 开启 |
| `music`    | ✅ 开启 |

开启 Public 后，你上传的文件会生成可公开访问的 URL，网站才能显示图片和播放音乐。

然后为每个桶设置 Storage Policy（点击桶名 → Policies → New policy → "Give users access to only their own top level folder named as uid" 选 **For full customization**，直接粘贴以下内容）：

```sql
-- 对 images 和 music 桶均执行：
CREATE POLICY "public read storage" ON storage.objects
  FOR SELECT USING (bucket_id IN ('images', 'music'));

CREATE POLICY "public insert storage" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id IN ('images', 'music'));

CREATE POLICY "public delete storage" ON storage.objects
  FOR DELETE USING (bucket_id IN ('images', 'music'));
```

---

## 填写密钥到 .env

**Supabase 后台 → 左侧 Project Settings → API**

你会看到两个值：
- **Project URL**（类似 `https://xxxx.supabase.co`）
- **anon public key**（很长的一串 JWT）

在项目根目录创建 `.env` 文件（复制 `.env.example` 重命名），填入：

```
VITE_SUPABASE_URL=https://你的项目ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...（anon key 完整粘贴）
VITE_ADMIN_PASSWORD=你设的密码
```

保存后，重新运行 `npm run dev`，演示模式横幅会消失，切换为真实数据库。

---

## 部署到 Vercel

### 第一步：上传代码到 GitHub

1. 注册 [GitHub](https://github.com)（有账号跳过）
2. 点击右上角 **+** → **New repository**，填写名字（如 `xylog`），选 Private，点 Create
3. 安装 [Git for Windows](https://git-scm.com/download/win)
4. 在项目文件夹打开终端，运行：

```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/你的用户名/xylog.git
git push -u origin main
```

### 第二步：连接 Vercel

1. 打开 [https://vercel.com](https://vercel.com)，用 GitHub 登录
2. 点击 **Add New → Project**，选你刚推送的 `xylog` 仓库
3. Framework Preset 选 **Vite**（通常自动识别）
4. 展开 **Environment Variables**，添加三条：

   | Key | Value |
   |-----|-------|
   | `VITE_SUPABASE_URL` | 你的 Supabase URL |
   | `VITE_SUPABASE_ANON_KEY` | 你的 anon key |
   | `VITE_ADMIN_PASSWORD` | 你的管理密码 |

5. 点击 **Deploy**，等待约 1 分钟，Vercel 会给你一个 `.vercel.app` 网址。

以后只要修改代码并 `git push`，网站会自动更新。

---

## 日常维护

### 添加新内容
访问 `你的网址/admin`，输入密码，进入管理后台，点「新增地点」。

### 添加新的一天
在管理后台，点 Day 标签旁的 `+ Day` 按钮。

### 更换背景音乐
在管理后台编辑任意地点时，可以上传 `.mp3` 文件作为该地点的音乐。音乐播放器会取当天第一条有音乐的地点来播放。（后续版本将支持按天统一设置音乐。）

---

## 自定义站名和配色

### 改站名
全局搜索 `xylog`，替换成你想要的名字：
- `index.html` 第 7 行：`<title>`
- `src/components/DayNav.jsx`：logo 链接文字
- `src/components/admin/AdminLogin.jsx`：登录页标题

### 改分类配色
编辑 `src/utils/categoryColors.js`，每个分类有三个颜色值：
- `border`：照片边框色 & 胶囊按钮边框色
- `bg`：胶囊按钮背景色
- `text`：文字颜色

### 改地图背景色
编辑 `src/components/MapBackground.jsx` 顶部的颜色常量（`BG`, `BLOCK`, `PARK`, `WATER` 等）。

---

*由 Claude 生成 · xylog v0.1*
