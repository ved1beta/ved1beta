"""Regenerates the dark_mode.svg / light_mode.svg templates.

Run this to change the ASCII portrait or any static text on the card; then run
today.py (or let the Action run) to fill in the live stats. Keeping LEN here in
sync with today.py is what holds every right-column line at exactly 60 chars.

    pip install pillow lxml && python build_svg.py
"""
import re
from PIL import Image, ImageOps, ImageEnhance
from xml.sax.saxutils import escape

WIDTH_CH = 60          # every right-column line is exactly 60 visible chars
# Consolas advance @16px w/ size-adjust:109% is ~9.59px. The stats column starts
# at x=390, so art ink must stay under (390-15)/9.59 = 39 cols. 38 leaves a margin.
# 38 cols x 25 rows at a 0.48 char aspect => a 0.73 w/h box; crop to match.
ASCII_ROWS, ASCII_COLS = 25, 38
ASCII_BOX = (52, 45, 282, 360)   # 230x315 => 0.73
RAMP = "@%#*+=-:. "

# reserved value widths -- MUST match the `length` args in today.py:svg_overwrite
# MUST mirror today.py. dots => (gap+2) wide; space => exactly `length` wide.
LEN = dict(age=49, repo=6, star=13, commit=23, follower=10,      # dots
           contrib=5, loc=8, loc_add=8, loc_del=7)               # space


