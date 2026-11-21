// The text of the QR code in an image, as on pki.sgit.ai (assets/people/qrimage.js): the browser's own detector when
// it has one, else pki.sgit.ai's own reader, imported from pki.sgit.ai (it serves Access-Control-Allow-Origin: *) only
// at the moment someone drops a QR image, so ordinary page views never contact it. Dinis, 21 Nov 2026: "if you are
// going to import a JS, import one from one of our sites, like pki.sgit.ai". It reads byte-mode QR codes.
const READER = 'https://pki.sgit.ai/assets/people/qrread.js'
window.swsReadQr = async function (blob) {
  const bmp = await createImageBitmap(blob)
  if ('BarcodeDetector' in window) { try { const r = await new BarcodeDetector({ formats: ['qr_code'] }).detect(bmp); if (r[0] && r[0].rawValue) return r[0].rawValue } catch (e) { /* the reader below */ } }
  const { readQr } = await import(READER)
  const c = document.createElement('canvas'); c.width = bmp.width; c.height = bmp.height
  const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(bmp, 0, 0)
  const d = x.getImageData(0, 0, c.width, c.height).data, lum = new Uint8Array(c.width * c.height)
  for (let i = 0; i < lum.length; i++) lum[i] = Math.round(0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2])
  return readQr(lum, c.width, c.height)
}
