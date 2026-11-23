"""Fetch, once and politely, the data for the venue pages: a freely licensed photo of each venue from its Wikimedia
Commons category, and places within about 600 m from OpenStreetMap (Nominatim). Writes tools/data/venues-extra.json and
site/images/venues/<slug>-<w>.webp. Run by hand: python3 tools/fetch_venue_data.py   (needs Pillow). Every item keeps
its source, licence and the date it was read, so nothing on the pages is from memory.
Nominatim usage policy: at most one request a second, a named user agent, attribution to OpenStreetMap contributors."""
import json, time, re, io, datetime, urllib.parse, urllib.request, math, sys
from PIL import Image
UA = {'User-Agent': 'grace-farrell-site-build/1.0 (static artist site; github.com/SovereignWebsite/Site__Artist__Grace-Farrell)'}
TODAY = datetime.date.today().isoformat()
FREE = re.compile(r'^(CC BY(-SA)? [0-9.]+|CC0|Public domain|PD|CC BY-SA [0-9.]+ .*|CC BY [0-9.]+ .*)', re.I)
def get(url, tries=5):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r: return r.read()
        except Exception as e:
            if i == tries - 1: raise
            time.sleep(4 * (i + 1))
def commons(params):
    return json.loads(get('https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode({'format': 'json', **params})))
def strip(h): return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', h or '')).strip()
def slug(t): return re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')
def photo(v):
    cats = commons({'action': 'query', 'list': 'search', 'srsearch': f'{v["venue"]} {v["town"]}', 'srnamespace': 14, 'srlimit': 8})['query']['search']
    words = [w for w in re.findall(r'[a-z]+', v['venue'].lower()) if w not in ('the', 'theatre', 'house')] or ['theatre']
    cats = [c['title'] for c in cats if all(w in c['title'].lower() for w in words[:2]) and not re.search(r'interior|stage|auditorium', c['title'], re.I)]
    for cat in cats[:3]:
        time.sleep(1)
        d = commons({'action': 'query', 'generator': 'categorymembers', 'gcmtitle': cat, 'gcmtype': 'file', 'gcmlimit': 30, 'prop': 'imageinfo', 'iiprop': 'url|extmetadata|size|mime', 'iiurlwidth': 1400})
        pages = sorted(d.get('query', {}).get('pages', {}).values(), key=lambda p: p['title'])
        for p in pages:
            ii = p['imageinfo'][0]; m = ii['extmetadata']; lic = strip(m.get('LicenseShortName', {}).get('value'))
            if ii['mime'] != 'image/jpeg' or ii['width'] < 1000 or ii['width'] < ii['height'] or not FREE.match(lic): continue
            if re.search(r'interior|inside|auditorium|stage|ceiling|plaque|sign|programme|poster|seat', p['title'], re.I): continue
            return {'file': p['title'], 'page': ii['descriptionurl'], 'thumb': ii['thumburl'], 'licence': lic,
                    'licence_url': strip(m.get('LicenseUrl', {}).get('value')), 'author': strip(m.get('Artist', {}).get('value')) or 'Unknown',
                    'category': cat, 'read': TODAY}
    return None
KINDS = [('cafe', 'Café'), ('museum', 'Museum'), ('gallery', 'Gallery'), ('park', 'Park'), ('attraction', 'Attraction'), ('bookshop', 'Bookshop')]
def nearby(v):
    out, seen, d = [], set(), 0.006
    box = f'{v["lon"]-d*1.6},{v["lat"]+d},{v["lon"]+d*1.6},{v["lat"]-d}'
    for q, label in KINDS:
        time.sleep(1.1)
        res = json.loads(get('https://nominatim.openstreetmap.org/search?' + urllib.parse.urlencode({'q': f'[{q}]', 'viewbox': box, 'bounded': 1, 'format': 'jsonv2', 'limit': 6, 'extratags': 1})))
        for r in res:
            name = r.get('name') or ''
            if not name or name in seen: continue
            la, lo = float(r['lat']), float(r['lon'])
            dist = 6371000 * 2 * math.asin(math.sqrt(math.sin(math.radians(la - v['lat']) / 2) ** 2 + math.cos(math.radians(v['lat'])) * math.cos(math.radians(la)) * math.sin(math.radians(lo - v['lon']) / 2) ** 2))
            seen.add(name)
            out.append({'name': name, 'kind': label, 'osm': f'https://www.openstreetmap.org/{r["osm_type"]}/{r["osm_id"]}', 'metres': round(dist / 10) * 10, 'website': (r.get('extratags') or {}).get('website')})
    out.sort(key=lambda x: x['metres'])
    return {'places': out[:14], 'read': TODAY, 'source': 'OpenStreetMap contributors, via Nominatim'}
def main():
    tour = json.load(open('tools/data/tour.json'))
    try: extra = json.load(open('tools/data/venues-extra.json'))
    except FileNotFoundError: extra = {}
    only = sys.argv[1:]
    for v in tour['venues']:
        s = slug(v['town'])
        if only and s not in only: continue
        e = extra.get(s, {})
        print(s, flush=True)
        try:
            ph = photo(v)
            if ph:
                img = Image.open(io.BytesIO(get(ph['thumb']))).convert('RGB')
                for w in (1400, 640):
                    x = img if img.width <= w else img.resize((w, round(img.height * w / img.width)), Image.LANCZOS)
                    x.save(f'site/images/venues/{s}-{w}.webp', 'WEBP', quality=78, method=6)
                ph['size'] = list(img.size)
                del ph['thumb']
            e['photo'] = ph
        except Exception as ex: print('  photo failed:', ex)
        try: e['nearby'] = nearby(v)
        except Exception as ex: print('  nearby failed:', ex)
        extra[s] = e
        json.dump(extra, open('tools/data/venues-extra.json', 'w'), indent=1, ensure_ascii=False)
if __name__ == '__main__': main()
