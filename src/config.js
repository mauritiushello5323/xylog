// ── 地图中心点 ────────────────────────────────────────────────────
// 格式：[纬度, 经度]，使用高德坐标（GCJ-02）
// 在高德地图网页版右键 → "在此处添加标注" → 复制经纬度
export const MAP_CENTER = [31.2220, 121.4737]  // 上海·新天地

// ── 缩放级别 ──────────────────────────────────────────────────────
// 14 = 街区  |  15 = 路口  |  16 = 建筑
export const MAP_ZOOM = 15

// ── 高德地图风格 ──────────────────────────────────────────────────
// 可选值：
//   amap://styles/normal      标准（默认）
//   amap://styles/whitesmoke  远山黛（浅色，推荐）
//   amap://styles/light       月光银
//   amap://styles/grey        雅士灰
//   amap://styles/fresh       草色青
//   amap://styles/macaron     马卡龙
//   amap://styles/dark        幻影黑
//   amap://styles/darkblue    极夜蓝
//   amap://styles/blue        靛青蓝
//   amap://styles/wine        酱籽
//   amap://styles/graffiti    涂鸦
export const MAP_STYLE = 'amap://styles/whitesmoke'
