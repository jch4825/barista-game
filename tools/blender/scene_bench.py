"""
블렌더 시험 장면: 바닷가 카페의 작업대 (2026-10-29, docs/recipes.md 6장 Q-R7 '블렌더 미리 렌더')
- 오래된 2그룹 에스프레소 머신(스테인리스 + 초록 법랑 옆판) · 머그와 받침 · 스팀 피처 · 탬퍼 · 샷 잔
- 빛: 왼쪽 위 큰 창빛(주광) + 오른쪽 약한 채움 + 뒤쪽 테두리 빛. 반사는 블렌더에 든 실내 HDRI
- 쓰는 법: blender --background --factory-startup --python scene_bench.py -- <출력 폴더> <preview|full|bg|sprites|extract|shots_preview|shots|all>
- shots [extract,steam,pour,foam]: 동작마다 한 컷(샷 내리기 · 우유 데우기 · 붓기 · 거품 내기) 배경판 + 프레임 → tools/blender/shots_post.py 가 assets/shots/ 로
"""
import bpy, bmesh, math, os, sys, json
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = ARGS[0] if ARGS else os.path.abspath('blender_out')
MODE = ARGS[1] if len(ARGS) > 1 else 'preview'
os.makedirs(OUT, exist_ok=True)


def log(*a):
    print('[bench]', ' '.join(str(x) for x in a), flush=True)


def lin(hexs, a=1.0):
    """'#RRGGBB'(sRGB) → 선형 RGBA"""
    h = hexs.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple((x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4) for x in c) + (a,)


scene = bpy.context.scene
for ob in list(bpy.data.objects):
    bpy.data.objects.remove(ob, do_unlink=True)
for blocks in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.lights, bpy.data.cameras):
    for b in list(blocks):
        blocks.remove(b)

COLL = {}


def coll(name):
    if name not in COLL:
        c = bpy.data.collections.new(name)
        scene.collection.children.link(c)
        COLL[name] = c
    return COLL[name]


def obj(name, data, mat=None, loc=(0, 0, 0), c='set', rot=(0, 0, 0), scale=(1, 1, 1)):
    ob = bpy.data.objects.new(name, data)
    coll(c).objects.link(ob)
    ob.location = loc
    ob.rotation_euler = rot
    ob.scale = scale
    if mat is not None:
        data.materials.append(mat)
    return ob


def look(ob, target):
    ob.rotation_euler = (Vector(target) - ob.location).to_track_quat('-Z', 'Y').to_euler()


# ------------------------------------------------------------------ 재질
SOCK = {'color': 'Base Color', 'rough': 'Roughness', 'metal': 'Metallic', 'coat': 'Coat Weight', 'coat_rough': 'Coat Roughness',
        'sss': 'Subsurface Weight', 'aniso': 'Anisotropic', 'spec': 'Specular IOR Level', 'trans': 'Transmission Weight', 'ior': 'IOR'}


def new_mat(name):
    m = bpy.data.materials.new(name)
    try:
        m.use_nodes = True
    except Exception:
        pass
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    out.location = (600, 0)
    b = nt.nodes.new('ShaderNodeBsdfPrincipled')
    b.location = (300, 0)
    nt.links.new(b.outputs['BSDF'], out.inputs['Surface'])
    return m, nt, b


def S(b, **kw):
    for k, v in kw.items():
        name = SOCK[k]
        if name in b.inputs:
            b.inputs[name].default_value = v
        else:
            log('없는 입력', name)


def basic(name, color, **kw):
    m, nt, b = new_mat(name)
    S(b, color=color, **kw)
    return m


def map_range(N, a0, a1, b0, b1):
    mr = N.new('ShaderNodeMapRange')
    mr.inputs['From Min'].default_value = a0
    mr.inputs['From Max'].default_value = a1
    mr.inputs['To Min'].default_value = b0
    mr.inputs['To Max'].default_value = b1
    return mr


def ramp2(N, c0, c1, p0=0.0, p1=1.0):
    r = N.new('ShaderNodeValToRGB')
    e = r.color_ramp.elements
    e[0].color, e[0].position = c0, p0
    e[1].color, e[1].position = c1, p1
    return r


def mat_wood(name, light, dark, plank=(0.9, 0.11), grain=36.0, rough=0.42, seams=True, axis='X', offset=(0.0, -3.0, 1.0), bump_k=0.35):
    """참나무: 나이테(축에서 비껴 둔 동심원 → 윗면·앞면 모두 결이 길게) + 판자마다 다른 밝기 + 이음매 홈"""
    m, nt, b = new_mat(name)
    N, L = nt.nodes, nt.links
    tc = N.new('ShaderNodeTexCoord')
    mp = N.new('ShaderNodeMapping')
    mp.inputs['Location'].default_value = offset
    L.new(tc.outputs['Object'], mp.inputs['Vector'])
    wave = N.new('ShaderNodeTexWave')
    wave.wave_type = 'RINGS'
    wave.rings_direction = axis
    wave.inputs['Scale'].default_value = grain
    wave.inputs['Distortion'].default_value = 2.6
    wave.inputs['Detail'].default_value = 4.0
    wave.inputs['Detail Scale'].default_value = 1.3
    L.new(mp.outputs['Vector'], wave.inputs['Vector'])
    ramp = ramp2(N, lin(dark), lin(light), 0.1, 0.9)
    L.new(wave.outputs['Fac'], ramp.inputs['Fac'])
    color_out = ramp.outputs['Color']
    height = wave.outputs['Fac']
    if seams:
        br = N.new('ShaderNodeTexBrick')
        br.offset = 0.37
        br.inputs['Scale'].default_value = 1.0
        br.inputs['Mortar Size'].default_value = 0.0012
        br.inputs['Mortar Smooth'].default_value = 0.4
        br.inputs['Brick Width'].default_value = plank[0]
        br.inputs['Row Height'].default_value = plank[1]
        br.inputs['Color1'].default_value = (1, 1, 1, 1)
        br.inputs['Color2'].default_value = (0.8, 0.76, 0.72, 1)
        br.inputs['Mortar'].default_value = (0.35, 0.3, 0.26, 1)
        L.new(tc.outputs['Object'], br.inputs['Vector'])
        mul = N.new('ShaderNodeVectorMath')
        mul.operation = 'MULTIPLY'
        L.new(ramp.outputs['Color'], mul.inputs[0])
        L.new(br.outputs['Color'], mul.inputs[1])
        color_out = mul.outputs['Vector']
        inv = N.new('ShaderNodeMath')
        inv.operation = 'SUBTRACT'
        inv.inputs[0].default_value = 1.0
        L.new(br.outputs['Fac'], inv.inputs[1])
        hm = N.new('ShaderNodeMath')
        hm.operation = 'MULTIPLY_ADD'
        L.new(wave.outputs['Fac'], hm.inputs[0])
        hm.inputs[1].default_value = 0.06
        L.new(inv.outputs['Value'], hm.inputs[2])
        height = hm.outputs['Value']
    L.new(color_out, b.inputs['Base Color'])
    bump = N.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = bump_k
    bump.inputs['Distance'].default_value = 0.0015
    L.new(height, bump.inputs['Height'])
    L.new(bump.outputs['Normal'], b.inputs['Normal'])
    mr = map_range(N, 0.0, 1.0, rough - 0.06, rough + 0.08)
    L.new(wave.outputs['Fac'], mr.inputs['Value'])
    L.new(mr.outputs['Result'], b.inputs['Roughness'])
    S(b, coat=0.0, spec=0.3)
    return m


def mat_cabinet(name):
    """아래 장: 크림색 칠한 세로 판자(10cm마다 홈)"""
    m, nt, b = new_mat(name)
    N, L = nt.nodes, nt.links
    tc = N.new('ShaderNodeTexCoord')
    br = N.new('ShaderNodeTexBrick')
    br.inputs['Scale'].default_value = 1.0
    br.inputs['Brick Width'].default_value = 0.1
    br.inputs['Row Height'].default_value = 5.0
    br.inputs['Mortar Size'].default_value = 0.002
    br.inputs['Mortar Smooth'].default_value = 0.5
    br.inputs['Color1'].default_value = lin('#E2D7C6')
    br.inputs['Color2'].default_value = lin('#DDD1BF')
    br.inputs['Mortar'].default_value = lin('#B8AA94')
    L.new(tc.outputs['Object'], br.inputs['Vector'])
    L.new(br.outputs['Color'], b.inputs['Base Color'])
    inv = N.new('ShaderNodeMath')
    inv.operation = 'SUBTRACT'
    inv.inputs[0].default_value = 1.0
    L.new(br.outputs['Fac'], inv.inputs[1])
    bump = N.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = 0.5
    bump.inputs['Distance'].default_value = 0.003
    L.new(inv.outputs['Value'], bump.inputs['Height'])
    L.new(bump.outputs['Normal'], b.inputs['Normal'])
    S(b, rough=0.55)
    return m


def mat_tiles(name):
    """크림색 지하철 타일(벽): 줄눈은 거칠고 오목하게"""
    m, nt, b = new_mat(name)
    N, L = nt.nodes, nt.links
    tc = N.new('ShaderNodeTexCoord')
    br = N.new('ShaderNodeTexBrick')
    br.offset = 0.5
    br.inputs['Scale'].default_value = 1.0
    br.inputs['Brick Width'].default_value = 0.15
    br.inputs['Row Height'].default_value = 0.075
    br.inputs['Mortar Size'].default_value = 0.0028
    br.inputs['Mortar Smooth'].default_value = 0.6
    br.inputs['Color1'].default_value = lin('#F4EFE6')
    br.inputs['Color2'].default_value = lin('#E6DDCC')
    br.inputs['Mortar'].default_value = lin('#B3A893')
    L.new(tc.outputs['Object'], br.inputs['Vector'])
    L.new(br.outputs['Color'], b.inputs['Base Color'])
    mr = map_range(N, 0.0, 1.0, 0.1, 0.75)
    L.new(br.outputs['Fac'], mr.inputs['Value'])
    L.new(mr.outputs['Result'], b.inputs['Roughness'])
    inv = N.new('ShaderNodeMath')
    inv.operation = 'SUBTRACT'
    inv.inputs[0].default_value = 1.0
    L.new(br.outputs['Fac'], inv.inputs[1])
    bump = N.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = 0.6
    bump.inputs['Distance'].default_value = 0.004
    L.new(inv.outputs['Value'], bump.inputs['Height'])
    L.new(bump.outputs['Normal'], b.inputs['Normal'])
    S(b, coat=0.35, coat_rough=0.08)
    return m


