from pathlib import Path
from PIL import Image
import json
root = Path(__file__).resolve().parents[1]
frames = sorted((root/'animation/out/frames').glob('*.png'))
assert len(frames) == 60, f'Expected 60 frames, found {len(frames)}'
out = root/'public/stickers/cet'
sheets = []
for start in range(0, len(frames), 16):
    atlas = Image.new('RGBA', (1536,1536))
    for index, frame in enumerate(frames[start:start+16]):
        image = Image.open(frame).convert('RGBA')
        assert image.size == (384,384)
        assert image.getpixel((0,0))[3] == 0, 'Frames must be transparent'
        atlas.paste(image, ((index % 4)*384,(index//4)*384))
    name = f'atlas-{start//16}.png'
    atlas.save(out/name, optimize=True)
    sheets.append(name)
(out/'atlas.json').write_text(json.dumps({'sheets':sheets,'fps':15,'frames':60,'columns':4,'rows':4,'frameSize':384},indent=2))
print('Packed',len(frames),'transparent Remotion frames into',len(sheets),'sheets')
