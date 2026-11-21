import json, math, sys
topo = json.load(open(sys.argv[1]))
sc, tr = topo['transform']['scale'], topo['transform']['translate']
arcs = []
for a in topo['arcs']:
    x = y = 0; pts = []
    for dx, dy in a:
        x += dx; y += dy; pts.append((x*sc[0]+tr[0], y*sc[1]+tr[1]))
    arcs.append(pts)
def ring(idx):
    out = []
    for i in idx:
        pts = arcs[i] if i >= 0 else arcs[~i][::-1]
        out.extend(pts if not out else pts[1:])
    return out
W = 600; lon0, lon1, lat0, lat1 = -11, 2.2, 49.8, 61
k = math.cos(math.radians(55.5)); s = min(W/((lon1-lon0)*k), 760/(lat1-lat0))
P = lambda lo, la: (round((lo-lon0)*k*s, 1), round((lat1-la)*s, 1))
d = []
for g in topo['objects']['countries']['geometries']:
    if g.get('id') not in ('826', '372', '833'): continue
    polys = [g['arcs']] if g['type'] == 'Polygon' else g['arcs']
    for poly in polys:
        r = ring(poly[0])
        if len(r) < 6: continue
        prev = None; seg = []
        for lo, la in r:
            p = P(lo, la)
            if p == prev: continue
            prev = p; seg.append(f"{p[0]:g} {p[1]:g}")
        d.append('M' + 'L'.join(seg) + 'Z')
json.dump({'w': round((lon1-lon0)*k*s), 'h': round((lat1-lat0)*s), 'lon0': lon0, 'lat1': lat1, 'k': k, 's': s, 'd': ''.join(d)}, open(sys.argv[2], 'w'))
print('paths', len(d), 'chars', len(''.join(d)), 'w', round((lon1-lon0)*k*s), 'h', round((lat1-lat0)*s))