def mat_steel(name, base='#C9CDD2', rough=0.2, brushed=True):
    """스테인리스: 가로 결(헤어라인)로 거칠기가 조금씩 다름"""
    m, nt, b = new_mat(name)
    N, L = nt.nodes, nt.links
    S(b, color=lin(base), metal=1.0, rough=rough, aniso=0.45 if brushed else 0.0)
    if brushed:
        tc = N.new('ShaderNodeTexCoord')
        mp = N.new('ShaderNodeMapping')
        mp.inputs['Scale'].default_value = (3.0, 280.0, 280.0)
        L.new(tc.outputs['Object'], mp.inputs['Vector'])
        nz = N.new('ShaderNodeTexNoise')
        nz.inputs['Scale'].default_value = 1.0
        nz.inputs['Detail'].default_value = 3.0
        L.new(mp.outputs['Vector'], nz.inputs['Vector'])
        mr = map_range(N, 0.3, 0.7, rough - 0.05, rough + 0.07)
        L.new(nz.outputs['Fac'], mr.inputs['Value'])
        L.new(mr.outputs['Result'], b.inputs['Roughness'])
    return m


def mat_coffee(name, c0, c1, scale=40.0, rough=0.1):
    """커피 표면: 두 색이 얼룩지게(크레마)"""
    m, nt, b = new_mat(name)
    N, L = nt.nodes, nt.links
    tc = N.new('ShaderNodeTexCoord')
    nz = N.new('ShaderNodeTexNoise')
    nz.inputs['Scale'].default_value = scale
    nz.inputs['Detail'].default_value = 6.0
    L.new(tc.outputs['Object'], nz.inputs['Vector'])
    r = ramp2(N, lin(c0), lin(c1), 0.35, 0.7)
    L.new(nz.outputs['Fac'], r.inputs['Fac'])
    L.new(r.outputs['Color'], b.inputs['Base Color'])
    S(b, rough=rough, spec=0.35)
    return m


M = {
    'oak': mat_wood('oak', '#7C4E26', '#5C3A1C', grain=110.0, rough=0.68),
    'oak_handle': mat_wood('oak_handle', '#8E5A2B', '#5A3415', grain=60.0, rough=0.4, seams=False, axis='Z', offset=(0.4, 0.0, 0.0), bump_k=0.05),
    'cabinet': mat_cabinet('cabinet'),
    'tiles': mat_tiles('tiles'),
    'steel': mat_steel('steel'),
    'steel_dark': mat_steel('steel_dark', base='#A7ABB0', rough=0.3),
    'chrome': basic('chrome', lin('#ECEEF1'), metal=1.0, rough=0.05),
    'enamel': basic('enamel', lin('#0F3D27'), rough=0.36, coat=0.7, coat_rough=0.06),
    'bakelite': basic('bakelite', lin('#151515'), rough=0.32, coat=0.4, coat_rough=0.1),
    'rubber': basic('rubber', lin('#1A1A1A'), rough=0.7),
    'ceramic': basic('ceramic', lin('#F3F0E9'), rough=0.08, coat=0.6, coat_rough=0.02, sss=0.03),
    'gauge_face': basic('gauge_face', lin('#F5F1E6'), rough=0.45),
    'ink': basic('ink', lin('#1A1A1A'), rough=0.5),
    'needle': basic('needle', lin('#141414'), rough=0.4),
    'milk': basic('milk', lin('#F6F2EA'), rough=0.38, sss=0.3),
    'band_good': basic('band_good', lin('#25844A'), rough=0.5),
    'band_hot': basic('band_hot', lin('#D9772E'), rough=0.5),
    'glass': basic('glass', (1, 1, 1, 1), rough=0.0, trans=1.0, ior=1.5),
    'americano': mat_coffee('americano', '#1C0D05', '#3E200C', scale=26.0, rough=0.18),
    'espresso': mat_coffee('espresso', '#1E0E05', '#3A1D0B', scale=12.0, rough=0.06),
    'crema': mat_coffee('crema', '#8A5428', '#C18A4D', scale=70.0, rough=0.3),
    'stream': basic('stream', lin('#4A2410'), rough=0.08, spec=0.7),
}

if 'Subsurface Scale' in M['milk'].node_tree.nodes['Principled BSDF'].inputs:
    M['milk'].node_tree.nodes['Principled BSDF'].inputs['Subsurface Scale'].default_value = 0.003  # 우유는 빛이 조금만 스밈

# ------------------------------------------------------------------ 모양
def bevel(ob, width, segs=3):
    md = ob.modifiers.new('Bevel', 'BEVEL')
    md.width = width
    md.segments = segs
    md.limit_method = 'ANGLE'
    md.angle_limit = math.radians(40)
    md.harden_normals = True
    return md


def smooth(me):
    for p in me.polygons:
        p.use_smooth = True


def box(name, size, loc, mat, c, bev=0.004, segs=3, rot=(0, 0, 0)):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= size[0]
        v.co.y *= size[1]
        v.co.z *= size[2]
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    smooth(me)
    ob = obj(name, me, mat, loc, c, rot)
    if bev > 0:
        bevel(ob, bev, segs)
    return ob


def cyl(name, r, h, loc, mat, c, segs=64, r2=None, rot=(0, 0, 0), bev=None):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=segs, radius1=r, radius2=(r if r2 is None else r2), depth=h)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    smooth(me)
    ob = obj(name, me, mat, loc, c, rot)
    w = min(r, h) * 0.15 if bev is None else bev
    if w > 0:
        bevel(ob, w, 3)
    return ob


def ball(name, r, loc, mat, c, scale=(1, 1, 1)):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=24, radius=r)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    smooth(me)
    return obj(name, me, mat, loc, c, scale=scale)


def tube(name, pts, radius, mat, c):
    cu = bpy.data.curves.new(name, 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = radius
    cu.bevel_resolution = 6
    cu.resolution_u = 24
    cu.use_fill_caps = True
    sp = cu.splines.new('BEZIER')
    sp.bezier_points.add(len(pts) - 1)
    for bp, p in zip(sp.bezier_points, pts):
        bp.co = p
        bp.handle_left_type = bp.handle_right_type = 'AUTO'
    return obj(name, cu, mat, (0, 0, 0), c)


def lathe(name, prof, mat, loc, c, segs=128, warp=None, rotz=0.0):
    """옆모습 [(반지름, 높이)…]을 축(Z) 둘레로 돌림. 반지름 0 인 점은 축 위 한 점(닫힌 몸)"""
    verts, faces, rings = [], [], []
    for r, z in prof:
        if r <= 1e-7:
            i = len(verts)
            verts.append((0.0, 0.0, z))
            rings.append([i] * segs)
            continue
        row = []
        for k in range(segs):
            a = 2 * math.pi * k / segs
            p = (r * math.cos(a), r * math.sin(a), z)
            if warp:
                p = warp(*p, a)
            row.append(len(verts))
            verts.append(p)
        rings.append(row)
    for A, B in zip(rings, rings[1:]):
        for k in range(segs):
            j = (k + 1) % segs
            f = []
            for v in (A[k], A[j], B[j], B[k]):
                if v not in f:
                    f.append(v)
            if len(f) >= 3:
                faces.append(f)
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.validate()
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    smooth(me)
    return obj(name, me, mat, loc, c, (0, 0, rotz))


# ------------------------------------------------------------------ 물건
def build_set():
    box('SET_counter', (2.6, 0.9, 0.05), (0, 0.0, -0.025), M['oak'], 'set', bev=0.008)
    box('SET_cabinet', (2.6, 0.84, 0.9), (0, 0.03, -0.5), M['cabinet'], 'set', bev=0.004)
    me = bpy.data.meshes.new('SET_wall')
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=1.0)
    for v in bm.verts:
        v.co.x *= 1.6
        v.co.y = (v.co.y + 1.0) * 0.8  # 아래 끝이 0
    bm.to_mesh(me)
    bm.free()
    obj('SET_wall', me, M['tiles'], (0, 0.45, 0), 'set', (math.radians(90), 0, 0))


GX = []  # 그룹 머리 x


