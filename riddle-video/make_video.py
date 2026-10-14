"""Generates two vertical (1080x1920) riddle videos: the challenge and the solution."""
import math, struct, subprocess, sys, wave, os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = sys.argv[1] if len(sys.argv) > 1 else HERE
W, H, FPS = 1080, 1920, 30

BG = (16, 22, 44)
GRID = (26, 34, 64)
WHITE = (245, 245, 240)
YELLOW = (255, 204, 51)
RED = (255, 84, 104)
GREEN = (80, 220, 140)
CYAN = (90, 200, 255)

_fonts = {}
def font(size, bold=True):
    key = (int(size), bold)
    if key not in _fonts:
        _fonts[key] = ImageFont.truetype(os.path.join(FONT_DIR, "Rubik-900.ttf" if bold else "Rubik-500.ttf"), max(1, int(size)))
    return _fonts[key]

def clamp(v, a=0.0, b=1.0): return max(a, min(b, v))
def prog(t, start, dur): return clamp((t - start) / dur)
def ease_out(p): return 1 - (1 - p) ** 3
def ease_inout(p): return 3 * p * p - 2 * p * p * p
def pop(p):  # overshoot scale 0 -> 1
    if p <= 0: return 0
    if p >= 1: return 1
    c = 1.70158 * 1.4
    q = p - 1
    return 1 + (c + 1) * q ** 3 + c * q ** 2
def lerp(a, b, p): return a + (b - a) * p
def mix(c1, c2, p): return tuple(int(lerp(a, b, p)) for a, b in zip(c1, c2))
def is_hebrew(s): return any("֐" <= ch <= "׿" for ch in s)

def make_bg():
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    for x in range(0, W, 60): d.line([(x, 0), (x, H)], fill=GRID, width=2)
    for y in range(0, H, 60): d.line([(0, y), (W, y)], fill=GRID, width=2)
    return img
BG_IMG = make_bg()

def text(d, xy, s, size, color, alpha=1.0, bold=True, stroke=0, stroke_color=BG):
    if alpha <= 0 or size < 2: return
    kw = dict(font=font(size, bold), anchor="mm", fill=mix(BG, color, alpha))
    if is_hebrew(s): kw.update(direction="rtl", language="he")
    if stroke: kw.update(stroke_width=stroke, stroke_fill=stroke_color)
    d.text(xy, s, **kw)

def pill(d, xy, s, size, fg, bg, alpha=1.0):
    if alpha <= 0 or size < 2: return
    f = font(size)
    kw = dict(direction="rtl", language="he") if is_hebrew(s) else {}
    l, t, r, b = d.textbbox(xy, s, font=f, anchor="mm", **kw)
    pad = size * 0.35
    d.rounded_rectangle([l - pad, t - pad * 0.8, r + pad, b + pad * 0.8], radius=size * 0.4, fill=mix(BG, bg, alpha))
    text(d, xy, s, size, fg, alpha)

# ---- Shape (units, y up). Width 18, height 12, notch 7 wide x 4 deep. Perimeter = 60.
# Layout keeps everything inside Instagram Reels safe zone (~y 220-1560, clear of right-side buttons).
S, OX, OY = 42, 162, 1105
def P(x, y): return (OX + x * S, OY - y * S)
PTS = [(0, 0), (0, 12), (7, 12), (7, 8), (18, 8), (18, 0), (0, 0)]

def draw_path(d, pts, p, color, width=12):
    segs = list(zip(pts, pts[1:]))
    lens = [math.dist(P(*a), P(*b)) for a, b in segs]
    remaining = sum(lens) * p
    for (a, b), L in zip(segs, lens):
        if remaining <= 0: break
        f = min(1, remaining / L)
        A, B = P(*a), P(*b)
        E = (lerp(A[0], B[0], f), lerp(A[1], B[1], f))
        d.line([A, E], fill=color, width=width)
        for c in (A, E): d.ellipse([c[0] - width / 2, c[1] - width / 2, c[0] + width / 2, c[1] + width / 2], fill=color)
        remaining -= L

