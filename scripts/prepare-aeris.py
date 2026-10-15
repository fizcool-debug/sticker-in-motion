"""Preserve original SVG artwork and regroup Illustrator fragments for Remotion."""
import base64
import argparse
import json
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--app-assets', action='store_true', help='Prepare target.jpg after rendering AerisSticker to print-preview.png')
args = parser.parse_args()
PUBLIC = ROOT / 'animation/public/aeris'
ET.register_namespace('', 'http://www.w3.org/2000/svg')
ET.register_namespace('xlink', 'http://www.w3.org/1999/xlink')
root = ET.parse(PUBLIC / 'original.svg').getroot()
ns = {'s': 'http://www.w3.org/2000/svg'}
layer = root.find('.//s:g[@id="Layer_1"]', ns)
goat = root.find('.//s:g[@class="cls-1"]', ns)
texture = layer.find('s:image', ns)
PUBLIC.joinpath('floral-texture.png').write_bytes(base64.b64decode(
    texture.attrib['{http://www.w3.org/1999/xlink}href'].split(',')[1]))

def fragments(start, end):
    return ''.join(ET.tostring(e, encoding='unicode') for e in list(goat)[start:end])

# Original painter order is retained. Face fragments belong to the same rig
# even when separated by horn layers in Illustrator's flattened export.
parts = {
    'medallion': fragments(0, 65),
    'rearHorn': fragments(67, 382),
    'face': fragments(65, 67) + fragments(382, 572),
    'frontHorn': fragments(572, 1481),
    'browAndNose': fragments(1481, 1534),
    'eye': fragments(1534, 1600),
    'cheek': fragments(1600, 1651),
    'stars': [fragments(1651, 1655), fragments(1655, 1661), fragments(1661, 1665)],
}
ROOT.joinpath('animation/src/aeris-parts.json').write_text(
    json.dumps(parts, ensure_ascii=False), encoding='utf-8')
ROOT.joinpath('animation/src/aeris-original.json').write_text(
    json.dumps(ET.tostring(root, encoding='unicode').replace(
        "RozhaOne-Regular, 'Rozha One'", "AerisRozha"), ensure_ascii=False), encoding='utf-8')
print(f'Prepared {len(goat)} unchanged vector fragments and original floral texture.')
if args.app_assets:
    from PIL import Image
    target = ROOT / 'public/stickers/aeris'
    image = Image.open(target / 'print-preview.png').convert('RGB')
    assert image.size == (810, 1170)
    image.save(target / 'target.jpg', quality=95)
    (target / 'source.json').write_text(json.dumps({
        'source': 'assets/source/aeris/aeris.svg',
        'recognition': 'Original SVG rendered using its specified Rozha One font, without cropping',
        'composition': 'AerisWindow', 'frames': 300, 'fps': 30,
        'durationSeconds': 10, 'size': list(image.size),
        'audio': False, 'alpha': False, 'targetIndex': 3,
    }, indent=2))
