import * as THREE from 'three';

/**
 * Generates an engraved dark slate astrolabe dial texture with the authentic
 * 9-point Enneagram geometry (nonagon, inner 3-6-9 triangle, 1-4-2-8-5-7 hexad),
 * subtle degree ticks, and Roman numerals I–IX.
 */
export function createEnneagramDialTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;

  // Honed slate radial gradient base
  const bgGrad = ctx.createRadialGradient(cx, cy, 40, cx, cy, size * 0.52);
  bgGrad.addColorStop(0, '#1d2027');
  bgGrad.addColorStop(0.65, '#16181e');
  bgGrad.addColorStop(1, '#101216');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  // Subtle mineral stone grain
  for (let i = 0; i < 4800; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const alpha = Math.random() * 0.04;
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Concentric engraved rings
  const rings = [472, 444, 396, 368, 220, 128];
  rings.forEach((r, idx) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle =
      idx === 1 || idx === 3 ? 'rgba(212, 168, 83, 0.36)' : 'rgba(242, 239, 233, 0.14)';
    ctx.lineWidth = idx === 1 ? 2.2 : 1.2;
    ctx.stroke();
  });

  // 72 Fine degree ticks around outer bezel
  for (let i = 0; i < 72; i++) {
    const angle = (i / 72) * Math.PI * 2;
    const isMajor = i % 8 === 0;
    const rInner = isMajor ? 416 : 426;
    const rOuter = 440;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * rInner, cy + Math.sin(angle) * rInner);
    ctx.lineTo(cx + Math.cos(angle) * rOuter, cy + Math.sin(angle) * rOuter);
    ctx.strokeStyle = isMajor ? 'rgba(212, 168, 83, 0.5)' : 'rgba(242, 239, 233, 0.14)';
    ctx.lineWidth = isMajor ? 2 : 1;
    ctx.stroke();
  }

  // Helper for Enneagram vertex coordinates (Type 9 at top -PI/2, clockwise)
  const vertexPos = (num: number, radius: number) => {
    const index = num === 9 ? 0 : num;
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / 9;
    return {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      angle,
    };
  };

  // Draw engraved Hexad (1 -> 4 -> 2 -> 8 -> 5 -> 7 -> 1)
  const hexadOrder = [1, 4, 2, 8, 5, 7, 1];
  ctx.beginPath();
  hexadOrder.forEach((n, i) => {
    const p = vertexPos(n, 368);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.strokeStyle = 'rgba(212, 168, 83, 0.34)';
  ctx.lineWidth = 2.4;
  ctx.stroke();

  // Draw engraved Triangle (9 -> 3 -> 6 -> 9)
  const triOrder = [9, 3, 6, 9];
  ctx.beginPath();
  triOrder.forEach((n, i) => {
    const p = vertexPos(n, 368);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.strokeStyle = 'rgba(242, 239, 233, 0.32)';
  ctx.lineWidth = 2.8;
  ctx.stroke();

  // Roman numerals engraved on outer track
  const romans = ['IX', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  ctx.font = '600 26px "Cormorant Garamond", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < 9; i++) {
    const num = i === 0 ? 9 : i;
    const p = vertexPos(num, 408);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle + Math.PI / 2);
    ctx.fillStyle = 'rgba(212, 168, 83, 0.85)';
    ctx.fillText(romans[i], 0, 0);
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates a linear bump/roughness texture for brushed metal or honed basalt.
 */
export function createBrushedMetalTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y++) {
    const val = 105 + Math.floor(Math.random() * 50);
    ctx.fillStyle = `rgb(${val},${val},${val})`;
    ctx.fillRect(0, y, size, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates a soft radial contact shadow texture for grounding sculptures on the floor.
 */
export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;
  const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, size * 0.48);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
  grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.36)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