LABELS = [  # (unit position, text)
    ((1.9, 6), "12"), ((3.5, 13.1), "7"), ((8.3, 10), "4"), ((9, -1.3), "18"),
]
QMARKS = [((12.5, 9.2), "?"), ((16.9, 4), "?")]

def draw_labels(d, t, start, step=0.35):
    for i, (pos, s) in enumerate(LABELS):
        sc = pop(prog(t, start + i * step, 0.45))
        pill(d, P(*pos), s + " מ'", 52 * sc, BG, YELLOW, clamp(sc))

def draw_qmarks(d, t, start):
    for i, (pos, s) in enumerate(QMARKS):
        sc = pop(prog(t, start + i * 0.3, 0.45))
        pulse = 1 + 0.08 * math.sin(t * 6 + i)
        text(d, P(*pos), s, 72 * sc * pulse, RED, clamp(sc))

def header(d, t, start=0.0):
    sc = pop(prog(t, start, 0.6))
    pill(d, (W / 2, 245), "חידת היום", 70 * sc, BG, YELLOW, clamp(sc))
    a = ease_out(prog(t, start + 0.5, 0.5))
    text(d, (W / 2, 345), "בלי עט. בלי דף.", 64, WHITE, a)

# ---------------- Challenge video ----------------
CH_DUR = 23.0
CD_START, CD_LEN = 10.0, 10

def challenge_frame(t):
    img = BG_IMG.copy(); d = ImageDraw.Draw(img)
    header(d, t)
    draw_path(d, PTS, ease_inout(prog(t, 1.5, 2.5)), WHITE)
    draw_labels(d, t, 4.2)
    draw_qmarks(d, t, 5.9)
    q = pop(prog(t, 7.0, 0.6))
    text(d, (W / 2, 445), "מה ההיקף של הצורה?", 76 * q, CYAN, clamp(q))
    a = ease_out(prog(t, 8.2, 0.5))
    text(d, (W / 2, 1275), "עצרו את הסרטון וחשבו!", 50, WHITE, a, bold=False)
    # countdown ring
    if CD_START <= t < CD_START + CD_LEN + 0.6:
        cx, cy, r = W / 2, 1435, 100
        el = t - CD_START
        n = max(0, CD_LEN - int(el))
        frac = clamp(1 - el / CD_LEN)
        ap = ease_out(prog(t, CD_START, 0.4))
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=mix(BG, GRID, 1), width=18)
        col = YELLOW if n > 3 else RED
        if frac > 0:
            d.arc([cx - r, cy - r, cx + r, cy + r], -90, -90 + 360 * frac, fill=mix(BG, col, ap), width=18)
        tick = pop(clamp((el % 1) / 0.3)) if el < CD_LEN else 1
        text(d, (cx, cy), str(n), 120 * (0.85 + 0.15 * tick), col, ap)
    if t >= CD_START + CD_LEN:
        p = pop(prog(t, CD_START + CD_LEN + 0.3, 0.6))
        pill(d, (W / 2, 1410), "כתבו את התשובה בתגובות!", 62 * p, BG, GREEN, clamp(p))
        a = ease_out(prog(t, CD_START + CD_LEN + 1.0, 0.5))
        text(d, (W / 2, 1525), "הפתרון בסרטון הבא", 50, WHITE, a, bold=False)
    return img

def challenge_audio():
    ev = [(1.5, 660, 0.12), (7.0, 880, 0.15)]
    ev += [(CD_START + i, 1200 if CD_LEN - i <= 3 else 900, 0.06) for i in range(CD_LEN)]
    ev += [(CD_START + CD_LEN + 0.3, 1046, 0.5), (CD_START + CD_LEN + 0.45, 1318, 0.6)]
    return ev

# ---------------- Solution video ----------------
SO_DUR = 17.0