def build_machine(X=-0.52):
    st, ch, en, bk, rub = M['steel'], M['chrome'], M['enamel'], M['bakelite'], M['rubber']
    c = 'machine'
    Y0, W, D = 0.01, 0.66, 0.42
    FY = Y0 - D / 2  # 앞면 y
    for sx in (-1, 1):
        for sy in (-1, 1):
            cyl('M_foot', 0.014, 0.03, (X + sx * 0.29, Y0 + sy * 0.17, 0.015), rub, c, bev=0.003)
    box('M_base', (W, D, 0.11), (X, Y0, 0.085), st, c, bev=0.006)
    box('M_body', (W, D, 0.30), (X, Y0, 0.29), st, c, bev=0.008)
    for sx in (-1, 1):
        box('M_side', (0.01, D - 0.06, 0.25), (X + sx * (W / 2 + 0.004), Y0, 0.29), en, c, bev=0.004)
    box('M_band', (W - 0.02, 0.012, 0.075), (X, FY - 0.006, 0.395), en, c, bev=0.004)
    box('M_top', (W - 0.03, D - 0.03, 0.012), (X, Y0, 0.446), M['steel_dark'], c, bev=0.003)
    # 데우는 자리에 엎어 둔 에스프레소 잔
    for i in range(6):
        lathe('M_cup', ESPRESSO_CUP, M['ceramic'], (X - 0.225 + i * 0.09, Y0 - 0.06 + (i % 2) * 0.05, 0.452 + 0.058), c, segs=64).rotation_euler = (math.radians(180), 0, 0)
    for sx in (-1, 1):
        for sy in (-1, 1):
            cyl('M_post', 0.005, 0.045, (X + sx * 0.30, Y0 + sy * 0.18, 0.4745), ch, c, bev=0.001)
    for sy in (-1, 1):
        cyl('M_rail', 0.004, 0.60, (X, Y0 + sy * 0.18, 0.495), ch, c, rot=(0, math.radians(90), 0), bev=0.0)
    for sx in (-1, 1):
        cyl('M_rail', 0.004, 0.36, (X + sx * 0.30, Y0, 0.495), ch, c, rot=(math.radians(90), 0, 0), bev=0.0)
    # 물받이 + 살
    box('M_tray', (0.60, 0.15, 0.03), (X, FY - 0.045, 0.045), st, c, bev=0.004)
    bar = box('M_grill', (0.004, 0.13, 0.004), (X - 0.288, FY - 0.045, 0.0615), ch, c, bev=0.0)
    arr = bar.modifiers.new('Array', 'ARRAY')
    arr.count = 49
    arr.use_relative_offset = False
    arr.use_constant_offset = True
    arr.constant_offset_displace = (0.012, 0, 0)
    # 그룹 머리 둘 + 포터필터(참나무 손잡이)
    for gx in (X - 0.155, X + 0.155):
        GX.append(gx)
        cyl('M_neck', 0.028, 0.07, (gx, FY - 0.035, 0.30), ch, c, rot=(math.radians(90), 0, 0))
        cyl('M_head', 0.05, 0.055, (gx, FY - 0.085, 0.272), ch, c, bev=0.008)
        ball('M_dome', 0.05, (gx, FY - 0.085, 0.299), ch, c, scale=(1, 1, 0.38))
        cyl('M_basket', 0.043, 0.022, (gx, FY - 0.085, 0.233), ch, c, bev=0.004)
        cyl('M_spout', 0.010, 0.016, (gx, FY - 0.085, 0.214), ch, c, r2=0.008)
        for sx in (-1, 1):
            cyl('M_spout2', 0.0045, 0.014, (gx + sx * 0.010, FY - 0.085, 0.201), ch, c, rot=(0, math.radians(sx * 18), 0), bev=0.0008)
        t = math.radians(98)
        dy, dz = -math.sin(t), math.cos(t)
        cyl('M_ferrule', 0.0135, 0.03, (gx, FY - 0.085 - 0.05 + 0.015 * dy, 0.233 + 0.015 * dz), ch, c, rot=(t, 0, 0))
        cyl('M_handle', 0.0115, 0.12, (gx, FY - 0.085 - 0.065 + 0.06 * dy, 0.233 + 0.06 * dz), M['oak_handle'], c, rot=(t, 0, 0), r2=0.0125)
        ball('M_handle_end', 0.0126, (gx, FY - 0.085 - 0.065 + 0.12 * dy, 0.233 + 0.12 * dz), M['oak_handle'], c)
        for i in range(4):
            box('M_button', (0.017, 0.010, 0.013), (gx + (i - 1.5) * 0.023, FY - 0.004, 0.345), bk, c, bev=0.002)
    # 압력계
    gy = FY - 0.012
    cyl('M_gauge_ring', 0.034, 0.014, (X, gy - 0.007, 0.395), ch, c, rot=(math.radians(90), 0, 0), bev=0.003)
    cyl('M_gauge_face', 0.029, 0.002, (X, gy - 0.0145, 0.395), M['gauge_face'], c, rot=(math.radians(90), 0, 0), bev=0.0)
    for i in range(9):
        a = math.radians(-120 + i * 30)
        box('M_tick', (0.0014, 0.001, 0.005), (X + 0.023 * math.sin(a), gy - 0.0157, 0.395 + 0.023 * math.cos(a)), M['ink'], c, bev=0.0, rot=(0, a, 0))
    a = math.radians(35)
    box('M_needle', (0.0024, 0.001, 0.022), (X + 0.009 * math.sin(a), gy - 0.0162, 0.395 + 0.009 * math.cos(a)), M['ink'], c, bev=0.0, rot=(0, a, 0))
    cyl('M_gauge_cap', 0.0035, 0.002, (X, gy - 0.0168, 0.395), ch, c, rot=(math.radians(90), 0, 0), bev=0.0)
    cyl('M_gauge_glass', 0.0305, 0.003, (X, gy - 0.0195, 0.395), M['glass'], c, rot=(math.radians(90), 0, 0), bev=0.0008)
    # 스팀 노즐(오른쪽) · 온수(왼쪽) + 손잡이
    for sx, name in ((1, 'steam'), (-1, 'water')):
        kx = X + sx * 0.275
        cyl(f'M_{name}_base', 0.019, 0.006, (kx, gy - 0.003, 0.395), ch, c, rot=(math.radians(90), 0, 0))
        cyl(f'M_{name}_knob', 0.016, 0.026, (kx, gy - 0.019, 0.395), bk, c, rot=(math.radians(90), 0, 0), bev=0.004)
        wx = X + sx * 0.30
        if name == 'steam':
            pts = [(wx, FY + 0.01, 0.36), (wx + 0.012, FY - 0.05, 0.345), (wx + 0.022, FY - 0.085, 0.27), (wx + 0.028, FY - 0.095, 0.17)]
        else:
            pts = [(wx, FY + 0.01, 0.34), (wx - 0.008, FY - 0.045, 0.32), (wx - 0.012, FY - 0.065, 0.23)]
        tube(f'M_{name}_wand', pts, 0.0056 if name == 'steam' else 0.0065, ch, c)


ESPRESSO_CUP = [(0.0, 0.0), (0.017, 0.0), (0.019, 0.002), (0.022, 0.008), (0.027, 0.025), (0.0305, 0.045), (0.0318, 0.055), (0.0314, 0.058),
                (0.0302, 0.0575), (0.0292, 0.054), (0.0262, 0.035), (0.0215, 0.015), (0.017, 0.009), (0.0, 0.0085)]
MUG = [(0.0, 0.0), (0.028, 0.0), (0.033, 0.0008), (0.0355, 0.003), (0.0375, 0.008), (0.0395, 0.016), (0.0408, 0.03),
       (0.0416, 0.05), (0.0423, 0.07), (0.0428, 0.085), (0.0429, 0.0885), (0.0425, 0.0905), (0.0417, 0.0913),
       (0.0408, 0.0908), (0.0402, 0.0890), (0.0398, 0.085), (0.0392, 0.07), (0.0385, 0.05), (0.0376, 0.03),
       (0.0362, 0.018), (0.0335, 0.0125), (0.028, 0.0108), (0.0, 0.0105)]
SAUCER = [(0.0, 0.0), (0.040, 0.0), (0.043, 0.0018), (0.060, 0.0062), (0.073, 0.0105), (0.0768, 0.0138), (0.0772, 0.0152),
          (0.0762, 0.0160), (0.0730, 0.0150), (0.0600, 0.0112), (0.0450, 0.0080), (0.0425, 0.0072), (0.0, 0.0070)]


def build_mug(at, c='mug', drink='americano', saucer=True, turn=-35.0):
    x0, y0 = at
    z0 = 0.0
    if saucer:
        lathe('MUG_saucer', SAUCER, M['ceramic'], (x0, y0, 0.0), c)
        z0 = 0.0072
    lathe('MUG_body', MUG, M['ceramic'], (x0, y0, z0), c)
    a = math.radians(turn)  # 손잡이 방향(오른쪽 앞)
    def rot(px, pz):
        return (x0 + px * math.cos(a), y0 + px * math.sin(a), z0 + pz)
    hp = [rot(0.0405, 0.074), rot(0.064, 0.079), rot(0.0755, 0.058), rot(0.068, 0.031), rot(0.0400, 0.025)]
    h = tube('MUG_handle', hp, 0.0066, M['ceramic'], c)
    if drink == 'americano':
        cyl('MUG_coffee', 0.0390, 0.002, (x0, y0, z0 + 0.0745), M['americano'], c, bev=0.0)


PITCHER = [(0.0, 0.0), (0.033, 0.0), (0.0365, 0.0015), (0.0384, 0.0055), (0.0394, 0.018), (0.0396, 0.035), (0.0386, 0.055),
           (0.0366, 0.075), (0.0352, 0.088), (0.0354, 0.097), (0.0362, 0.1035), (0.0367, 0.1055), (0.0362, 0.1062),
           (0.0355, 0.1050), (0.0348, 0.098), (0.0343, 0.088), (0.0357, 0.075), (0.0377, 0.055), (0.0386, 0.035),
           (0.0384, 0.018), (0.0373, 0.0065), (0.034, 0.0022), (0.0, 0.0018)]


def spout(x, y, z, a):
    """피처 주둥이: 위쪽 가장자리를 +X 방향으로 끌어냄"""
    t = max(0.0, min(1.0, (z - 0.08) / 0.026))
    t = t * t * (3 - 2 * t)
    w = max(0.0, math.cos(a)) ** 8
    return (x + 0.017 * t * w, y, z + 0.005 * t * w)


def build_pitcher(at, c='pitcher', turn=205.0):
    x0, y0 = at
    lathe('PIT_body', PITCHER, M['steel'], (x0, y0, 0.0), c, warp=spout, rotz=math.radians(turn))
    a = math.radians(turn + 180)
    def rot(px, pz):
        return (x0 + px * math.cos(a), y0 + px * math.sin(a), pz)
    tube('PIT_handle', [rot(0.034, 0.093), rot(0.058, 0.090), rot(0.066, 0.062), rot(0.058, 0.032), rot(0.037, 0.024)], 0.0048, M['steel'], c)


def build_tamper(at, c='tamper'):
    x0, y0 = at
    lathe('TAMP_base', [(0.0, 0.0), (0.0288, 0.0), (0.0292, 0.0012), (0.0292, 0.014), (0.0285, 0.0165), (0.012, 0.0175),
                        (0.010, 0.026), (0.0, 0.026)], M['steel'], (x0, y0, 0.0), c)
    lathe('TAMP_handle', [(0.0, 0.024), (0.013, 0.024), (0.0115, 0.034), (0.013, 0.05), (0.0185, 0.075), (0.0205, 0.088),
                          (0.019, 0.096), (0.012, 0.1), (0.0, 0.1005)], M['oak_handle'], (x0, y0, 0.0), c)


SHOT_GLASS = [(0.0, 0.0), (0.0225, 0.0), (0.0235, 0.0015), (0.0245, 0.01), (0.0262, 0.035), (0.0275, 0.062), (0.0277, 0.0645),
              (0.0272, 0.0655), (0.0265, 0.0648), (0.0261, 0.062), (0.0249, 0.035), (0.0233, 0.0135), (0.0215, 0.0095), (0.0, 0.009)]


def shot_inner_r(h):
    """샷 잔 안쪽 반지름(바닥에서 잰 높이 h)"""
    pts = [(0.0095, 0.0215), (0.0135, 0.0233), (0.035, 0.0249), (0.062, 0.0261)]
    for (h0, r0), (h1, r1) in zip(pts, pts[1:]):
        if h <= h1:
            return r0 + (r1 - r0) * (h - h0) / (h1 - h0)
    return pts[-1][1]


def build_espresso(at, z, fill, c, tag='SHOT'):
    """잔 안의 에스프레소(안쪽 벽보다 조금 작게) + 위의 크레마(적을수록 얇게). fill = 잔 바닥에서 잰 높이(m), 0 이면 빈 잔.
    돌려줌: 위 표면 높이(빈 잔이면 잔 바닥)"""
    if fill <= 0:
        return z + 0.0095
    x0, y0 = at
    r = shot_inner_r
    top = 0.0095 + fill
    crema = min(0.004, fill * 0.35)
    body = top - crema
    prof = [(0.0, 0.0097), (r(0.0097) - 0.0004, 0.0097)]
    for hh in (0.0135, 0.02, 0.03, 0.04, 0.05):
        if hh < body - 0.001:
            prof.append((r(hh) - 0.0004, hh))
    prof += [(r(body) - 0.0004, body), (0.0, body)]
    lathe(f'{tag}_espresso', prof, M['espresso'], (x0, y0, z), c, segs=96)
    cprof = [(0.0, body - 0.0002), (r(body - 0.0002) - 0.0004, body - 0.0002), (r(top) - 0.0004, top - 0.0006), (r(top) - 0.0012, top), (0.0, top + 0.0004)]
    lathe(f'{tag}_crema', cprof, M['crema'], (x0, y0, z), c, segs=96)
    return z + top