# ---------------------------------------------------------------- ascii art
def ascii_art(path, box=ASCII_BOX):
    im = Image.open(path).convert("L").crop(box)
    im = ImageOps.autocontrast(im, cutoff=3)
    im = ImageEnhance.Contrast(im).enhance(1.55)
    im = im.resize((ASCII_COLS, ASCII_ROWS), Image.LANCZOS)
    px, n = im.load(), len(RAMP)
    return ["".join(RAMP[min(n - 1, px[x, y] * n // 256)] for x in range(ASCII_COLS)).rstrip()
            for y in range(ASCII_ROWS)]


# ---------------------------------------------------------------- dot runs
def jf_dots(length, value):
    """Byte-for-byte the dot run that today.py:justify_format would produce."""
    just_len = max(0, length - len(value))
    if just_len <= 2:
        return {0: "", 1: " ", 2: ". "}[just_len]
    return " " + "." * just_len + " "


def pad_fill(length, value):
    """Mirrors today.py:pad_format -- leading spaces, field is exactly `length`."""
    return " " * max(0, length - len(value))


def static_dots(n):
    if n <= 2:
        return {0: "", 1: " ", 2: ". "}[n]
    return " " + "." * (n - 2) + " "


# ---------------------------------------------------------------- span helpers
def keyspan(key):
    if "." in key:
        return '<tspan class="key">.</tspan>'.join(
            f'<tspan class="key">{escape(p)}</tspan>' for p in key.split("."))
    return f'<tspan class="key">{escape(key)}</tspan>'


def field(key, value):
    """Static '. key: ..... value' padded to exactly WIDTH_CH."""
    pad = WIDTH_CH - 2 - len(key) - 1 - len(value)
    assert pad >= 0, (key, value, pad)
    return (f'<tspan class="cc">. </tspan>{keyspan(key)}:'
            f'<tspan class="cc">{static_dots(pad)}</tspan>'
            f'<tspan class="value">{escape(value)}</tspan>')


def dyn(key, vid, lenkey, placeholder):
    """Dynamic field whose dots today.py recomputes each run."""
    return (f'<tspan class="cc">. </tspan>{keyspan(key)}:'
            f'<tspan class="cc" id="{vid}_dots">{jf_dots(LEN[lenkey], placeholder)}</tspan>'
            f'<tspan class="value" id="{vid}">{placeholder}</tspan>')


def blank():
    return '<tspan class="cc">. </tspan>'


def header(title):
    return f"<tspan>{escape(title)}</tspan> -{'—' * (WIDTH_CH - len(title) - 5)}-—-"


# ---------------------------------------------------------------- stats lines
PH = dict(repo="00", contrib="00", star="000", commit="0,000",
          follower="000", loc="000,000", loc_add="000,000", loc_del="00,000",
          age="0 years, 0 months, 0 days")


def repos_line():
    # 32 static + (repo+2) + contrib + (star+2) = 60
    return ('<tspan class="cc">. </tspan><tspan class="key">Repos</tspan>:'
            f'<tspan class="cc" id="repo_data_dots">{jf_dots(LEN["repo"], PH["repo"])}</tspan>'
            f'<tspan class="value" id="repo_data">{PH["repo"]}</tspan>'
            ' {<tspan class="key">Contributed</tspan>:'
            f'<tspan id="contrib_data_dots">{pad_fill(LEN["contrib"], PH["contrib"])}</tspan>'
            f'<tspan class="value" id="contrib_data">{PH["contrib"]}</tspan>'
            '} | <tspan class="key">Stars</tspan>:'
            f'<tspan class="cc" id="star_data_dots">{jf_dots(LEN["star"], PH["star"])}</tspan>'
            f'<tspan class="value" id="star_data">{PH["star"]}</tspan>')


def commits_line():
    return ('<tspan class="cc">. </tspan><tspan class="key">Commits</tspan>:'
            f'<tspan class="cc" id="commit_data_dots">{jf_dots(LEN["commit"], PH["commit"])}</tspan>'
            f'<tspan class="value" id="commit_data">{PH["commit"]}</tspan>'
            ' | <tspan class="key">Followers</tspan>:'
            f'<tspan class="cc" id="follower_data_dots">{jf_dots(LEN["follower"], PH["follower"])}</tspan>'
            f'<tspan class="value" id="follower_data">{PH["follower"]}</tspan>')


def loc_line():
    # 37 static + loc + loc_add + loc_del = 60 (all space-padded)
    return ('<tspan class="cc">. </tspan><tspan class="key">Lines of Code on GitHub</tspan>:'
            f'<tspan id="loc_data_dots">{pad_fill(LEN["loc"], PH["loc"])}</tspan>'
            f'<tspan class="value" id="loc_data">{PH["loc"]}</tspan>'
            ' ( '
            f'<tspan id="loc_add_dots">{pad_fill(LEN["loc_add"], PH["loc_add"])}</tspan>'
            f'<tspan class="addColor" id="loc_add">{PH["loc_add"]}</tspan>'
            '<tspan class="addColor">++</tspan>, '
            f'<tspan id="loc_del_dots">{pad_fill(LEN["loc_del"], PH["loc_del"])}</tspan>'
            f'<tspan class="delColor" id="loc_del">{PH["loc_del"]}</tspan>'
            '<tspan class="delColor">--</tspan> )')


# ---------------------------------------------------------------- content
def right_lines():
    return [
        header("ved@axolotl"),
        field("Role", "Systems Engineer"),
        field("Host", "Axolotl AI"),
        field("Location", "Remote"),
        dyn("Uptime", "age_data", "age", PH["age"]),
        field("Focus", "distributed training, inference, quantization"),
        blank(),
        field("Languages", "Python, CUDA, Triton, C++"),
        field("Stack", "PyTorch, Triton, MLIR, MPI"),
        field("Upstream", "ao, bitsandbytes, axolotl, peft, tt-mlir"),
        blank(),
        header("- Projects"),
        field("Quanta", "quantization library for PyTorch"),
        field("GPU-sanghathan", "distributed training, from scratch"),
        field("CUDA_MLpapers", "ML papers, re-implemented in CUDA"),
        blank(),
        header("- Contact"),
        field("Email", "ved@axolotl.ai"),
        field("X", "@ant_vedaya"),
        field("GitHub", "ved1beta"),
        blank(),
        header("- GitHub Stats"),
        repos_line(),
        commits_line(),
        loc_line(),
    ]


THEMES = {
    "dark_mode.svg": dict(bg="#121212", fg="#e8e8e3", key="#a3e635", value="#e8e8e3",
                          cc="#4d4d49", ascii="#8a8a85", add="#3fb950", dele="#f85149"),
    "light_mode.svg": dict(bg="#ffffff", fg="#24292f", key="#4d7c0f", value="#24292f",
                           cc="#b8b8b3", ascii="#57606a", add="#1a7f37", dele="#cf222e"),
}


def place(line, y):
    assert line.startswith("<tspan"), line
    return line.replace("<tspan", f'<tspan x="390" y="{y}"', 1)


def build(filename, theme, art):
    art_spans = "\n".join(f'<tspan x="15" y="{30 + 20 * i}">{escape(l)}</tspan>'
                          for i, l in enumerate(art))
    right_spans = "\n".join(place(l, 30 + 20 * i) for i, l in enumerate(right_lines()))
    svg = f'''<?xml version='1.0' encoding='UTF-8'?>
<svg xmlns="http://www.w3.org/2000/svg" font-family="ConsolasFallback,Consolas,monospace" width="985px" height="530px" font-size="16px">
<style>
@font-face {{
src: local('Consolas'), local('Consolas Bold');
font-family: 'ConsolasFallback';
font-display: swap;
-webkit-size-adjust: 109%;
size-adjust: 109%;
}}
.key {{fill: {theme['key']};}}
.value {{fill: {theme['value']};}}
.addColor {{fill: {theme['add']};}}
.delColor {{fill: {theme['dele']};}}
.cc {{fill: {theme['cc']};}}
text, tspan {{white-space: pre;}}
</style>
<rect width="985px" height="530px" fill="{theme['bg']}" rx="15"/>
<text x="15" y="30" fill="{theme['ascii']}" class="ascii">
{art_spans}
</text>
<text x="390" y="30" fill="{theme['fg']}">
{right_spans}
</text>
</svg>
'''
    open(filename, "w").write(svg)


if __name__ == "__main__":
    art = ascii_art("avatar.png")
    ok = True
    for l in right_lines():
        vis = re.sub(r"<[^>]+>", "", l).replace("&amp;", "&")
        if vis == ". ":
            continue
        if len(vis) != WIDTH_CH:
            ok = False
            print(f"WARN {len(vis):3d} |{vis}|")
    print("all lines 60ch" if ok else "MISALIGNED")

    for fn, theme in THEMES.items():
        build(fn, theme, art)
        print("wrote", fn)

    from lxml import etree
    for fn in THEMES:
        root = etree.parse(fn).getroot()
        ids = re.findall(r'id="([^"]+)"', open(fn).read())
        print(fn, "ids:", len(ids))
    print("xml ok")
