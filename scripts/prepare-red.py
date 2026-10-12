from pathlib import Path
from PIL import Image
import json

root = Path(__file__).resolve().parents[1]
out = root / 'public/stickers/red-no-rush'
image = Image.open(root / 'assets/source/red-no-rush/image.png').convert('RGB')
print('Source image:', image.size)
image.save(out / 'print-preview.png')
image.save(out / 'target.jpg', quality=95)
frames = sorted((root / 'work/red-frames').glob('*.png'))
assert len(frames) == 8
atlas = Image.new('RGB', (2048, 1024))
contact = Image.new('RGB', (1024, 512))
for index, frame in enumerate(frames):
    tile = Image.open(frame).convert('RGB')
    atlas.paste(tile, ((index % 4)*512, (index//4)*512))
    contact.paste(tile.resize((256,256)), ((index % 4)*256,(index//4)*256))
atlas.save(out / 'atlas-0.jpg', quality=92)
contact.save(root / 'work/red-contact.jpg')
(out / 'atlas.json').write_text(json.dumps({'sheets':['atlas-0.jpg'],'fps':6,'frames':8,'columns':4,'rows':2,'frameSize':512},indent=2))
(out / 'source.json').write_text(json.dumps({'image':'IMG_0935.PNG','video':'Red_No_Rush.MP4','sourceVideoSize':[2048,2048],'fps':6,'frames':8,'durationSeconds':8/6,'audio':False,'alpha':False},indent=2))
