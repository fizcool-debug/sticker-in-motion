import * as THREE from 'three';
import { PoseStabilizer } from './pose-stabilizer';
import { stickers, targetFile, type StickerDefinition } from './stickers';
export type ScanState = 'loading' | 'scanning' | 'found' | 'lost' | 'paused' | 'error';
export type Tracker = { stop(): void; replay(): void };
export async function startTracker(container: HTMLDivElement, signal: AbortSignal,
  update: (state: ScanState, sticker?: StickerDefinition) => void): Promise<Tracker> {
  const { MindARThree } = await import('mind-ar/dist/mindar-image-three.prod.js');
  if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
  type Manifest = { sheets: string[]; fps: number; frames: number; columns: number; rows: number };
  const sheets: THREE.Texture[] = [];
  const videos: HTMLVideoElement[] = [];
  const videoCallbacks = new Map<HTMLVideoElement, number>();
  let ar: InstanceType<typeof MindARThree> | undefined;
  const geometries: THREE.PlaneGeometry[] = [];
  const materials: THREE.MeshBasicMaterial[] = [];
  let stopped = false;
  let active: { began: number; video?: HTMLVideoElement } | undefined;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    ar?.renderer.setAnimationLoop(null);
    ar?.controller?.stopProcessVideo();
    ar?.controller?.worker?.terminate();
    if (ar?.resizeHandler) window.removeEventListener('resize', ar.resizeHandler);
    (ar?.video?.srcObject as MediaStream | null)?.getTracks().forEach(t => t.stop());
    videos.forEach(video => {
      video.pause();
      const callback = videoCallbacks.get(video);
      if (callback !== undefined) video.cancelVideoFrameCallback(callback);
      video.removeAttribute('src'); video.load();
    });
    videoCallbacks.clear();
    geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); sheets.forEach(t => t.dispose());
    ar?.renderer.dispose(); ar?.renderer.forceContextLoss();
    container.replaceChildren();
  };
  signal.addEventListener('abort', stop, { once: true });
  try {
    const assets: { sticker: StickerDefinition; manifest?: Manifest; textures: THREE.Texture[]; video?: HTMLVideoElement }[] = [];
    for (const sticker of stickers) {
      if (sticker.renderMode === 'video' && sticker.videoFile) {
        const video = document.createElement('video');
        video.muted = true; video.defaultMuted = true; video.playsInline = true;
        video.loop = true; video.preload = 'auto'; videos.push(video);
        await new Promise<void>((resolve, reject) => {
          const clean = () => { clearTimeout(timeout); video.removeEventListener('loadeddata', ready); video.removeEventListener('error', failed); signal.removeEventListener('abort', cancelled); };
          const ready = () => { clean(); resolve(); };
          const failed = () => { clean(); reject(Error('The animation could not load. Restart the app and try again.')); };
          const cancelled = () => { clean(); reject(new DOMException('Cancelled', 'AbortError')); };
          const timeout = setTimeout(failed, 30000);
          video.addEventListener('loadeddata', ready, { once: true });
          video.addEventListener('error', failed, { once: true });
          signal.addEventListener('abort', cancelled, { once: true });
          if (signal.aborted) { cancelled(); return; }
          video.src = sticker.videoFile!; video.load();
        });
        if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
        if ('requestVideoFrameCallback' in video) {
          const requestFrame = video.requestVideoFrameCallback.bind(video);
          video.requestVideoFrameCallback = callback => {
            if (stopped) return 0;
            const id = requestFrame(callback); videoCallbacks.set(video, id); return id;
          };
        }
        const texture = new THREE.VideoTexture(video);
        texture.colorSpace = THREE.SRGBColorSpace;
        sheets.push(texture); assets.push({ sticker, textures: [texture], video });
        continue;
      }
      const manifest = await fetch(`${sticker.assetBase}/atlas.json`, { signal }).then(r => {
        if (!r.ok) throw Error('The animation could not load. Check your connection and try again.');
        return r.json() as Promise<Manifest>;
      });
      const textures: THREE.Texture[] = [];
      for (const sheet of manifest.sheets) {
        const texture = await new THREE.TextureLoader().loadAsync(`${sticker.assetBase}/${sheet}`);
        if (signal.aborted) { texture.dispose(); throw new DOMException('Cancelled', 'AbortError'); }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.generateMipmaps = false; texture.minFilter = THREE.LinearFilter; texture.magFilter = THREE.LinearFilter;
        texture.repeat.set(1 / manifest.columns, 1 / manifest.rows); sheets.push(texture); textures.push(texture);
      }
      assets.push({ sticker, manifest, textures });
    }
    ar = new MindARThree({ container, imageTargetSrc: targetFile, maxTrack: 1,
      uiLoading: 'no', uiScanning: 'no', uiError: 'no', missTolerance: 5, warmupTolerance: 3,
      filterMinCF: .001, filterBeta: 20 });
    const originalStartAR = ar._startAR.bind(ar);
    ar._startAR = async () => {
      if (stopped || signal.aborted) {
        (ar?.video?.srcObject as MediaStream | null)?.getTracks().forEach(t => t.stop());
        return;
      }
      await originalStartAR();
      if (stopped || signal.aborted) { ar?.controller?.stopProcessVideo(); ar?.controller?.worker?.terminate(); }
    };
    ar.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const animations = assets.map(({ sticker, manifest, textures, video }) => {
    const anchor = ar!.addAnchor(sticker.targetIndex);
    const stabilizer = new PoseStabilizer();
    const stabilizedGroup = new THREE.Group();
    stabilizedGroup.matrixAutoUpdate = false;
    stabilizedGroup.visible = false;
    ar!.scene.add(stabilizedGroup);
    // Preserve each animation's proportions, including portrait sticker artwork.
    const geometry = new THREE.PlaneGeometry(1, sticker.compositionHeight / sticker.compositionWidth);
    const material = new THREE.MeshBasicMaterial({ map: textures[0], transparent: true, side: THREE.DoubleSide, depthWrite: false, toneMapped: false });
    geometries.push(geometry); materials.push(material);
    // Image-relative depth: .18 of the sticker width (roughly 18 mm for this print).
    const plane = new THREE.Mesh(geometry, material); plane.position.z = .18; stabilizedGroup.add(plane);
    const animation = { anchor, stabilizer, stabilizedGroup, material, manifest, textures, video, began: performance.now(), previousFrame: -1 };
    const play = () => { if (video) { video.currentTime = 0; void video.play().catch(() => video.pause()); } };
    anchor.onTargetFound = () => { stabilizer.reset(); animation.began = performance.now(); active = animation; play(); update('found', sticker); };
    anchor.onTargetLost = () => { video?.pause(); stabilizedGroup.visible = false; stabilizer.reset(); if (active === animation) { active = undefined; update('lost'); } };
    return animation;
    });
    const target = await fetch(targetFile, { signal });
    if (!target.ok) throw Error('The sticker target could not load. Try again.');
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([ar.start(), new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(Error('Camera setup took too long. Restart the app and try again.')), 45000);
      }), new Promise<never>((_, reject) => signal.addEventListener('abort', () => reject(new DOMException('Cancelled', 'AbortError')), { once: true }))]);
    } finally { clearTimeout(timeout); }
    if (signal.aborted || stopped) {
      (ar.video?.srcObject as MediaStream | null)?.getTracks().forEach(t => t.stop());
      throw new DOMException('Cancelled', 'AbortError');
    }
    if (ar.video) ar.video.style.zIndex = '0';
    ar.renderer.domElement.style.zIndex = '1'; ar.cssRenderer.domElement.style.pointerEvents = 'none';
    ar.renderer.setAnimationLoop(() => {
      if (stopped || !ar) return;
      for (const animation of animations) {
      const { anchor, stabilizer, stabilizedGroup, material, manifest, textures } = animation;
      stabilizedGroup.visible = anchor.group.visible;
      if (stabilizedGroup.visible) {
        stabilizedGroup.matrix.copy(stabilizer.update(anchor.group.matrix, performance.now()));
      if (manifest) {
      const frame = Math.floor((performance.now() - animation.began) / 1000 * manifest.fps) % manifest.frames;
      if (frame !== animation.previousFrame) {
        const sheetFrame = frame % (manifest.columns * manifest.rows);
        const texture = textures[Math.floor(frame / (manifest.columns * manifest.rows))];
        texture.offset.set((sheetFrame % manifest.columns) / manifest.columns, 1 - (Math.floor(sheetFrame / manifest.columns) + 1) / manifest.rows);
        material.map = texture; animation.previousFrame = frame;
      }
      }
      }
      }
      ar.renderer.render(ar.scene, ar.camera);
    });
    update('scanning');
    return { stop, replay() { if (active) { active.began = performance.now(); const video = active.video; if (video) { video.currentTime = 0; void video.play().catch(() => video.pause()); } } } };
  } catch (error) {
    stop();
    if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
    throw error || new DOMException('Camera permission was not granted.', 'NotAllowedError');
  }
}