def solution_frame(t):
    img = BG_IMG.copy(); d = ImageDraw.Draw(img)
    pill(d, (W / 2, 245), "הפתרון", 70, BG, GREEN)
    a1 = ease_out(prog(t, 0.3, 0.5))
    text(d, (W / 2, 345), "נזיז את הצלעות החסרות...", 58, WHITE, a1)
    m = ease_inout(prog(t, 2.5, 1.5))    # lift the 11 m horizontal edge up by 4
    m2 = ease_inout(prog(t, 4.5, 1.5))   # slide the 4 m vertical edge right by 11
    pts_fixed = [(7, 12), (0, 12), (0, 0), (18, 0), (18, 8)]
    draw_path(d, pts_fixed, 1, WHITE)
    lift = 4 * m
    draw_path(d, [(7, 8 + lift), (18, 8 + lift)], 1, CYAN if 0 < m < 1 or t < 7 else WHITE)
    slide = 11 * m2
    draw_path(d, [(7 + slide, 12), (7 + slide, 8)], 1, RED if t < 7 else WHITE)
    # ghost of original notch
    if m > 0:
        for a, b in [((7, 12), (7, 8)), ((7, 8), (18, 8))]:
            A, B = P(*a), P(*b)
            n = 14
            for i in range(0, n, 2):
                d.line([(lerp(A[0], B[0], i / n), lerp(A[1], B[1], i / n)), (lerp(A[0], B[0], (i + 1) / n), lerp(A[1], B[1], (i + 1) / n))], fill=mix(BG, WHITE, 0.25 * min(m, 1)), width=4)
    a2 = ease_out(prog(t, 6.5, 0.5))
    text(d, (W / 2, 445), "קיבלנו מלבן 18 על 12!", 66, CYAN, a2)
    for i, (pos, s) in enumerate([((9, 13.1), "18"), ((9, -1.3), "18"), ((1.9, 6), "12"), ((16.1, 6), "12")]):
        sc = pop(prog(t, 7.2 + i * 0.3, 0.45))
        pill(d, P(*pos), s + " מ'", 52 * sc, BG, YELLOW, clamp(sc))
    e = pop(prog(t, 9.0, 0.6))
    text(d, (W / 2, 1275), "18 + 12 + 18 + 12", 72 * e, WHITE, clamp(e))
    r = pop(prog(t, 10.3, 0.7))
    pill(d, (W / 2, 1410), "ההיקף = 60 מטר", 84 * r, BG, GREEN, clamp(r))
    a3 = ease_out(prog(t, 12.0, 0.5))
    text(d, (W / 2, 1528), "צדקתם? כתבו בתגובות!", 52, WHITE, a3, bold=False)
    return img

def solution_audio():
    return [(2.5, 520, 0.2), (4.5, 620, 0.2), (6.5, 880, 0.15), (10.3, 1046, 0.5), (10.45, 1318, 0.7)]

# ---------------- Rendering ----------------
def write_wav(path, events, dur, sr=44100):
    n = int(dur * sr); buf = [0.0] * n
    for start, freq, length in events:
        s0 = int(start * sr)
        for i in range(int(length * sr)):
            if s0 + i >= n: break
            env = min(1, i / 300) * math.exp(-4 * i / (length * sr))
            buf[s0 + i] += 0.35 * env * math.sin(2 * math.pi * freq * i / sr)
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes(b"".join(struct.pack("<h", int(clamp(v, -1, 1) * 32767)) for v in buf))

def render(frame_fn, dur, events, out):
    wav = out + ".wav"
    write_wav(wav, events, dur)
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
           "-i", wav, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-preset", "medium", "-c:a", "aac", "-b:a", "128k",
           "-movflags", "+faststart", "-shortest", out]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for i in range(int(dur * FPS)):
        p.stdin.write(frame_fn(i / FPS).tobytes())
    p.stdin.close(); p.wait(); os.remove(wav)
    print("wrote", out)

if __name__ == "__main__":
    if os.environ.get("PREVIEW"):
        for t in (9.0, 15.0, 22.0): challenge_frame(t).save(os.path.join(HERE, f"preview_challenge_{t}.png"))
        for t in (5.0, 16.0): solution_frame(t).save(os.path.join(HERE, f"preview_solution_{t}.png"))
        sys.exit()
    render(challenge_frame, CH_DUR, challenge_audio(), os.path.join(HERE, "riddle_challenge.mp4"))
    render(solution_frame, SO_DUR, solution_audio(), os.path.join(HERE, "riddle_solution.mp4"))