def build_streams(gx, y, surf, c, tag='SHOTX'):
    """포터필터 두 주둥이(끝 높이 0.194)에서 표면까지 두 줄기"""
    for sx in (-1, 1):
        cyl(f'{tag}_stream', 0.0016, 0.194 - surf, (gx + sx * 0.0115, y, (0.194 + surf) / 2), M['stream'], c, segs=24, r2=0.0012, bev=0.0)


def build_shot(at, z=0.0, c='shot', fill=0.032):
    lathe('SHOT_glass', SHOT_GLASS, M['glass'], (at[0], at[1], z), c)
    return build_espresso(at, z, fill, c)


# ------------------------------------------------------------------ 장면
build_set()
build_machine()
build_mug((0.08, -0.22))
build_pitcher((0.40, -0.06))
build_tamper((0.20, 0.07))
build_shot((-0.06, -0.14))
# 추출 장면용: 왼쪽 그룹 아래 물받이 위의 샷 잔 + 두 줄기
FY = 0.01 - 0.21
surf = build_shot((GX[0], FY - 0.085), z=0.0635, c='shot_extract', fill=0.022)
build_streams(GX[0], FY - 0.085, surf, 'shot_extract')

# 바닥 그림자 받이(물건 그림 렌더에서만)
me = bpy.data.meshes.new('SC_plane')
bm = bmesh.new()
bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=1.6)
bm.to_mesh(me)
bm.free()
catcher = obj('SC_plane', me, basic('catcher', (0.8, 0.8, 0.8, 1), rough=0.5), (0, 0, 0), 'catcher')
catcher.is_shadow_catcher = True

# 카메라 + 빛
cam = obj('CAM', bpy.data.cameras.new('CAM'), None, (-0.05, -2.35, 0.66), 'rig')
cam.data.lens = 45
cam.data.sensor_width = 36
TARGET = Vector((-0.15, -0.05, 0.15))
look(cam, TARGET)
scene.camera = cam
VIEW = (TARGET - cam.location).normalized()


def area(name, loc, target, size, energy, color):
    ld = bpy.data.lights.new(name, 'AREA')
    ld.shape = 'RECTANGLE'
    ld.size = size
    ld.size_y = size * 0.75
    ld.energy = energy
    ld.color = color
    ob = obj(name, ld, None, loc, 'rig')
    look(ob, target)
    return ob


L_KEY = area('L_key', (-1.5, -1.35, 1.7), (-0.2, -0.1, 0.15), 1.4, 430.0, (1.0, 0.9, 0.78))
L_FILL = area('L_fill', (1.8, -1.8, 0.9), (0.0, 0.0, 0.15), 2.0, 110.0, (0.86, 0.93, 1.0))
L_RIM = area('L_rim', (0.4, 1.2, 1.4), (-0.4, 0.0, 0.3), 1.0, 240.0, (1.0, 0.97, 0.93))


def side_shadows(on):
    """물건 그림: 그림자는 주광(왼쪽 위)에서만. 채움·테두리 빛의 그림자는 끔"""
    for ob in (L_FILL, L_RIM):
        for owner, attr in ((ob.data, 'use_shadow'), (getattr(ob.data, 'cycles', None), 'cast_shadow')):
            if owner is not None and hasattr(owner, attr):
                setattr(owner, attr, on)

world = scene.world or bpy.data.worlds.new('World')
scene.world = world
try:
    world.use_nodes = True
except Exception:
    pass
wn = world.node_tree
for n in list(wn.nodes):
    wn.nodes.remove(n)
bgn = wn.nodes.new('ShaderNodeBackground')
wout = wn.nodes.new('ShaderNodeOutputWorld')
wn.links.new(bgn.outputs['Background'], wout.inputs['Surface'])
hdr = os.path.join(bpy.utils.system_resource('DATAFILES'), 'studiolights', 'world', 'interior.exr')
if os.path.exists(hdr):
    env = wn.nodes.new('ShaderNodeTexEnvironment')
    env.image = bpy.data.images.load(hdr, check_existing=True)
    wn.links.new(env.outputs['Color'], bgn.inputs['Color'])
    bgn.inputs['Strength'].default_value = 0.3
else:
    bgn.inputs['Color'].default_value = (0.6, 0.62, 0.66, 1)
    bgn.inputs['Strength'].default_value = 0.3
    log('HDRI 없음', hdr)

# 렌더 설정
scene.render.engine = 'CYCLES'
cy = scene.cycles
try:
    prefs = bpy.context.preferences.addons['cycles'].preferences
    for kind in ('OPTIX', 'CUDA'):
        prefs.compute_device_type = kind
        prefs.get_devices()
        devs = [d for d in prefs.devices if d.type == kind]
        if devs:
            for d in prefs.devices:
                d.use = d.type == kind
            cy.device = 'GPU'
            log('GPU', kind, [d.name for d in devs])
            break
except Exception as e:
    log('GPU 설정 실패', e)
cy.use_adaptive_sampling = True
cy.adaptive_threshold = 0.01
cy.use_denoising = True
try:
    cy.denoiser = 'OPENIMAGEDENOISE'
except Exception:
    pass
cy.max_bounces = 10
cy.diffuse_bounces = 4
cy.glossy_bounces = 6
cy.transmission_bounces = 10
cy.transparent_max_bounces = 16
cy.blur_glossy = 0.6
cy.sample_clamp_indirect = 8.0
vs = scene.view_settings
try:
    vs.view_transform = 'AgX'
except Exception:
    pass
vs.exposure = -0.15
for name in ('AgX - Medium High Contrast', 'Medium High Contrast'):
    try:
        vs.look = name
        break
    except Exception:
        pass


def show_only(names, set_visible=True, catcher_on=False):
    for cname, c in COLL.items():
        if cname == 'rig':
            continue
        vis = cname in names or (cname == 'set' and set_visible) or (cname == 'catcher' and catcher_on)
        for ob in c.objects:
            ob.hide_render = not vis


def sprite_setup(cols):
    """물건 그림: 벽·작업대는 카메라에만 안 보이고 반사·반사광에는 남김(색이 전체 장면과 같게).
    그림자 받이는 그림자만 받고 반사에는 안 보임. 벽은 그림자를 드리우지 않음(받이에 넓은 그늘이 지지 않게)"""
    for cname, c in COLL.items():
        if cname == 'rig':
            continue
        for ob in c.objects:
            if cname == 'set':
                ob.hide_render = False
                ob.visible_camera = False
                ob.visible_shadow = ob.name != 'SET_wall'
            elif cname == 'catcher':
                ob.hide_render = False
                ob.visible_glossy = ob.visible_diffuse = ob.visible_transmission = False
            else:
                ob.hide_render = cname not in cols


def render(path, res, samples, transparent=False, fmt='PNG'):
    r = scene.render
    r.resolution_x, r.resolution_y = res
    r.resolution_percentage = 100
    r.film_transparent = transparent
    if hasattr(cy, 'film_transparent_glass'):
        cy.film_transparent_glass = transparent
    cy.samples = samples
    s = r.image_settings
    s.file_format = fmt
    if fmt == 'PNG':
        s.color_mode = 'RGBA' if transparent else 'RGB'
        s.color_depth = '8'
    else:
        s.color_mode = 'RGB'
        s.quality = 92
    r.filepath = path
    bpy.ops.render.render(write_still=True)
    log('렌더', os.path.basename(path), res, samples)


def fit_camera(objs, res, margin=0.03, pad=0.2, view=None):
    """같은 보는 방향(VIEW)으로 물건만 꽉 차게. 그림자 자리를 위해 바닥 둘레를 넓힘"""
    scene.render.resolution_x, scene.render.resolution_y = res
    dg = bpy.context.evaluated_depsgraph_get()
    pts = []
    for ob in objs:
        ev = ob.evaluated_get(dg)
        pts += [ob.matrix_world @ Vector(cn) for cn in ev.bound_box]
    xs, ys, zs = [p.x for p in pts], [p.y for p in pts], [p.z for p in pts]
    cx, cy_, w, d = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2, max(xs) - min(xs), max(ys) - min(ys)
    for sx in (-1, 1):
        for sy in (-1, 1):
            pts.append(Vector((cx + sx * w * (0.5 + pad), cy_ + sy * d * (0.5 + pad), 0.0)))
    center = Vector((cx, cy_, (min(zs) + max(zs)) / 2))
    view = view or VIEW
    lo, hi = 0.05, 30.0
    for _ in range(40):
        mid = (lo + hi) / 2
        cam.location = center - view * mid
        look(cam, center)
        bpy.context.view_layer.update()
        ok = all(margin <= v.x <= 1 - margin and margin <= v.y <= 1 - margin and v.z > 0
                 for v in (world_to_camera_view(scene, cam, p) for p in pts))
        if ok:
            hi = mid
        else:
            lo = mid
    cam.location = center - view * hi
    look(cam, center)
    bpy.context.view_layer.update()


def main_camera():
    cam.location = (-0.05, -2.35, 0.66)
    cam.data.lens = 45
    look(cam, TARGET)


# ------------------------------------------------------------------ 동작마다 한 컷(Q-R9, docs/recipes.md 6.2)
SHOT_RES = (2944, 800)  # 작업대 칸 비율 3.68:1


def clear_dyn():
    for ob in list(coll('shot_dyn').objects):
        bpy.data.objects.remove(ob, do_unlink=True)


def frame_rect(pts, pad=28):
    """프레임 자리(화면 좌표, 위 왼쪽이 0): 점들을 감싸는 상자 + 여백"""
    scene.render.resolution_x, scene.render.resolution_y = SHOT_RES
    bpy.context.view_layer.update()
    vv = [world_to_camera_view(scene, cam, q) for q in pts]
    W, H = SHOT_RES
    x0, x1 = max(0, int(min(v.x for v in vv) * W) - pad), min(W, int(max(v.x for v in vv) * W) + pad)
    y0, y1 = max(0, int((1 - max(v.y for v in vv)) * H) - pad), min(H, int((1 - min(v.y for v in vv)) * H) + pad)
    return x0, y0, x1, y1


