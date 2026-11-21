// The link page for any chat assistant (feedback.b, 21 November 2026). The message arrives in the link as
// #m=<percent-encoded text>; it never reaches a server and leaves the address bar at once. Grace checks it and
// presses Send: it is sealed here to the agent's public key (sgit hybrid envelope v2) and appended to the
// grace-chatgpt lane. It is not signed: the agent treats it as notes and confirms with Grace before acting.
(() => {
  'use strict'
  const $ = s => document.querySelector(s)
  const b64 = bytes => { let s = ''; for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b); return btoa(s) }
  const unpem = pem => Uint8Array.from(atob(pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '')), c => c.charCodeAt(0))
  const say = (t, cls) => { $('#status').textContent = t; $('#status').className = cls || '' }
  let CFG = null

  const m = location.hash.match(/(?:^#|&)m=([^&]*)/)
  if (m) { try { $('#text').value = decodeURIComponent(m[1].replace(/\+/g, ' ')) } catch { $('#text').value = m[1] } history.replaceState(null, '', location.pathname) }

  // sgit hybrid envelope v2: fresh AES-256-GCM key, wrapped with RSA-OAEP-SHA256 to the agent's public key.
  async function seal(pem, text) {
    const S = crypto.subtle
    const pub = await S.importKey('spki', unpem(pem), { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt'])
    const aes = await S.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt'])
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const c = await S.encrypt({ name: 'AES-GCM', iv, tagLength: 128 }, aes, new TextEncoder().encode(text))
    const w = await S.encrypt({ name: 'RSA-OAEP' }, pub, await S.exportKey('raw', aes))
    return btoa(JSON.stringify({ v: 2, w: b64(w), i: b64(iv), c: b64(c) }))
  }

  async function send() {
    const text = $('#text').value.trim()
    if (!text) return say('Write something first.', 'bad')
    if (!CFG) return say('This page could not load the inbox details. Reload and try again.', 'bad')
    $('#send').disabled = true; say('Encrypting and sending…')
    try {
      const msg = { type: 'sws.link/v1', site: CFG.site, via: 'link', sent_at: new Date().toISOString(), text }
      const env = await seal(CFG.recipient.encrypt, JSON.stringify(msg))
      const r = await fetch(`${CFG.endpoint}/api/vault/append/write/${CFG.vault_id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ append_token: CFG.append_token, payload: btoa(env) }), credentials: 'omit' })
      if (!r.ok) throw new Error(r.status === 413 ? 'the message is too long' : `the inbox answered ${r.status}`)
      $('#text').value = ''; say('Sent. The agent will reply on your site.', 'ok')
    } catch (e) { say('Not sent: ' + e.message + '. Try again in a minute.', 'bad'); $('#send').disabled = false }
  }

  fetch('inbox.json', { cache: 'no-store' }).then(r => r.json()).then(c => { CFG = c })
    .catch(() => say('This page could not load the inbox details.', 'bad'))
  $('#send').addEventListener('click', send)
})()
