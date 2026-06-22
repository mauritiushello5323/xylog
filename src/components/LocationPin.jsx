// LocationPin は高德 JS API への移行により不要になりました。
// ピンの HTML は src/utils/pinHtml.js の buildPinHtml() が生成します。
// MapView.jsx が AMap.Marker の content として直接使用しています。
export { buildPinHtml } from '../utils/pinHtml'
