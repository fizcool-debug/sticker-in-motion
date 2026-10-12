from pathlib import Path
from PIL import Image
import json

root = Path(__file__).resolve().parents[1]
Image.MAX_IMAGE_PIXELS = 200_000_000
source = Image.open(root / 'assets/source/cet-logo.png').convert('RGB')
print('Original:', source.size, 'background:', source.getpixel((0, 0)))
source.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
out = root / 'public/stickers/cet'
out.mkdir(parents=True, exist_ok=True)
source.save(out / 'target.jpg', quality=95, subsampling=0)
source.save(out / 'print-preview.png', dpi=(300,300))

# Prepare texture layers from the original pixels, retaining dark rainbow segments.
# The background sample is flat; subtract it without redrawing the logo.
bg = source.getpixel((0, 0))
rgba = source.convert('RGBA')
pixels = rgba.load()
for y in range(rgba.height):
    for x in range(rgba.width):
        r, g, b, _ = pixels[x, y]
        alpha = max(abs(r - bg[0]), abs(g - bg[1]), abs(b - bg[2]))
        if alpha <= 2:
            pixels[x, y] = (0, 0, 0, 0)
        else:
            pixels[x, y] = (r, g, b, 255)

split = round(rgba.height * .47)
rainbow = Image.new('RGBA', rgba.size)
rainbow.paste(rgba.crop((0, 0, rgba.width, split)), (0, 0))
letters = Image.new('RGBA', rgba.size)
letters.paste(rgba.crop((0, split, rgba.width, rgba.height)), (0, split))
rgba.save(out / 'logo-transparent.png')
rainbow.save(out / 'rainbow.png')
letters.save(out / 'letters.png')
animation = root / 'animation/public/stickers/cet'
animation.mkdir(parents=True, exist_ok=True)
for filename in ['rainbow.png', 'letters.png']:
    (animation / filename).write_bytes((out / filename).read_bytes())
(out / 'source.json').write_text(json.dumps({
    'id': 'cet', 'name': 'CET', 'physicalWidthMeters': .1016,
    'aspectRatio': 1, 'targetIndex': 0,
    'animation': 'Rainbow sweep and subtle pulse',
    'trackingValidatedOnDevice': False,
    'source': 'User supplied CET logo; exact original retained in assets/source.'
}, indent=2))
print('Prepared target and animation layers:', out)