def render_frames(sdir, sid, rect, levels, build, samples=256, plate=None, art=None):
    """자리만 렌더(나머지는 배경판과 같음, 같은 씨앗값): build(k, p, flow) 가 그 단계의 바뀌는 것을 shot_dyn 에 만듦.
    plate: 다른 컷과 같은 배경판 이름 · art: (단계 목록, build) → {sid}_a{단계}.png(라테아트, 줄기 없음)"""
    x0, y0, x1, y1 = rect
    W, H = SHOT_RES
    r = scene.render
    r.use_border = True
    r.use_crop_to_border = False
    r.border_min_x, r.border_max_x = x0 / W, x1 / W
    r.border_min_y, r.border_max_y = (H - y1) / H, (H - y0) / H
    for k in range(levels):
        p = k / (levels - 1)
        for flow in (False, True):
            clear_dyn()
            build(k, p, flow)
            render(os.path.join(sdir, f'{sid}_{"s" if flow else "l"}{k:02d}.png'), SHOT_RES, samples)
    for k in (art[0] if art else []):
        clear_dyn()
        art[1](k, k / (levels - 1), False)
        render(os.path.join(sdir, f'{sid}_a{k:02d}.png'), SHOT_RES, samples)
    r.use_border = False
    meta = {'size': list(SHOT_RES), 'rect': [x0, y0, x1 - x0, y1 - y0], 'levels': levels}
    if plate:
        meta['plate'] = plate
    if art:
        meta['art'] = list(art[0])
    with open(os.path.join(sdir, f'{sid}.json'), 'w', encoding='utf-8') as fp:
        json.dump(meta, fp)
    log('컷 프레임 자리', sid, rect)


def shot_extract(sdir, preview):
    """샷 내리기: 왼쪽 그룹 아래 빈 샷 잔을 왼쪽 앞에서 비스듬히(약 35°). 잔이 차오르는 13단계 × 줄기 있음/없음"""
    gx, gy, gz = GX[0], FY - 0.085, 0.0635
    for ob in list(COLL['shot_extract'].objects):
        bpy.data.objects.remove(ob, do_unlink=True)
    clear_dyn()
    glass = lathe('SHOTX_glass', SHOT_GLASS, M['glass'], (gx, gy, gz), 'shot_extract')
    show_only(('machine', 'shot_extract', 'tamper', 'shot_dyn'))
    cam.data.lens = 50
    cam.location = (gx - 0.54, -1.04, 0.212)  # 초록 옆판 · 멀어지는 앞면의 깊이, 잔 속이 조금 보임
    look(cam, (gx + 0.03, gy, 0.134))
    cam.data.dof.use_dof = True
    cam.data.dof.focus_object = glass
    cam.data.dof.aperture_fstop = 4.0
    cy.seed = 11
    if preview:
        render(os.path.join(sdir, 'preview_extract.jpg'), (1472, 400), 64, fmt='JPEG')
        return
    render(os.path.join(sdir, 'extract_plate.png'), SHOT_RES, 384)
    rect = frame_rect([Vector((gx + dx, gy + dy, zz)) for dx in (-0.034, 0.034) for dy in (-0.034, 0.034) for zz in (gz - 0.003, 0.206)])

    def build(k, p, flow):
        surf = build_espresso((gx, gy), gz, 0.0 if k == 0 else 0.003 + p * 0.042, 'shot_dyn', 'SHOTX')
        if flow:
            build_streams(gx, gy, surf, 'shot_dyn')
    render_frames(sdir, 'extract', rect, 13, build)


def arc(name, a0, a1, r0, r1, y, mat, c):
    """다이얼 위의 칸(부채꼴 띠). 각도는 위가 0°, 오른쪽(시계 방향)이 +"""
    n = max(2, int(abs(a1 - a0) / 2) + 1)
    verts, faces = [], []
    for i in range(n):
        a = math.radians(a0 + (a1 - a0) * i / (n - 1))
        verts += [(r0 * math.sin(a), y, r0 * math.cos(a)), (r1 * math.sin(a), y, r1 * math.cos(a))]
    for i in range(n - 1):
        faces.append((2 * i, 2 * i + 2, 2 * i + 3, 2 * i + 1))
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    return obj(name, me, mat, (0, 0, 0), c)


THERMO_R = 0.026
SWEEP = 270.0  # 바늘이 도는 넓이: 띠 값 0 = -135°, 1 = +135°


def needle_angle(p):
    return -SWEEP / 2 + SWEEP * p


def build_thermo(center, cam_pos, zone, c='steam_static'):
    """피처에 꽂는 집게 온도계(다이얼이 카메라를 봄). 초록 칸 = 알맞아요(띠의 zone과 같은 자리), 주황 칸 = 뜨거워요. 숫자는 없음"""
    emp = bpy.data.objects.new('THERMO', None)
    coll(c).objects.link(emp)
    emp.location = center
    emp.rotation_euler = (Vector(cam_pos) - Vector(center)).normalized().to_track_quat('-Y', 'Z').to_euler()
    r = THERMO_R
    parts = [
        cyl('TH_bezel', r, 0.008, (0, 0, 0), M['chrome'], c, rot=(math.radians(90), 0, 0), bev=0.0015),
        cyl('TH_face', r - 0.0032, 0.001, (0, -0.0045, 0), M['gauge_face'], c, rot=(math.radians(90), 0, 0), bev=0.0),
        arc('TH_good', needle_angle(zone[0]), needle_angle(zone[1]), r - 0.0098, r - 0.0052, -0.00505, M['band_good'], c),
        arc('TH_hot', needle_angle(zone[1]), SWEEP / 2, r - 0.0098, r - 0.0052, -0.00505, M['band_hot'], c),
        cyl('TH_glass', r - 0.0024, 0.0016, (0, -0.0066, 0), M['glass'], c, rot=(math.radians(90), 0, 0), bev=0.0004),
        cyl('TH_stem', 0.0022, 0.095, (0, 0.002, -r - 0.0475), M['steel'], c),
        box('TH_clip', (0.006, 0.004, 0.016), (0, 0.004, -r - 0.012), M['steel'], c, bev=0.001),
    ]
    for i in range(13):
        a = math.radians(needle_angle(i / 12))
        rt = r - 0.0118
        parts.append(box('TH_tick', (0.0011, 0.0006, 0.0034 if i % 3 else 0.005), (rt * math.sin(a), -0.0052, rt * math.cos(a)), M['ink'], c, bev=0.0, rot=(0, a, 0)))
    for ob in parts:
        ob.parent = emp
    return emp


def build_needle(emp, p, c='shot_dyn'):
    """바늘(돌아가는 점이 다이얼 가운데) + 가운데 덮개"""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= 0.0017
        v.co.y *= 0.0007
        v.co.z = v.co.z * 0.021 + 0.0072  # 가운데에서 조금 아래(-0.003)부터 끝(0.0177)까지
    me = bpy.data.meshes.new('TH_needle')
    bm.to_mesh(me)
    bm.free()
    ob = obj('TH_needle', me, M['needle'], (0, -0.0056, 0), c, rot=(0, math.radians(needle_angle(p)), 0))
    ob.parent = emp
    cap = cyl('TH_cap', 0.0022, 0.0012, (0, -0.006, 0), M['chrome'], c, rot=(math.radians(90), 0, 0), bev=0.0)
    cap.parent = emp


def mat_vapor(name):
    """김(볼륨): 가운데가 짙고 위·바깥으로 옅어지는 뭉게구름. 돌려줌: (재질, 노이즈 노드(W 로 모양), 양 노드)"""
    m = bpy.data.materials.new(name)
    try:
        m.use_nodes = True
    except Exception:
        pass
    nt = m.node_tree
    N, L = nt.nodes, nt.links
    for n in list(N):
        N.remove(n)
    out = N.new('ShaderNodeOutputMaterial')
    vol = N.new('ShaderNodeVolumePrincipled')
    vol.inputs['Color'].default_value = (0.96, 0.96, 0.98, 1)
    tc = N.new('ShaderNodeTexCoord')
    sep = N.new('ShaderNodeSeparateXYZ')
    L.new(tc.outputs['Object'], sep.inputs['Vector'])
    flat = N.new('ShaderNodeVectorMath')
    flat.operation = 'MULTIPLY'
    flat.inputs[1].default_value = (1.0, 1.0, 0.0)
    L.new(tc.outputs['Object'], flat.inputs[0])
    rl = N.new('ShaderNodeVectorMath')
    rl.operation = 'LENGTH'
    L.new(flat.outputs['Vector'], rl.inputs[0])
    rad = map_range(N, 0.0, 0.03, 1.0, 0.0)
    L.new(rl.outputs['Value'], rad.inputs['Value'])
    hgt = map_range(N, -0.07, 0.07, 1.0, 0.0)
    L.new(sep.outputs['Z'], hgt.inputs['Value'])
    nz = N.new('ShaderNodeTexNoise')
    nz.noise_dimensions = '4D'
    nz.inputs['Scale'].default_value = 36.0
    nz.inputs['Detail'].default_value = 3.0
    L.new(tc.outputs['Object'], nz.inputs['Vector'])
    puff = map_range(N, 0.38, 0.7, 0.0, 1.0)
    L.new(nz.outputs['Fac'], puff.inputs['Value'])
    a = N.new('ShaderNodeMath')
    a.operation = 'MULTIPLY'
    L.new(rad.outputs['Result'], a.inputs[0])
    L.new(hgt.outputs['Result'], a.inputs[1])
    b = N.new('ShaderNodeMath')
    b.operation = 'MULTIPLY'
    L.new(a.outputs['Value'], b.inputs[0])
    L.new(puff.outputs['Result'], b.inputs[1])
    amt = N.new('ShaderNodeMath')
    amt.operation = 'MULTIPLY'
    L.new(b.outputs['Value'], amt.inputs[0])
    amt.inputs[1].default_value = 30.0
    L.new(amt.outputs['Value'], vol.inputs['Density'])
    L.new(vol.outputs['Volume'], out.inputs['Volume'])
    return m, nz, amt


VAPOR = None
VAPOR_DENSITY = 1000.0  # 김 짙기(볼륨 밀도). 밝은 스테인리스 앞이라 짙게


def build_vapor(at, base_z, amount, seed, c='shot_dyn'):
    """피처 입구에서 올라오는 김. amount 0~1(0 이면 없음), seed 로 모양이 바뀜"""
    global VAPOR
    if amount <= 0:
        return
    if VAPOR is None:
        VAPOR = mat_vapor('vapor')
    m, nz, amt = VAPOR
    nz.inputs['W'].default_value = seed
    amt.inputs[1].default_value = VAPOR_DENSITY * amount
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=32, radius1=0.045, radius2=0.05, depth=0.14)
    me = bpy.data.meshes.new('VAPOR')
    bm.to_mesh(me)
    bm.free()
    obj('VAPOR', me, m, (at[0], at[1], base_z + 0.07), c)


