// Self-contained so the identical geometry check runs in both engine sessions.
export function dragGeometryFromObservation(text, image) {
  const marker = 'OCU_DRAG_V1 ';
  const begin = text.indexOf(marker);
  if (begin < 0) throw Error('Live drag geometry is missing from AX state');
  const open = text.indexOf('{', begin + marker.length);
  let depth = 0, close = -1;
  for (let i = open; i >= 0 && i < text.length; i++) {
    if (text[i] === '{') depth++;
    if (text[i] === '}' && --depth === 0) { close = i + 1; break; }
  }
  const value = JSON.parse(text.slice(open, close));
  if (value.v !== 1 || !Number.isInteger(value.pid) || !Number.isInteger(value.win) ||
      ![value.bounds, value.pad].every(a => Array.isArray(a) && a.length === 4 && a.every(Number.isFinite)) ||
      value.bounds[2] <= 0 || value.bounds[3] <= 0 || value.pad[2] <= 0 || value.pad[3] <= 0) {
    throw Error('Invalid live drag geometry');
  }
  if (!image) return value;
  let width, height;
  if (image[0] === 137 && image[1] === 80) {
    width = ((image[16] << 24) | (image[17] << 16) | (image[18] << 8) | image[19]) >>> 0;
    height = ((image[20] << 24) | (image[21] << 16) | (image[22] << 8) | image[23]) >>> 0;
  } else if (image[0] === 255 && image[1] === 216) {
    for (let offset = 2; offset + 9 < image.length;) {
      if (image[offset] !== 255) { offset++; continue; }
      const type = image[offset + 1];
      if ([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(type)) {
        height = image[offset + 5] * 256 + image[offset + 6];
        width = image[offset + 7] * 256 + image[offset + 8]; break;
      }
      if (type === 218 || type === 217) break;
      offset += 2 + image[offset + 2] * 256 + image[offset + 3];
    }
  }
  if (!width || !height || Math.abs(height - width * value.bounds[3] / value.bounds[2]) > 2) {
    throw Error('Drag screenshot and live window geometry do not match');
  }
  return { ...value, imageSize: [width, height], scaleX: width / value.bounds[2], scaleY: height / value.bounds[3] };
}
