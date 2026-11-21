// SWS messaging centre (feedback.b, 21 Nov 2026). A right-hand pane on every page: it pushes the page left and can be
// resized. Get in by dropping or pasting the QR code image (or pasting its link); after that this browser holds its own
// key pair and talks to the site agent through the agent's inbox. Answers come on the agent's rounds, not live, so the
// pane is a slow inbox: every request shows where it stands and when the agent next checks.
//
// <link rel="stylesheet" href="/send/sws-inbox.css">
// <script type="module" src="/send/qrimage.mjs"></script> <script src="/send/sws-inbox.js" data-base="/send/" defer></script>
//
// Shares storage with /send/ (same keys, same list), so a browser that used /send/ keeps its key and history here.
// Kept on this device only: the QR code's lane token and the agent key's fingerprint, this browser's key pair (private
// halves non-extractable, IndexedDB), the pane width, and the list of requests sent from here with their answers.
(() => {
  'use strict'
  const me = document.currentScript
  const BASE = (me && me.dataset.base) || '/send/'
  const ROUNDS = [1, 4, 7, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22], ROUND_MIN = 7   // UK time
  const S = crypto.subtle, te = new TextEncoder(), td = new TextDecoder()
  const b64 = bytes => { let s = ''; for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b); return btoa(s) }
  const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0))
  const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
  const unpem = pem => unb64(pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, ''))
  let CFG = null, ST = null, KEYS = null, ui = {}

  // ---------- storage ----------
  const STORE = () => 'sws-send:' + CFG.site
  const load = () => { try { return JSON.parse(localStorage.getItem(STORE())) || { items: [] } } catch { return { items: [] } } }
  const save = () => { try { localStorage.setItem(STORE(), JSON.stringify(ST)) } catch { } }
  const pref = (k, v) => { try { if (v === undefined) return localStorage.getItem('sws-pane:' + k); localStorage.setItem('sws-pane:' + k, v) } catch { } }
  const idb = () => new Promise((ok, no) => { const r = indexedDB.open('sws-send', 1); r.onupgradeneeded = () => r.result.createObjectStore('keys'); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error) })
  const tx = async (mode, fn) => { const db = await idb(); return new Promise((ok, no) => { const t = db.transaction('keys', mode), r = fn(t.objectStore('keys')); t.oncomplete = () => ok(r && r.result); t.onerror = () => no(t.error) }) }

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

  // ---------- crypto (unchanged from /send/) ----------
  async function seal(pem, text) {
    const pub = await S.importKey('spki', unpem(pem), { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt'])
    const aes = await S.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt'])
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const c = await S.encrypt({ name: 'AES-GCM', iv, tagLength: 128 }, aes, te.encode(text))
    const w = await S.encrypt({ name: 'RSA-OAEP' }, pub, await S.exportKey('raw', aes))
    return btoa(JSON.stringify({ v: 2, w: b64(w), i: b64(iv), c: b64(c) }))
  }
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

  // ---------- the QR code: an image dropped, pasted or chosen, or its text ----------
  function parseCode(text) {
    text = String(text || '').trim()
    let k = (text.match(/[#&?]k=([0-9a-f]{64})/) || [])[1], f = (text.match(/[#&?]f=([0-9a-f]{16})/) || [])[1]
    if (!k) { try { const c = JSON.parse(text); if (/^[0-9a-f]{64}$/.test(c.k) && /^[0-9a-f]{16}$/.test(c.f)) { k = c.k; f = c.f } } catch { } }
    return k && f ? { k, f } : null
  }
  // The QR image: read as on pki.sgit.ai, the browser's own detector or the vendored reader (qrimage.mjs), not jsQR
  // (grace.b, at Dinis's word, 21 Nov 2026).
  async function readImage(file) {
    if (!window.swsReadQr) throw new Error('the QR reader did not load; paste the link instead')
    try { return await window.swsReadQr(file) } catch { throw new Error('no QR code found in that image; try a sharper picture, or paste the link') }
  }
  async function connect(text) {
    const c = parseCode(text)
    if (!c) throw new Error('that is not this site\'s QR code')
    ST.k = c.k; ST.f = c.f; save()
    if (!(await recipientOk())) { delete ST.k; delete ST.f; save(); throw new Error('this QR code is for a different agent key; ask for a new one') }
    await start()
  }

  // ---------- when the agent next reads its inbox (UK time) ----------
  function nextRound() {
    const now = new Date()
    for (let add = 0; add < 26 * 60; add += 1) {
      const t = new Date(now.getTime() + add * 60000)
      const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(t).map(x => [x.type, x.value]))
      if (+p.minute === ROUND_MIN && ROUNDS.includes(+p.hour)) return { at: t, label: `${p.hour}:${p.minute}` }
    }
    return null
  }
  const localTime = iso => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  // ---------- send and refresh ----------
  async function send() {
    const text = ui.text.value.trim()
    if (!text) return say('Write a request first.', 'bad')
    ui.send.disabled = true; say('Encrypting and sending…')
    try {
      if (!(await recipientOk())) throw new Error("the agent's key on this site does not match your QR code")
      const id = hex(crypto.getRandomValues(new Uint8Array(8))), page = location.pathname
      const items_json = JSON.stringify({ type: 'sws.link/v2', id, site: CFG.site, page, sent_at: new Date().toISOString(), text })
      const sig = await S.sign({ name: 'ECDSA', hash: 'SHA-256' }, KEYS.sig, te.encode(items_json))
      const outer = { type: 'sws.link/v2', site: CFG.site, browser: { fp: KEYS.fp, sign: KEYS.pub.sign, enc: KEYS.pub.enc },
                      signed: { alg: 'ECDSA-P256-SHA256-P1363', sig: b64(sig) }, items_json }
      const r = await fetch(`${CFG.endpoint}/api/vault/append/write/${CFG.vault_id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ append_token: ST.k, payload: btoa(await seal(CFG.recipient.encrypt, JSON.stringify(outer))) }), credentials: 'omit' })
      if (r.status === 404) throw new Error('this QR code no longer works; ask for a new one')
      if (!r.ok) throw new Error(r.status === 413 ? 'the request is too long' : `the inbox answered ${r.status}`)
      ST.items.unshift({ id, time: new Date().toISOString(), page, preview: text.slice(0, 2000), state: 'sent', answer: null }); save()
      ui.text.value = ''; say('Sent. You can add more requests; each gets its own answer.', 'ok'); renderThread(true)
    } catch (e) { say('Not sent: ' + e.message + '.', 'bad') } finally { ui.send.disabled = false }
  }
  async function refresh() {
    if (!KEYS || !ST.items.length) return
    try {
      const r = await fetch(`${BASE}replies/${KEYS.fp}.json`, { cache: 'no-store' }); if (!r.ok) return
      let changed = false
      for (const env of await r.json()) {
        try {
          const m = await openReply(env), it = ST.items.find(i => i.id === m.re_id); if (!it) continue
          const RANK = { sent: 0, received: 1, 'acted on': 2, answered: 3 }
          if (m.state === 'received' && m.at && it.received_at !== m.at) { it.received_at = m.at; changed = true }
          if (m.state in RANK && RANK[m.state] > (RANK[it.state] || 0)) { it.state = m.state; changed = true }
          if (typeof m.text === 'string' && m.text && it.answer !== m.text) { it.answer = m.text.slice(0, 8000); it.answered_at = m.at; changed = true }
        } catch { }
      }
      if (changed) { save(); renderThread() }
    } catch { }
  }

  // ---------- UI ----------
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e }
  function say(t, kind) { if (!ui.status) return; ui.status.textContent = t; ui.status.className = 'sws-status' + (kind ? ' sws-' + kind : '') }
  const CHIP = { sent: ['waiting', 'Waiting for the agent'], received: ['received', 'Received by the agent'], 'acted on': ['done', 'Done'], answered: ['done', 'Answered'] }

  function renderThread(scroll) {
    const box = ui.thread; box.replaceChildren()
    const items = [...ST.items].reverse()   // oldest first, newest at the bottom, like a conversation
    if (!items.length) { box.append(el('p', 'sws-muted sws-empty', 'No requests yet. Write one below: a change you want, a question, anything about this page or the site.')); }
    for (const it of items) {
      const t = el('div', 'sws-thread')
      t.append(el('div', 'sws-mine', it.preview))
      const meta = el('div', 'sws-meta sws-r'); const [cls, words] = CHIP[it.state] || CHIP.sent
      const when = it.state === 'received' && it.received_at ? ' ' + localTime(it.received_at) : ''
      meta.append(el('span', '', localTime(it.time) + (it.page && it.page !== '/' ? ' · ' + it.page : '') + ' ·'), el('span', 'sws-chip sws-' + cls, words + when))
      t.append(meta)
      if (it.answer) { t.append(el('div', 'sws-agent', it.answer)); t.append(el('div', 'sws-meta', CFG.agent_name + (it.answered_at ? ' · ' + localTime(it.answered_at) : ''))) }
      box.append(t)
    }
    const waiting = ST.items.filter(i => i.state === 'sent').length, nr = nextRound()
    ui.next.textContent = (waiting ? `${waiting} waiting. ` : '') + (nr ? `The agent next checks its inbox at about ${nr.label} UK time, then hourly from 10:00 to 22:00.` : 'The agent checks its inbox hourly from 10:00 to 22:00 UK time.')
    ui.count.textContent = waiting; ui.count.hidden = !waiting
    if (scroll) ui.body.scrollTop = ui.body.scrollHeight
  }

  function renderConnect() {
    ui.body.replaceChildren(); ui.foot.hidden = true
    const drop = el('div', 'sws-drop')
    drop.append(el('strong', '', 'Drop your QR code here'), el('p', 'sws-muted', 'Drop or paste the QR code image you were sent, or paste its link. You only do this once on this device.'))
    const row = el('div', 'sws-row'), pick = el('button', 'sws-btn', 'Choose image'), file = el('input')
    file.type = 'file'; file.accept = 'image/*'; file.hidden = true; file.id = 'sws-file'
    pick.type = 'button'; pick.onclick = () => file.click(); row.append(pick, file); drop.append(row)
    const link = el('input'); link.type = 'text'; link.id = 'sws-link'; link.placeholder = 'or paste the link here'; link.setAttribute('aria-label', 'QR code link')
    const st = el('p', 'sws-status'); ui.status = st
    const go = async src => { try { say('Reading the QR code…'); await connect(src instanceof Blob ? await readImage(src) : src) } catch (e) { say(e.message + '.', 'bad') } }
    file.onchange = () => file.files[0] && go(file.files[0])
    link.addEventListener('input', () => { if (parseCode(link.value)) go(link.value) })
    drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('sws-over') })
    drop.addEventListener('dragleave', () => drop.classList.remove('sws-over'))
    drop.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('sws-over'); const f = e.dataTransfer.files[0]; if (f) go(f); else go(e.dataTransfer.getData('text')) })
    ui.onPaste = e => { const f = [...(e.clipboardData?.files || [])][0]; if (f) { e.preventDefault(); go(f) } else { const t = e.clipboardData?.getData('text'); if (parseCode(t)) { e.preventDefault(); go(t) } } }
    ui.body.append(drop, link, st)
    ui.who.textContent = ''
  }

  function renderInbox() {
    ui.onPaste = null
    ui.body.replaceChildren(); ui.foot.hidden = false
    ui.next = el('p', 'sws-next'); ui.thread = el('div', ''); ui.thread.style.display = 'grid'; ui.thread.style.gap = '14px'
    ui.body.append(ui.next, ui.thread)
    ui.who.textContent = 'This device: ' + KEYS.fp.slice(0, 8)
    ui.status = ui.footStatus
    renderThread(true)
  }

  function build() {
    const toggle = el('button', 'sws-toggle'); toggle.type = 'button'; toggle.append(el('span', '', 'Messages'))
    ui.count = el('span', 'sws-count', '0'); ui.count.hidden = true; toggle.append(ui.count)
    const pane = el('aside', 'sws-pane'); pane.setAttribute('aria-label', 'Messages with the site agent')
    const grip = el('div', 'sws-grip'); grip.tabIndex = 0; grip.setAttribute('role', 'separator'); grip.setAttribute('aria-label', 'Resize the messages pane'); grip.setAttribute('aria-orientation', 'vertical')
    const head = el('div', 'sws-head'); const h = el('h2', '', 'Messages'); ui.who = el('span', 'sws-muted')
    const x = el('button', 'sws-x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Close messages'); head.append(h, ui.who, x)
    ui.body = el('div', 'sws-body')
    ui.foot = el('div', 'sws-foot')
    ui.text = el('textarea'); ui.text.id = 'sws-text'; ui.text.rows = 3; ui.text.maxLength = 8000; ui.text.placeholder = 'Write a request. Ctrl+Enter to send.'
    ui.text.setAttribute('aria-label', 'Your request')
    const row = el('div', 'sws-row'); ui.send = el('button', 'sws-btn', 'Send'); ui.send.type = 'button'
    const forget = el('button', 'sws-btn sws-quiet', 'Forget this device'); forget.type = 'button'
    row.append(ui.send, forget); ui.footStatus = el('p', 'sws-status')
    const note = el('p', 'sws-muted', 'Encrypted and signed on this device. It keeps your requests and answers here so you can follow them; nothing else leaves it. No cookies.')
    ui.foot.append(ui.text, row, ui.footStatus, note)
    pane.append(grip, head, ui.body, ui.foot)
    document.body.append(toggle, pane)

    const setW = w => { const max = Math.max(300, Math.round(window.innerWidth * 0.7)); w = Math.max(300, Math.min(max, w)); document.documentElement.style.setProperty('--sws-w', w + 'px')
      grip.setAttribute('aria-valuemin', '300'); grip.setAttribute('aria-valuemax', String(max)); grip.setAttribute('aria-valuenow', String(w)); return w }   // a focusable separator needs its value (axe)
    setW(+pref('w') || 380)
    const open = v => { document.documentElement.classList.toggle('sws-open', v); pref('open', v ? '1' : '0'); if (v) { refresh(); (KEYS ? ui.text : ui.body).focus?.() } }
    toggle.onclick = () => open(true); x.onclick = () => open(false)
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.documentElement.classList.contains('sws-open')) open(false) })
    grip.addEventListener('pointerdown', e => {
      grip.setPointerCapture(e.pointerId); document.body.style.transition = 'none'
      const move = ev => pref('w', setW(window.innerWidth - ev.clientX))
      const up = () => { grip.removeEventListener('pointermove', move); grip.removeEventListener('pointerup', up); document.body.style.transition = '' }
      grip.addEventListener('pointermove', move); grip.addEventListener('pointerup', up)
    })
    grip.addEventListener('keydown', e => { const cur = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sws-w')) || 380
      if (e.key === 'ArrowLeft') pref('w', setW(cur + 24)); if (e.key === 'ArrowRight') pref('w', setW(cur - 24)) })
    ui.send.onclick = send
    ui.text.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) send() })
    forget.onclick = async () => { try { localStorage.removeItem(STORE()) } catch { } try { await tx('readwrite', s => s.delete('me:' + CFG.site)) } catch { } location.reload() }
    document.addEventListener('paste', e => { if (ui.onPaste && document.documentElement.classList.contains('sws-open')) ui.onPaste(e) })
    ui.open = open
  }

  async function start() {
    try { KEYS = await browserKeys() } catch { return say('This browser cannot keep a key (a private window?). Use a normal window.', 'bad') }
    renderInbox(); refresh()
  }

  async function main() {
    try { CFG = await (await fetch(BASE + 'inbox.json', { cache: 'no-store' })).json() } catch { return }
    CFG.agent_name = CFG.agent_name || "Site agent"
    ST = load(); build()
    // a link from the QR code or from ChatGPT: #k=…&f=…[&m=…]
    const h = location.hash, c = parseCode(h), m = (h.match(/(?:^#|&)m=([^&]*)/) || [])[1]
    if (c) { ST.k = c.k; ST.f = c.f; save() }
    if (h && (c || m)) history.replaceState(null, '', location.pathname + location.search)
    if (ST.k && ST.f) { await start(); if (m) { try { ui.text.value = decodeURIComponent(m.replace(/\+/g, ' ')) } catch { ui.text.value = m } } }
    else renderConnect()
    ui.open(pref('open') === '1' || !!c || !!m)
    setInterval(refresh, 60000); document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh() })
  }
  window.addEventListener('hashchange', () => { if (/(?:^#|&)(k|m)=/.test(location.hash)) location.reload() })
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', main); else main()
})()
