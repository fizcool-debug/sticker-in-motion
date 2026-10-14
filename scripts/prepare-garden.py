from pathlib import Path
from PIL import Image
import argparse
import json
import shutil
import subprocess
import zipfile

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--ffmpeg')
args = parser.parse_args()
source = root / 'assets/source/garden-fizcool'
out = root / 'public/stickers/garden-fizcool'
out.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(source / 'frames.zip') as archive:
    assert len(archive.namelist()) == 180
    assert all(name.startswith('garden-frames/frame_') and '..' not in name for name in archive.namelist())
    archive.extractall(root / 'work')
frames = root / 'work/garden-frames'
assert len(list(frames.glob('frame_*.png'))) == 180
ffmpeg = args.ffmpeg or shutil.which('ffmpeg') or str(root / 'animation/node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe')
subprocess.run([ffmpeg, '-v', 'error', '-y', '-framerate', '30', '-i', str(frames / 'frame_%04d.png'), '-frames:v', '180', '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(out / 'animation.mp4')], check=True)
image = Image.open(source / 'image.png').convert('RGB')
image.save(out / 'print-preview.png')
image.save(out / 'target.jpg', quality=95)
(out / 'source.json').write_text(json.dumps({'image':'frame_0118.png', 'suppliedVideo':'garden-fizcool-scatter.webm', 'animationSource':'180 PNG frames, user approved 30 fps', 'fps':30, 'frames':180, 'durationSeconds':6, 'size':list(image.size), 'audio':False, 'alpha':False}, indent=2))
print('Prepared Fizcool Garden: 180 frames, 30 fps, 6 seconds')
