// Builds the HTML string for a polaroid-stack location pin.
// Used imperatively by AMap marker content (public map + admin DraggableMap).

const ROTATIONS = [[-5, -7, 5], [3, 4, 3], [0, 0, 0]]

/**
 * @param {object} entry   - map entry (location_name, images, category, …)
 * @param {object} color   - { border, bg, text } from categoryColors.js
 * @param {boolean} dimmed - set true when the category filter hides this pin
 */
export function buildPinHtml(entry, color, dimmed = false) {
  const photos = entry.images?.slice(0, 3) ?? []

  const photosHtml = photos.map((url, i) => `
    <div style="
      position:absolute;inset:0;
      border:3px solid ${color.border};border-radius:5px;
      overflow:hidden;
      box-shadow:0 3px 10px rgba(0,0,0,0.15);
      transform:rotate(${ROTATIONS[i][0]}deg) translate(${ROTATIONS[i][1]}px,${ROTATIONS[i][2]}px);
      z-index:${i + 1};background:#fff;
    ">
      <img src="${url}"
        style="width:100%;height:100%;object-fit:cover;display:block"
        loading="lazy"
        onerror="this.style.display='none'"
      />
    </div>
  `).join('')

  const placeholderHtml = photos.length === 0 ? `
    <div style="
      position:absolute;inset:0;
      border:3px solid ${color.border};border-radius:5px;
      background:${color.bg};
      display:flex;align-items:center;justify-content:center;font-size:26px;
    ">📍</div>
  ` : ''

  // Total outer height ≈ 150px (photos 80 + gap 5 + label 16 + gap 4 + line 36 + dot 8 + 1)
  // AMap marker offset(-60, -150) → bottom-centre of this div = geographic point
  return `
    <div style="
      display:flex;flex-direction:column;align-items:center;
      width:120px;overflow:visible;
      opacity:${dimmed ? 0.2 : 1};
      transition:opacity 0.2s;
      cursor:${dimmed ? 'default' : 'pointer'};
    ">
      <div style="position:relative;flex-shrink:0;width:80px;height:80px;overflow:visible;">
        ${photosHtml || placeholderHtml}
      </div>

      <span style="
        margin-top:5px;flex-shrink:0;
        font-size:10px;font-weight:600;line-height:16px;
        font-family:'IBM Plex Mono',monospace;
        letter-spacing:0.06em;white-space:nowrap;
        color:#2a2724;text-shadow:0 1px 3px rgba(255,255,255,0.95);
      ">${entry.location_name}</span>

      <div style="
        flex-shrink:0;width:1.5px;height:36px;margin-top:4px;
        background:repeating-linear-gradient(
          to bottom,
          #b0aca6 0,#b0aca6 4px,
          transparent 4px,transparent 8px
        );
      "></div>

      <div style="
        flex-shrink:0;width:8px;height:8px;
        border-radius:50%;
        background:${color.border};
        border:1.5px solid rgba(255,255,255,0.85);
        box-shadow:0 1px 4px rgba(0,0,0,0.22);
      "></div>
    </div>
  `
}
