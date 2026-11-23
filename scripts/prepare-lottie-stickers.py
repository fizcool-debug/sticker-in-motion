"""Pack original Lottie renders into bounded RGBA atlases for Android playback."""
from pathlib import Path
from PIL import Image
import json

root = Path(__file__).resolve().parents[1]
definitions = json.loads((root / 'assets/source/lottie-batch.json').read_text())['ready']
tile = 384
for definition in definitions:
    sticker_id = definition['id']
    source = root / 'assets/source' / sticker_id
    data = json.loads((source / 'animation.json').read_text())
    frames = sorted((root / 'work/lottie-stickers' / sticker_id).glob('frame-*.png'))
    assert len(frames) == int(data['op'] - data['ip'])
    output = root / 'public/stickers' / sticker_id
    output.mkdir(parents=True, exist_ok=True)
    sheets = []
    for start in range(0, len(frames), 16):
        sheet = Image.new('RGBA', (tile * 4, tile * 4))
        for index, frame in enumerate(frames[start:start+16]):
            with Image.open(frame) as image:
                assert image.size == (data['w'], data['h'])
                image = image.convert('RGBA')
                assert image.getpixel((0, 0))[3] == 0, 'Source background must be transparent'
                sheet.paste(image.resize((tile, tile), Image.Resampling.LANCZOS), ((index % 4)*tile, (index // 4)*tile))
        name = f'atlas-{start // 16}.png'
        sheet.save(output / name, optimize=True)
        sheets.append(name)
    manifest = {'sheets': sheets, 'fps': data['fr'], 'frames': len(frames), 'columns': 4, 'rows': 4, 'frameSize': tile}
    (output / 'atlas.json').write_text(json.dumps(manifest, indent=2))
    # Print targets retain the complete supplied frame, including its white artwork.
    # Only empty alpha is composited onto white paper; no white-key removal is used.
    with Image.open(source / 'sticker.png') as poster:
        poster = poster.convert('RGBA')
        paper = Image.new('RGBA', poster.size, 'white')
        paper.alpha_composite(poster)
        paper.convert('RGB').save(output / 'print-preview.png')
        reference = paper.convert('RGB')
        reference.thumbnail((800, 800), Image.Resampling.LANCZOS)
        reference.save(output / 'target.jpg', quality=95)
    (output / 'source.json').write_text(json.dumps({
        'source': f'assets/source/{sticker_id}/animation.json', 'originalSize': [data['w'], data['h']],
        'frames': len(frames), 'fps': data['fr'], 'durationSeconds': len(frames)/data['fr'],
        'posterFrame': definition['posterFrame'], 'targetIndex': definition['targetIndex'],
        'playback': 'transparent RGBA PNG atlas', 'playbackFrameSize': tile,
        'background': 'original alpha; white interior details retained',
        'printBackground': 'white paper', 'audio': False,
    }, indent=2))
    print(f'{sticker_id}: {len(frames)} frames at {data["fr"]} fps, {len(sheets)} transparent atlases')