def shot_steam(sdir, preview):
    """우유 데우기: 물받이 위 스팀 피처에 노즐을 넣고, 피처 왼쪽 뒤 가장자리에 집게 온도계. 바늘 25단계 × 김 있음(스팀 켬)/옅음"""
    X = GX[0] + 0.155
    px, py, pz = X + 0.235, FY - 0.08, 0.0635
    rim = pz + 0.1062
    for ob in [o for o in COLL['machine'].objects if o.name.startswith(('M_steam_wand', 'M_steam_tip'))]:
        bpy.data.objects.remove(ob, do_unlink=True)
    for ob in list(coll('steam_static').objects):
        bpy.data.objects.remove(ob, do_unlink=True)
    clear_dyn()
    wx = X + 0.30  # 이 컷에서는 노즐이 피처 안으로 들어가게 다시 만듦
    tube('M_steam_wand', [(wx, FY + 0.01, 0.36), (wx - 0.004, FY - 0.04, 0.335), (px + 0.016, py + 0.006, 0.245), (px + 0.008, py, 0.118)], 0.0056, M['chrome'], 'machine')
    cyl('M_steam_tip', 0.0068, 0.012, (px + 0.0078, py, 0.113), M['chrome'], 'machine')
    turn = 180.0  # 주둥이는 왼쪽, 손잡이는 오른쪽
    lathe('PITS_body', PITCHER, M['steel'], (px, py, pz), 'steam_static', warp=spout, rotz=math.radians(turn))
    ha = math.radians(turn + 180)

    def hp(q, zz):
        return (px + q * math.cos(ha), py + q * math.sin(ha), pz + zz)
    tube('PITS_handle', [hp(0.034, 0.093), hp(0.058, 0.090), hp(0.066, 0.062), hp(0.058, 0.032), hp(0.037, 0.024)], 0.0048, M['steel'], 'steam_static')
    cam.data.lens = 50
    cam.location = (px + 0.40, py - 0.80, 0.28)
    look(cam, (px - 0.02, py + 0.01, 0.15))
    ta = math.radians(228)  # 피처 왼쪽 앞 가장자리(노즐에 가리지 않게)
    tcen = (px + 0.031 * math.cos(ta), py + 0.031 * math.sin(ta), rim + THERMO_R + 0.006)
    emp = build_thermo(tcen, cam.location, (0.56, 0.81))
    vat = (px + 0.012, py + 0.018)  # 김은 노즐 쪽(오른쪽 뒤)에서 올라옴: 다이얼을 가리지 않게
    show_only(('machine', 'tamper', 'steam_static', 'shot_dyn'))
    cam.data.dof.use_dof = True
    cam.data.dof.focus_object = emp
    cam.data.dof.aperture_fstop = 4.0
    cy.seed = 11
    if preview:
        build_needle(emp, 0.68)
        build_vapor(vat, rim, 0.8, 1.0)
        render(os.path.join(sdir, 'preview_steam.jpg'), (1472, 400), 64, fmt='JPEG')
        return
    render(os.path.join(sdir, 'steam_plate.png'), SHOT_RES, 384)
    pts = [Vector(tcen) + Vector((dx, dy, dz)) for dx in (-0.032, 0.032) for dy in (-0.032, 0.032) for dz in (-0.032, 0.032)]
    pts += [Vector((vat[0] + dx, vat[1] + dy, zz)) for dx in (-0.045, 0.045) for dy in (-0.045, 0.045) for zz in (rim - 0.004, rim + 0.14)]

    def build(k, p, flow):
        build_needle(emp, p)
        amount = (0.55 + 0.45 * p) if flow else (0.35 * p if p > 0.15 else 0.0)  # 스팀을 끄면 뜨거운 만큼만 옅게
        build_vapor(vat, rim, amount, k * 0.37 + (0.13 if flow else 0.0))
    render_frames(sdir, 'steam', frame_rect(pts), 25, build)


MUG_INNER = [(0.0108, 0.028), (0.0125, 0.0335), (0.018, 0.0362), (0.03, 0.0376), (0.05, 0.0385), (0.07, 0.0392), (0.085, 0.0398), (0.089, 0.0402)]


def mug_inner_r(h):
    """머그 안쪽 반지름(머그 바닥에서 잰 높이 h)"""
    if h <= MUG_INNER[0][0]:
        return MUG_INNER[0][1]
    for (h0, r0), (h1, r1) in zip(MUG_INNER, MUG_INNER[1:]):
        if h <= h1:
            return r0 + (r1 - r0) * (h - h0) / (h1 - h0)
    return MUG_INNER[-1][1]


def sstep(x):
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)


def box_blur(a, n, r):
    """상자 흐림(가로 한 번 + 세로 한 번, 누적합이라 r 에 상관없이 빠름). 바깥은 0"""
    k = 2 * r + 1
    out = [0.0] * (n * n)
    for j in range(n):
        base = j * n
        s = sum(a[base:base + r + 1])
        for i in range(n):
            out[base + i] = s / k
            if i + r + 1 < n:
                s += a[base + i + r + 1]
            if i - r >= 0:
                s -= a[base + i - r]
    res = [0.0] * (n * n)
    for i in range(n):
        s = sum(out[q * n + i] for q in range(r + 1))
        for j in range(n):
            res[j * n + i] = s / k
            if j + r + 1 < n:
                s += out[(j + r + 1) * n + i]
            if j - r >= 0:
                s -= out[(j - r) * n + i]
    return res


HEART_SPAN = 2.8  # 하트 그림이 덮는 넓이(식의 단위, 가로세로 같음)


def heart_image(size=384):
    """라테아트 하트(흰 = 거품). 거품이 크레마 위로 번져 생기므로 칼같이 또렷하지 않게(2026-10-29 사용자):
    윤곽을 조금 비뚤게(손으로 부은 낮은 물결, 좌우가 살짝 다름) + 아래 끝에 끌어 당긴 짧은 꼬리 + 가장자리를 1~2mm 흐림.
    블렌더 그림은 아래 줄부터"""
    step = HEART_SPAN / (size - 1)
    a = [0.0] * (size * size)
    for j in range(size):
        y0 = j * step - 1.45
        for i in range(size):
            x0 = i * step - 1.4
            x = x0 + 0.05 * math.sin(2.7 * y0 + 0.6) + 0.025 * math.sin(5.3 * y0 + 1.9)
            y = y0 + 0.04 * math.sin(2.1 * x0 + 1.1)
            inside = (x * x + y * y - 1) ** 3 - x * x * y ** 3 <= 0
            if not inside and -1.34 < y0 < -0.85:  # 꼬리: 아래로 갈수록 가늘게
                inside = abs(x0 - 0.03 * (y0 + 1.0)) < 0.06 * (y0 + 1.34) / 0.49
            a[j * size + i] = 1.0 if inside else 0.0
    a = box_blur(box_blur(a, size, 6), size, 6)
    im = bpy.data.images.new('heart_mask', size, size, alpha=False)
    px = [0.0] * (size * size * 4)
    for q, v in enumerate(a):
        o = q * 4
        px[o] = px[o + 1] = px[o + 2] = v
        px[o + 3] = 1.0
    im.pixels = px
    return im


def mat_latte(name):
    """라테 표면: 갈색 크레마 + 흰 거품(가운데 동그라미 반지름 R, 또는 하트). 거품은 경계에서 크레마 쪽으로 부서지고(낮은 노이즈),
    흰 바탕에도 고운 기포 결이 있음(완전히 또렷한 곳이 없게). 돌려줌: (재질, R 값 노드, 하트 값 노드)"""
    m, nt, b = new_mat(name)
    N, L = nt.nodes, nt.links
    tc = N.new('ShaderNodeTexCoord')

    def noise(scale, detail):
        nz = N.new('ShaderNodeTexNoise')
        nz.inputs['Scale'].default_value = scale
        nz.inputs['Detail'].default_value = detail
        L.new(tc.outputs['Object'], nz.inputs['Vector'])
        return nz

    def math_node(op, a=None, b=None, clamp=False):
        n = N.new('ShaderNodeMath')
        n.operation = op
        n.use_clamp = clamp
        for idx, v in ((0, a), (1, b)):
            if v is None:
                continue
            if isinstance(v, (int, float)):
                n.inputs[idx].default_value = v
            else:
                L.new(v, n.inputs[idx])
        return n
    crema = ramp2(N, lin('#6E3F1C'), lin('#A56E3B'), 0.3, 0.75)
    L.new(noise(90.0, 6.0).outputs['Fac'], crema.inputs['Fac'])
    flat = N.new('ShaderNodeVectorMath')
    flat.operation = 'MULTIPLY'
    flat.inputs[1].default_value = (1.0, 1.0, 0.0)
    L.new(tc.outputs['Object'], flat.inputs[0])
    ln = N.new('ShaderNodeVectorMath')
    ln.operation = 'LENGTH'
    L.new(flat.outputs['Vector'], ln.inputs[0])
    R = N.new('ShaderNodeValue')
    R.outputs[0].default_value = 0.0
    sub = math_node('SUBTRACT', R.outputs[0], ln.outputs['Value'])
    dot0 = math_node('MULTIPLY_ADD', sub.outputs['Value'], 1 / 0.005, clamp=True)  # 동그라미 가장자리 5mm 에 걸쳐 번짐
    dot0.inputs[2].default_value = 0.5
    dot = math_node('MULTIPLY', dot0.outputs['Value'], math_node('MULTIPLY', R.outputs[0], 1 / 0.004, clamp=True).outputs['Value'])  # 반지름 0 이면 아무것도 없음(가운데 흰 점 없이)
    mp = N.new('ShaderNodeMapping')  # 객체 좌표 → 하트 그림 좌표(가로세로 0.06m)
    mp.inputs['Scale'].default_value = (1 / 0.06, 1 / 0.06, 1.0)
    mp.inputs['Location'].default_value = (0.5 - 0.006 / 0.06, 0.5 + 0.004 / 0.06, 0.0)  # 하트는 주둥이에서 조금 떨어진 오른쪽 아래
    L.new(tc.outputs['Object'], mp.inputs['Vector'])
    tex = N.new('ShaderNodeTexImage')
    tex.image = heart_image()
    tex.extension = 'CLIP'
    L.new(mp.outputs['Vector'], tex.inputs['Vector'])
    H = N.new('ShaderNodeValue')
    H.outputs[0].default_value = 0.0
    hm = math_node('MULTIPLY', tex.outputs['Color'], H.outputs[0])
    mask = math_node('MAXIMUM', dot.outputs['Value'], hm.outputs['Value'])
    # 경계에서 부서짐: 가장자리(mask 가 0.5 근처)일수록 노이즈만큼 밀거나 당김
    twice = math_node('MULTIPLY_ADD', mask.outputs['Value'], 2.0)  # mask × 2 - 1
    twice.inputs[2].default_value = -1.0
    edge = math_node('SUBTRACT', 1.0, math_node('ABSOLUTE', twice.outputs['Value']).outputs['Value'])  # 가장자리에서 1, 안쪽·바깥에서 0
    wob =math_node('MULTIPLY', math_node('SUBTRACT', noise(160.0, 4.0).outputs['Fac'], 0.5).outputs['Value'], edge.outputs['Value'])
    mask2 = math_node('MULTIPLY_ADD', wob.outputs['Value'], 0.9, clamp=True)
    L.new(mask.outputs['Value'], mask2.inputs[2])
    foam = ramp2(N, lin('#E8DAC4'), lin('#F6F0E5'), 0.3, 0.7)  # 거품의 고운 기포 결
    L.new(noise(700.0, 2.0).outputs['Fac'], foam.inputs['Fac'])
    d = N.new('ShaderNodeVectorMath')  # 색 = 크레마 + (거품 - 크레마) × mask2
    d.operation = 'SUBTRACT'
    L.new(foam.outputs['Color'], d.inputs[0])
    L.new(crema.outputs['Color'], d.inputs[1])
    sc = N.new('ShaderNodeVectorMath')
    sc.operation = 'SCALE'
    L.new(d.outputs['Vector'], sc.inputs[0])
    L.new(mask2.outputs['Value'], sc.inputs['Scale'])
    add = N.new('ShaderNodeVectorMath')
    add.operation = 'ADD'
    L.new(crema.outputs['Color'], add.inputs[0])
    L.new(sc.outputs['Vector'], add.inputs[1])
    L.new(add.outputs['Vector'], b.inputs['Base Color'])
    rough = math_node('MULTIPLY_ADD', mask2.outputs['Value'], 0.1)  # 거품은 조금 더 거칠게
    rough.inputs[2].default_value = 0.5
    L.new(rough.outputs['Value'], b.inputs['Roughness'])
    S(b, spec=0.15)  # 빛 반사가 거품 얼룩처럼 보이지 않게 약하게
    return m, R, H


