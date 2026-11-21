// SWS send page (feedback.b, 21 Nov 2026). Dinis: no anonymous messages; the QR code gives the lane and the agent's key;
// each browser makes its own key pair, signs what it sends and sends its public key, so the site can name this browser
// and replies can be sealed to it.
// Link from the QR code: /send/#k=<lane token>&f=<agent key fingerprint>[&m=<percent-encoded message>]
// Kept on this device only: the lane token and fingerprint, this browser's key pair (private half non-extractable, in
// IndexedDB), and the list of messages sent from here with their replies. "Forget this device" removes all of it.
(() => {
  'use strict'
  const $ = s => document.querySelector(s)
  const S = crypto.subtle, te = new TextEncoder(), td = new TextDecoder()
  const b64 = bytes => { let s = ''; for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b); return btoa(s) }
  const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0))
  const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
  const unpem = pem => unb64(pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, ''))
  const say = (t, cls) => { $('#status').textContent = t; $('#status').className = cls || '' }
  let CFG = null, ST = null, KEYS = null

  // --- storage: local storage for the small list, IndexedDB for the keys ---
  const STORE = () => 'sws-send:' + (CFG ? CFG.site : 'site')
  const load = () => { try { return JSON.parse(localStorage.getItem(STORE())) || { items: [] } } catch { return { items: [] } } }
  const save = () => { try { localStorage.setItem(STORE(), JSON.stringify(ST)) } catch { } }
  const idb = () => new Promise((ok, no) => { const r = indexedDB.open('sws-send', 1); r.onupgradeneeded = () => r.result.createObjectStore('keys'); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error) })
  const tx = async (mode, fn) => { const db = await idb(); return new Promise((ok, no) => { const t = db.transaction('keys', mode), r = fn(t.objectStore('keys')); t.oncomplete = () => ok(r && r.result); t.onerror = () => no(t.error) }) }

  // This browser's key pair: ECDSA P-256 to sign, ECDH P-256 for replies. Private halves cannot be copied out.
  async function browserKeys() {
    const name = 'me:' + CFG.site
    let k = await tx('readonly', s => s.get(name))
    if (!k) {
      const sig = await S.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify'])
      const enc = await S.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits'])
      const pub = { sign: await S.exportKey('jwk', sig.publicKey), enc: await S.exportKey('jwk', enc.publicKey) }
      for (const j of [pub.sign, pub.enc]) { delete j.key_ops; delete j.ext }
      const fp = hex(await S.digest('SHA-256', await S.exportKey('spki', sig.publicKey))).slice(0, 16)
      k = { sig: sig.privateKey, enc: enc.privateKey, pub, fp, made: new Date().toISOString() }
      await tx('readwrite', s => s.put(k, name))
    }
    return k
  }

  // sgit hybrid envelope v2 to the agent's key (byte-compatible with PKI__Crypto.hybrid_decrypt).
  async function seal(pem, text) {
    const pub = await S.importKey('spki', unpem(pem), { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt'])
    const aes = await S.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt'])
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const c = await S.encrypt({ name: 'AES-GCM', iv, tagLength: 128 }, aes, te.encode(text))
    const w = await S.encrypt({ name: 'RSA-OAEP' }, pub, await S.exportKey('raw', aes))
    return btoa(JSON.stringify({ v: 2, w: b64(w), i: b64(iv), c: b64(c) }))
  }

  // Replies sealed to this browser's ECDH key (ws-ecies-1, as on Kate's site).
  async function openReply(env) {
    const epk = await S.importKey('jwk', env.epk, { name: 'ECDH', namedCurve: 'P-256' }, false, [])
    const bits = await S.deriveBits({ name: 'ECDH', public: epk }, KEYS.enc, 256)
    const hk = await S.importKey('raw', bits, 'HKDF', false, ['deriveKey'])
    const key = await S.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: te.encode('ws-ecies-1') }, hk, { name: 'AES-GCM', length: 256 }, false, ['decrypt'])
    return JSON.parse(td.decode(await S.decrypt({ name: 'AES-GCM', iv: unb64(env.iv) }, key, unb64(env.ct))))
  }

  async function recipientOk() {
    const fp = hex(await S.digest('SHA-256', unpem(CFG.recipient.encrypt))).slice(0, 16)
    return fp === ST.f && ('sha256:' + fp) === CFG.recipient.fingerprint
  }

  async function send() {
    const text = $('#text').value.trim()
    if (!text) return say('Write something first.', 'bad')
    $('#send').disabled = true; say('Encrypting and sending…')
    try {
      if (!(await recipientOk())) throw new Error("the agent's key on this site does not match your QR code")
      const id = hex(crypto.getRandomValues(new Uint8Array(8)))
      const items_json = JSON.stringify({ type: 'sws.link/v2', id, site: CFG.site, sent_at: new Date().toISOString(), text })
      const sig = await S.sign({ name: 'ECDSA', hash: 'SHA-256' }, KEYS.sig, te.encode(items_json))
      const outer = { type: 'sws.link/v2', site: CFG.site, browser: { fp: KEYS.fp, sign: KEYS.pub.sign, enc: KEYS.pub.enc },
                      signed: { alg: 'ECDSA-P256-SHA256-P1363', sig: b64(sig) }, items_json }
      const r = await fetch(`${CFG.endpoint}/api/vault/append/write/${CFG.vault_id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ append_token: ST.k, payload: btoa(await seal(CFG.recipient.encrypt, JSON.stringify(outer))) }), credentials: 'omit' })
      if (r.status === 404) throw new Error('this QR code no longer works; ask for a new one')
      if (!r.ok) throw new Error(r.status === 413 ? 'the message is too long' : `the inbox answered ${r.status}`)
      ST.items.unshift({ id, time: new Date().toISOString(), preview: text.slice(0, 200), state: 'sent', answer: null }); save()
      $('#text').value = ''; say('Sent. The answer will appear below, on this device only.', 'ok'); render()
    } catch (e) { say('Not sent: ' + e.message + '.', 'bad') } finally { $('#send').disabled = false }
  }

  async function refresh() {
    if (!ST.items.length) return
    try {
      const r = await fetch(`replies/${KEYS.fp}.json`, { cache: 'no-store' }); if (!r.ok) return
      for (const env of await r.json()) {
        try {
          const m = await openReply(env), it = ST.items.find(i => i.id === m.re_id)
          if (!it) continue
          if (['received', 'acted on', 'answered'].includes(m.state)) it.state = m.state
          if (typeof m.text === 'string' && m.text) it.answer = m.text.slice(0, 8000)
        } catch { }
      }
      save(); render()
    } catch { }
  }

  // A conversation: each message as a bubble, the agent's answer under it, in the visitor's own time (grace.b, at
  // Dinis's request, 21 Nov 2026: "improve the UX of this page").
  const LABEL = { 'sent': 'Sent, waiting for a reply', 'received': 'Received by the agent', 'acted on': 'Done', 'answered': 'Answered' }
  const when = t => { try { return new Date(t).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) } catch { return t } }
  function render() {
    const ol = $('#sent'); ol.replaceChildren()
    $('#history').hidden = !ST.items.length
    for (const it of [...ST.items].reverse()) {   // oldest first, newest next to the box below
      const li = document.createElement('li'); li.className = 'thread'
      const me = document.createElement('div'); me.className = 'bubble me'
      const body = document.createElement('p'); body.textContent = it.preview
      const meta = document.createElement('p'); meta.className = 'meta-line'
      const tm = document.createElement('time'); tm.dateTime = it.time; tm.textContent = when(it.time)
      const st = document.createElement('span'); st.className = 'state s-' + it.state.replace(' ', '-'); st.textContent = LABEL[it.state] || it.state
      meta.append(tm, ' · ', st); me.append(body, meta); li.append(me)
      if (it.answer) {
        const a = document.createElement('div'); a.className = 'bubble agent'
        const who = document.createElement('p'); who.className = 'who'; who.textContent = "Grace's site agent"
        const at = document.createElement('p'); at.textContent = it.answer
        a.append(who, at); li.append(a)
      }
      ol.append(li)
    }
  }

  async function main() {
    try { CFG = await (await fetch('inbox.json', { cache: 'no-store' })).json() } catch { return say('This page could not load the inbox details.', 'bad') }
    ST = load()
    const h = location.hash, get = n => { const m = h.match(new RegExp('(?:^#|&)' + n + '=([^&]*)')); return m ? m[1] : null }
    const k = get('k'), f = get('f'), m = get('m')
    if (k && /^[0-9a-f]{64}$/.test(k)) ST.k = k
    if (f && /^[0-9a-f]{16}$/.test(f)) ST.f = f
    if (m) { try { $('#text').value = decodeURIComponent(m.replace(/\+/g, ' ')) } catch { $('#text').value = m } }
    if (h) history.replaceState(null, '', location.pathname)   // nothing from the link stays in the address bar
    save()
    if (!ST.k || !ST.f) { $('#form').hidden = true; $('#nokey').hidden = false; return }
    try { KEYS = await browserKeys() } catch { return say('This browser cannot keep a key (private window?). Try a normal window.', 'bad') }
    $('#device').textContent = KEYS.fp
    $('#send').addEventListener('click', send)
    $('#forget').addEventListener('click', async () => {
      try { localStorage.removeItem(STORE()) } catch { }
      try { await tx('readwrite', s => s.delete('me:' + CFG.site)) } catch { }
      location.reload()
    })
    render(); refresh()
    // look for answers while the page is open, and whenever it comes back into view
    setInterval(refresh, 60000)
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh() })
  }
  // a second link opened in a tab already showing this page changes only the # part: read it as a fresh page
  window.addEventListener('hashchange', () => { if (/(?:^#|&)(k|m)=/.test(location.hash)) location.reload() })
  main()
})()
