/**
 * build-icons.js — renders the ForceLens logo to PNG icons (16/32/48/128).
 *
 * Self-contained: uses only Node's built-in `zlib`. Draws the logo with a
 * tiny software rasterizer (signed-distance fields) at 4× supersampling for
 * anti-aliasing, then box-downsamples to each target size.
 *
 * Run:  node assets/build-icons.js
 * Out:  assets/icon16.png, icon32.png, icon48.png, icon128.png
 *
 * The geometry mirrors assets/logo.svg exactly (128-unit canvas).
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ── Brand colors ──────────────────────────────────────────────────────────
const C_BG_A = [0x63, 0x66, 0xf1];   // #6366f1 indigo (top-left)
const C_BG_B = [0x8b, 0x5c, 0xf6];   // #8b5cf6 violet (bottom-right)
const WHITE  = [0xff, 0xff, 0xff];

// ── SDF helpers (operate in the 128-unit logo space) ───────────────────────
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
function lerp(a, b, t) { return a + (b - a) * t; }

function sdRoundRect(px, py, x, y, w, h, r) {
  // distance to a rounded rectangle [x,y,w,h] with corner radius r
  const cx = clamp(px, x + r, x + w - r);
  const cy = clamp(py, y + r, y + h - r);
  // inside test via the standard rounded-box SDF
  const qx = Math.abs(px - (x + w / 2)) - (w / 2 - r);
  const qy = Math.abs(py - (y + h / 2)) - (h / 2 - r);
  const ax = Math.max(qx, 0), ay = Math.max(qy, 0);
  const outside = Math.sqrt(ax * ax + ay * ay) + Math.min(Math.max(qx, qy), 0) - r;
  return outside;
}
function sdSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const t = clamp(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy), 0, 1);
  const cx = ax + t * dx, cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

// Coverage for "shape is present" given a signed distance and an AA half-width.
function cov(sd, aa) { return clamp(0.5 - sd / aa, 0, 1); }

// ── Per-pixel color in 128-space → {r,g,b,a} (0..255) ──────────────────────
function sample(px, py, aa) {
  // 1) Rounded-square background mask + diagonal gradient.
  const bgSd = sdRoundRect(px, py, 0, 0, 128, 128, 30);
  const bgCov = cov(bgSd, aa);
  if (bgCov <= 0) return [0, 0, 0, 0];

  const t = clamp((px + py) / 256, 0, 1);
  let r = lerp(C_BG_A[0], C_BG_B[0], t);
  let g = lerp(C_BG_A[1], C_BG_B[1], t);
  let b = lerp(C_BG_A[2], C_BG_B[2], t);

  // subtle top gloss
  const gloss = clamp(0.16 * (1 - py / 128), 0, 0.16);
  r = lerp(r, 255, gloss); g = lerp(g, 255, gloss); b = lerp(b, 255, gloss);

  // 2) White foreground = max coverage of: lens ring, handle, three bars.
  // lens ring: |dist to (55,55) - 29| - 4.5
  const ringSd = Math.abs(Math.hypot(px - 55, py - 55) - 29) - 4.5;
  let fg = cov(ringSd, aa);

  // handle: segment (76,76)-(98,98), half-width 6 (round caps via segment dist)
  const handleSd = sdSegment(px, py, 76, 76, 98, 98) - 6;
  fg = Math.max(fg, cov(handleSd, aa));

  // ascending bars (rounded), inside the lens
  fg = Math.max(fg, cov(sdRoundRect(px, py, 44, 56, 6, 10, 3), aa));
  fg = Math.max(fg, cov(sdRoundRect(px, py, 52, 50, 6, 16, 3), aa));
  fg = Math.max(fg, cov(sdRoundRect(px, py, 60, 43, 6, 23, 3), aa));

  // composite white over gradient
  r = lerp(r, WHITE[0], fg);
  g = lerp(g, WHITE[1], fg);
  b = lerp(b, WHITE[2], fg);

  return [Math.round(r), Math.round(g), Math.round(b), Math.round(255 * bgCov)];
}

// ── Render one size with supersampling ─────────────────────────────────────
function render(size) {
  const ss = 4;                       // supersample factor
  const S = size * ss;
  const scale = 128 / S;              // SS-pixel → logo-space
  const aa = scale * 1.1;             // AA width in logo units (~1 SS pixel)

  // Accumulate at SS resolution, then box-downsample.
  const out = Buffer.alloc(size * size * 4);
  for (let oy = 0; oy < size; oy++) {
    for (let ox = 0; ox < size; ox++) {
      let R = 0, G = 0, B = 0, A = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const px = (ox * ss + sx + 0.5) * scale;
          const py = (oy * ss + sy + 0.5) * scale;
          const [r, g, b, a] = sample(px, py, aa);
          // premultiply for correct edge blending
          R += r * a; G += g * a; B += b * a; A += a;
        }
      }
      const n = ss * ss;
      const a = A / n;
      const i = (oy * size + ox) * 4;
      if (a > 0) {
        out[i]   = clamp(Math.round(R / A), 0, 255);
        out[i+1] = clamp(Math.round(G / A), 0, 255);
        out[i+2] = clamp(Math.round(B / A), 0, 255);
        out[i+3] = clamp(Math.round(a), 0, 255);
      } else {
        out[i] = out[i+1] = out[i+2] = out[i+3] = 0;
      }
    }
  }
  return out;
}

// ── Minimal PNG encoder (RGBA, 8-bit) ──────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function encodePng(rgba, size) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // color type RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  // raw scanlines with filter byte 0
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// ── Build ───────────────────────────────────────────────────────────────────
const sizes = [16, 32, 48, 128];
for (const s of sizes) {
  const rgba = render(s);
  const png = encodePng(rgba, s);
  const outPath = path.join(__dirname, `icon${s}.png`);
  fs.writeFileSync(outPath, png);
  console.log(`wrote ${outPath} (${png.length} bytes)`);
}
console.log('Done. Icons generated from assets/logo.svg geometry.');