def build_pour_pitcher(lip, theta, c):
    """기운 스팀 피처: 주둥이 끝이 lip 에 오게, 오른쪽(+X)으로 theta° 기울임 + 안의 우유(수평면 아래만, Boolean 교집합)"""
    t = math.radians(theta)
    sx, sz = 0.0362 + 0.017, 0.1055 + 0.005  # 피처 좌표의 주둥이 끝
    ox = lip[0] - (sx * math.cos(t) + sz * math.sin(t))
    oz = lip[2] - (-sx * math.sin(t) + sz * math.cos(t))
    o = (ox, lip[1], oz)
    lathe('PITP_body', PITCHER, M['steel'], o, c, warp=spout).rotation_euler = (0, t, 0)

    def tp(px, pz):
        return (ox + px * math.cos(t) + pz * math.sin(t), lip[1], oz - px * math.sin(t) + pz * math.cos(t))
    tube('PITP_handle', [tp(-0.034, 0.093), tp(-0.058, 0.090), tp(-0.066, 0.062), tp(-0.058, 0.032), tp(-0.037, 0.024)], 0.0048, M['steel'], c)
    inner = [(0.0, 0.0025), (0.033, 0.0025), (0.0372, 0.007), (0.0382, 0.018), (0.0384, 0.035), (0.0374, 0.055), (0.0354, 0.075),
             (0.034, 0.088), (0.0345, 0.098), (0.0352, 0.104), (0.0, 0.104)]
    milk = lathe('PITP_milk', inner, M['milk'], o, c, warp=spout)
    milk.rotation_euler = (0, t, 0)
    cut = box('PITP_cut', (0.4, 0.4, 0.4), (ox, lip[1], lip[2] - 0.0025 - 0.2), M['milk'], 'rig', bev=0.0)
    cut.hide_render = True
    md = milk.modifiers.new('Cut', 'BOOLEAN')
    md.operation = 'INTERSECT'
    md.object = cut


def build_pour_stream(lip, end, c):
    mid = ((lip[0] + end[0]) / 2 + 0.003, lip[1], (lip[2] + end[2]) / 2 + 0.004)
    tube('POUR_stream', [lip, mid, end], 0.0027, M['milk'], c)


def build_mug_liquid(at, z0, h, mat, c):
    """머그 안 음료(머그 바닥에서 높이 h 까지, 안쪽 벽보다 조금 작게). 돌려줌: 표면 높이(세상)"""
    prof = [(0.0, 0.0106), (mug_inner_r(0.0108) - 0.0003, 0.0108)]
    for hh in (0.0125, 0.018, 0.03, 0.05, 0.07, 0.085):
        if hh < h - 0.001:
            prof.append((mug_inner_r(hh) - 0.0003, hh))
    prof += [(mug_inner_r(h) - 0.0003, h), (0.0, h)]
    lathe('POUR_liquid', prof, mat, (at[0], at[1], z0), c, segs=128)
    return z0 + h


LATTE = None


def shot_pour(sdir, preview, only=None):
    """붓기: 받침 위 머그를 위에서(약 62°) 내려다보고, 왼쪽에서 기운 피처로 붓기.
    두 가지(pour_milk: 빈 머그에 우유 · pour_latte: 에스프레소에 우유) × 17단계 × 줄기 있음/없음 + 라테 하트(알맞아요 칸의 단계)"""
    global LATTE
    mx, my, z0 = 0.10, -0.20, 0.0072
    for ob in list(coll('pour_static').objects):
        bpy.data.objects.remove(ob, do_unlink=True)
    clear_dyn()
    lathe('POURM_saucer', SAUCER, M['ceramic'], (mx, my, 0.0), 'pour_static')
    lathe('POURM_body', MUG, M['ceramic'], (mx, my, z0), 'pour_static')
    a = math.radians(-35.0)

    def mr(px, pz):
        return (mx + px * math.cos(a), my + px * math.sin(a), z0 + pz)
    tube('POURM_handle', [mr(0.0405, 0.074), mr(0.064, 0.079), mr(0.0755, 0.058), mr(0.068, 0.031), mr(0.0400, 0.025)], 0.0066, M['ceramic'], 'pour_static')
    lip = (mx - 0.026, my, z0 + 0.0913 + 0.02)  # 주둥이 끝: 머그 왼쪽 가장자리 쪽, 테두리 위 2cm(표면을 덜 가리게)
    build_pour_pitcher(lip, 58.0, 'pour_static')
    show_only(('pour_static', 'shot_dyn'))  # 작업대 위만(머신·다른 물건은 이 컷 밖)
    cam.data.lens = 50
    el, d = math.radians(62), 0.78
    tgt = Vector((mx - 0.06, my + 0.005, 0.055))
    cam.location = tgt + Vector((0.0, -math.cos(el) * d, math.sin(el) * d))
    look(cam, tgt)
    cam.data.dof.use_dof = True
    cam.data.dof.focus_object = None
    cam.data.dof.focus_distance = (Vector((mx, my, z0 + 0.07)) - cam.location).length
    cam.data.dof.aperture_fstop = 5.6
    cy.seed = 11
    if LATTE is None:
        LATTE = mat_latte('latte_top')
    lat, R, H = LATTE
    spill_latte = basic('spill_latte', lin('#C79A6B'), rough=0.3)

    def level(p, latte):
        lo = 0.026 if latte else 0.0125
        return lo + p * (0.0895 - lo)

    def build_for(latte, art=False):
        def build(k, p, flow):
            surf = z0 + 0.0106
            if latte or k > 0:
                R.outputs[0].default_value = 0.0 if art else (0.026 * sstep((p - 0.45) / 0.5) if latte else 0.0)
                H.outputs[0].default_value = 1.0 if art else 0.0
                surf = build_mug_liquid((mx, my), z0, level(p, latte), lat if latte else M['milk'], 'shot_dyn')
            if p >= 0.999:  # 넘쳐요: 받침에 흘러넘침
                ball('POUR_spill', 0.02, (mx + 0.05, my - 0.028, 0.011), spill_latte if latte else M['milk'], 'shot_dyn', scale=(1.5, 0.9, 0.07))
            if flow:
                build_pour_stream(lip, (mx - 0.012, my, surf), 'shot_dyn')
        return build
    if preview:
        build_for(True)(14, 0.875, True)
        render(os.path.join(sdir, 'preview_pour.jpg'), (1472, 400), 64, fmt='JPEG')
        clear_dyn()
        build_for(True, art=True)(13, 0.8125, False)
        render(os.path.join(sdir, 'preview_pour_heart.jpg'), (1472, 400), 64, fmt='JPEG')
        return
    if not only:
        render(os.path.join(sdir, 'pour_plate.png'), SHOT_RES, 384)
    pts = [Vector((mx + dx, my + dy, zz)) for dx in (-0.046, 0.046) for dy in (-0.046, 0.046) for zz in (z0 + 0.01, z0 + 0.095)]
    pts += [Vector(lip), Vector((lip[0] - 0.012, lip[1], lip[2] + 0.012))]
    pts += [Vector((mx + 0.05 + dx, my - 0.028 + dy, 0.011)) for dx in (-0.032, 0.032) for dy in (-0.02, 0.02)]
    rect = frame_rect(pts)
    if not only:
        render_frames(sdir, 'pour_milk', rect, 17, build_for(False), plate='pour_plate')
    # 라테아트 하트: 알맞아요 칸(0.69~0.94)에 드는 단계만, 줄기 없음
    art_ks = [k for k in range(17) if 0.69 - 1e-6 <= k / 16 <= 0.94 + 1e-6]
    render_frames(sdir, 'pour_latte', rect, 17, build_for(True), plate='pour_plate', art=(art_ks, build_for(True, art=True)))


PITCHER_INNER = [(0.0022, 0.034), (0.0065, 0.0373), (0.018, 0.0384), (0.035, 0.0386), (0.055, 0.0377), (0.075, 0.0357), (0.088, 0.0343), (0.098, 0.0348), (0.105, 0.0355)]


def pitcher_inner_r(h):
    """스팀 피처 안쪽 반지름(바닥에서 잰 높이 h, 주둥이 쪽은 빼고)"""
    if h <= PITCHER_INNER[0][0]:
        return PITCHER_INNER[0][1]
    for (h0, r0), (h1, r1) in zip(PITCHER_INNER, PITCHER_INNER[1:]):
        if h <= h1:
            return r0 + (r1 - r0) * (h - h0) / (h1 - h0)
    return PITCHER_INNER[-1][1]


