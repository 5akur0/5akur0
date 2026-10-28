"""Give the generated contribution snake a pastel palette and a tiny face."""
from pathlib import Path
import re
import xml.etree.ElementTree as ET

for path in Path("dist").glob("*.svg"):
    svg = path.read_text()
    dark = "-dark" in path.name
    colors = (
        ["#524566", "#292c46", "#668dd0", "#a4bdf5", "#f18ac0", "#ffbde0"]
        if dark else
        ["#b2def0", "#e6f5fc", "#a7dcf5", "#86c3f0", "#f490be", "#e65098"]
    )
    for name, color in zip(["cb", "ce", "c0", "c1", "c2", "c3", "c4"],
                           [colors[0], colors[1], *colors[1:]]):
        svg = re.sub(rf"--{name}:[^;}}]+", f"--{name}:{color}", svg)
    svg = re.sub(r"--cs:[^;}]+", "--cs:#f45b9e", svg)
    # Scale every timeline together so eating, movement and the progress bar sync.
    svg = re.sub(r"(\d+(?:\.\d+)?)ms", lambda m: f"{float(m[1]) / 2:g}ms", svg)
    svg = svg.replace('rx="2" ry="2"', 'rx="4" ry="4"')
    assert '.s.s0{' in svg, "Generated SVG must contain the head animation"
    face = '''<g class="s s0" style="fill:none" aria-hidden="true">
      <ellipse cx="3.3" cy="9.8" rx="2" ry="1.25" fill="#f2709c"/>
      <ellipse cx="12.7" cy="9.8" rx="2" ry="1.25" fill="#f2709c"/>
      <circle cx="5" cy="6.5" r="1.7" fill="#51344b"/>
      <circle cx="11" cy="6.5" r="1.7" fill="#51344b"/>
      <circle cx="5.4" cy="6" r="0.55" fill="#fff"/>
      <circle cx="11.4" cy="6" r="0.55" fill="#fff"/>
      <path d="M6.4 10 Q8 12 9.6 10" stroke="#51344b" stroke-width="0.9" stroke-linecap="round"/>
    </g>'''
    svg = svg.replace('</svg>', face + '</svg>')
    ET.fromstring(svg)
    path.write_text(svg)
    print(f"Styled {path}: pastel colors, smiling face, 2x speed")