def mat_foam(name):
    """우유 거품 겉면: 고운 거품 결(늘 조금) + 굵은 거품 방울(coarse 0~1) · 거칠기. 거품이라 또렷한 곳이 없게.
    돌려줌: (재질, coarse 값 노드, 거칠기 값 노드)"""
    m, nt, b = new_mat(name)
    N, L = nt.nodes, nt.links
    tc = N.new('ShaderNodeTexCoord')

    def noise(scale, detail):
        nz = N.new('ShaderNodeTexNoise')
        nz.inputs['Scale'].default_value = scale
        nz.inputs['Detail'].default_value = detail
        L.new(tc.outputs['Object'], nz.inputs['Vector'])
        return nz
    col = ramp2(N, lin('#EDE5D6'), lin('#FAF7F0'), 0.3, 0.7)
    L.new(noise(120.0, 3.0).outputs['Fac'], col.inputs['Fac'])
    L.new(col.outputs['Color'], b.inputs['Base Color'])
    vor = N.new('ShaderNodeTexVoronoi')  # 굵은 방울(약 2~3mm)
    vor.feature = 'F1'
    vor.inputs['Scale'].default_value = 380.0
    L.new(tc.outputs['Object'], vor.inputs['Vector'])
    dome = map_range(N, 0.0, 0.55, 1.0, 0.0)  # 방울 가운데가 볼록, 가장자리는 부드럽게
    L.new(vor.outputs['Distance'], dome.inputs['Value'])
    C = N.new('ShaderNodeValue')
    C.outputs[0].default_value = 0.0
    hb = N.new('ShaderNodeMath')
    hb.operation = 'MULTIPLY'
    L.new(dome.outputs['Result'], hb.inputs[0])
    L.new(C.outputs[0], hb.inputs[1])
    fine = N.new('ShaderNodeMath')  # 고운 거품 결
    fine.operation = 'MULTIPLY'
    L.new(noise(900.0, 2.0).outputs['Fac'], fine.inputs[0])
    fine.inputs[1].default_value = 0.25
    hsum = N.new('ShaderNodeMath')
    hsum.operation = 'ADD'
    L.new(hb.outputs['Value'], hsum.inputs[0])
    L.new(fine.outputs['Value'], hsum.inputs[1])
    bump = N.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = 0.55
    bump.inputs['Distance'].default_value = 0.0008
    L.new(hsum.outputs['Value'], bump.inputs['Height'])
    L.new(bump.outputs['Normal'], b.inputs['Normal'])
    Rn = N.new('ShaderNodeValue')
    Rn.outputs[0].default_value = 0.2
    L.new(Rn.outputs[0], b.inputs['Roughness'])
    S(b, spec=0.35, sss=0.2)
    return m, C, Rn


FOAM = None


def build_foam_surface(center, z, r, flow, tip, mat, c):
    """피처 안 우유 겉면(극좌표 격자). flow 면 노즐 둘레가 오목하게 돌고(소용돌이) 결이 짐"""
    rings, secs = 22, 96
    cx, cy = center
    verts, faces = [], []

    def dz(x, y, rr, a):
        if not flow:
            return 0.0
        dt = math.hypot(x - tip[0], y - tip[1])
        return -0.006 * math.exp(-(dt / 0.014) ** 2) + 0.001 * math.sin(5 * a + 90 * rr) * (rr / r)
    verts.append((cx, cy, z + dz(cx, cy, 0.0, 0.0)))
    for i in range(1, rings + 1):
        rr = r * i / rings
        for j in range(secs):
            a = 2 * math.pi * j / secs
            x, y = cx + rr * math.cos(a), cy + rr * math.sin(a)
            verts.append((x, y, z + dz(x, y, rr, a)))
    for j in range(secs):
        faces.append((0, 1 + j, 1 + (j + 1) % secs))
    for i in range(rings - 1):
        b0, b1 = 1 + i * secs, 1 + (i + 1) * secs
        for j in range(secs):
            k = (j + 1) % secs
            faces.append((b0 + j, b1 + j, b1 + k, b0 + k))
    me = bpy.data.meshes.new('FOAM_surface')
    me.from_pydata(verts, [], faces)
    me.update()
    smooth(me)
    return obj('FOAM_surface', me, mat, (0, 0, 0), c)


def shot_foam(sdir, preview):
    """거품 내기: 물받이 위 스팀 피처를 오른쪽 앞 위에서(약 58°) 내려다봄. 띠 값만큼 우유가 부풀어 겉면이 테두리 쪽으로 오르고,
    적어요 = 매끈한 우유 · 알맞아요 = 고운 거품(실크 결) · 많아요 = 굵은 방울. 13단계 × 스팀 켬(소용돌이)/끔"""
    global FOAM
    X = GX[0] + 0.155
    px, py, pz = X + 0.235, FY - 0.08, 0.0635
    for ob in [o for o in COLL['machine'].objects if o.name.startswith(('M_steam_wand', 'M_steam_tip'))]:
        bpy.data.objects.remove(ob, do_unlink=True)
    for cname in ('steam_static', 'foam_static'):
        for ob in list(coll(cname).objects):
            bpy.data.objects.remove(ob, do_unlink=True)
    clear_dyn()
    wx = X + 0.30
    tip = (px + 0.012, py + 0.004)  # 노즐 끝: 가운데에서 조금 비껴(소용돌이가 돌게)
    tube('M_steam_wand', [(wx, FY + 0.01, 0.36), (wx - 0.004, FY - 0.04, 0.335), (px + 0.02, py + 0.008, 0.245), (tip[0], tip[1], pz + 0.06)], 0.0056, M['chrome'], 'machine')
    cyl('M_steam_tip', 0.0068, 0.012, (tip[0], tip[1], pz + 0.055), M['chrome'], 'machine')
    turn = 180.0
    lathe('PITF_body', PITCHER, M['steel'], (px, py, pz), 'foam_static', warp=spout, rotz=math.radians(turn))
    ha = math.radians(turn + 180)

    def hp(q, zz):
        return (px + q * math.cos(ha), py + q * math.sin(ha), pz + zz)
    tube('PITF_handle', [hp(0.034, 0.093), hp(0.058, 0.090), hp(0.066, 0.062), hp(0.058, 0.032), hp(0.037, 0.024)], 0.0048, M['steel'], 'foam_static')
    show_only(('machine', 'tamper', 'foam_static', 'shot_dyn'))
    cam.data.lens = 50
    tgt = Vector((px - 0.004, py + 0.004, pz + 0.078))
    az, el, d = math.radians(42), math.radians(55), 0.52  # 피처 쪽으로 가깝게, 오른쪽에서(포터필터 손잡이는 화면 밖)
    cam.location = tgt + d * Vector((math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el)))
    look(cam, tgt)
    cam.data.dof.use_dof = True
    cam.data.dof.focus_object = None
    cam.data.dof.focus_distance = (Vector((px, py, pz + 0.075)) - cam.location).length
    cam.data.dof.aperture_fstop = 5.6
    cy.seed = 11
    if FOAM is None:
        FOAM = mat_foam('foam_top')
    fm, C, Rn = FOAM

    def build(k, p, flow):
        h = 0.052 + p * (0.098 - 0.052)  # 피처 바닥에서 잰 겉면 높이: 부풀수록 테두리(0.106) 쪽으로
        C.outputs[0].default_value = sstep((p - 0.5) / 0.4)  # 많아요 쪽일수록 굵은 방울
        Rn.outputs[0].default_value = 0.14 + 0.45 * sstep(p / 0.9)  # 매끈(윤기) → 고운 거품 → 거친 거품
        r = pitcher_inner_r(h) - 0.0006
        prof = [(0.0, 0.003), (pitcher_inner_r(0.003) - 0.0006, 0.003)]
        for hh in (0.0065, 0.018, 0.035, 0.055, 0.075, 0.088):
            if hh < h - 0.002:
                prof.append((pitcher_inner_r(hh) - 0.0006, hh))
        prof += [(r, h - 0.0012), (0.0, h - 0.0012)]
        lathe('FOAM_milk', prof, M['milk'], (px, py, pz), 'shot_dyn', segs=96)
        build_foam_surface((px, py), pz + h, r, flow, tip, fm, 'shot_dyn')
    if preview:
        for k, p, flow in ((0, 0.12, True), (1, 0.44, True), (2, 0.9, False)):
            clear_dyn()
            build(k, p, flow)
            render(os.path.join(sdir, f'preview_foam{k}.jpg'), (1472, 400), 64, fmt='JPEG')
        return
    clear_dyn()
    render(os.path.join(sdir, 'foam_plate.png'), SHOT_RES, 384)
    pts = [Vector((px + dx, py + dy, pz + zz)) for dx in (-0.046, 0.046) for dy in (-0.046, 0.046) for zz in (0.045, 0.108)]
    render_frames(sdir, 'foam', frame_rect(pts), 13, build)


SHOTS = {'extract': shot_extract, 'steam': shot_steam, 'pour': shot_pour, 'foam': shot_foam,
         'pour_latte': lambda sdir, preview: shot_pour(sdir, preview, only='latte')}  # 라테 프레임만(배경판·우유는 그대로)


ALL = ('machine', 'mug', 'pitcher', 'tamper', 'shot')
modes = ['full', 'bg', 'extract', 'sprites'] if MODE == 'all' else [MODE]  # 물건 그림은 보이기 설정을 바꾸므로 맨 끝
blend = os.path.join(OUT, 'bench_test.blend')
bpy.ops.wm.save_as_mainfile(filepath=blend, compress=True)
log('저장', blend)
for mode in modes:
    if mode in ('preview', 'full'):
        main_camera()
        show_only(ALL)
        if mode == 'preview':
            render(os.path.join(OUT, 'preview_full.jpg'), (960, 540), 48, fmt='JPEG')
        else:
            render(os.path.join(OUT, 'bench_full.jpg'), (1920, 1080), 384, fmt='JPEG')
    elif mode == 'bg':
        main_camera()
        show_only(())
        render(os.path.join(OUT, 'workbench_morning.jpg'), (2560, 700), 256, fmt='JPEG')
    elif mode == 'extract':
        show_only(('machine', 'shot_extract', 'tamper'))
        gx = GX[0]
        cam.data.lens = 55
        cam.location = (gx + 0.13, -0.98, 0.36)
        look(cam, (gx + 0.01, -0.29, 0.17))
        render(os.path.join(OUT, 'shot_extract.jpg'), (1920, 1080), 384, fmt='JPEG')
    elif mode in ('shots', 'shots_preview'):
        # 동작마다 한 컷: 셋째 인자로 고름(쉼표, 없으면 모두) 예) ... -- assets/_src/blender shots steam
        sdir = os.path.join(OUT, 'shots')
        os.makedirs(sdir, exist_ok=True)
        for sid in (ARGS[2] if len(ARGS) > 2 else ','.join(SHOTS)).split(','):
            SHOTS[sid](sdir, mode == 'shots_preview')
    elif mode == 'sprites':
        os.makedirs(os.path.join(OUT, 'sprites'), exist_ok=True)
        jobs = [('obj_machine', ('machine',), (1600, 1200)), ('cup_mug_americano', ('mug',), (1024, 1024)),
                ('obj_pitcher_milk', ('pitcher',), (1024, 1024)), ('cup_shot', ('shot',), (1024, 1024)), ('obj_tamper', ('tamper',), (1024, 1024))]
        cam.data.lens = 45
        side_shadows(False)
        for name, cols, res in jobs:
            sprite_setup(cols)
            objs = [o for cn in cols for o in COLL[cn].objects]
            # 컵은 안의 음료가 보이게 조금 더 위에서(약 28°) 내려다봄
            v = Vector((VIEW.x, VIEW.y, 0)).normalized() * math.cos(math.radians(28)) + Vector((0, 0, -math.sin(math.radians(28))))
            fit_camera(objs, res, view=v if cols[0] in ('mug', 'shot') else None)
            render(os.path.join(OUT, 'sprites', f'{name}.png'), res, 256, transparent=True, fmt='PNG')
log('끝', MODE)
