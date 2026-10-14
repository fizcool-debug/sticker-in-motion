export type StickerDefinition = {
  id: string;
  name: string;
  assetBase: string;
  targetFile: string;
  targetIndex: number;
  aspectRatio: number;
  printedSize: string;
  animationName: string;
  durationInFrames: number;
  fps: number;
  compositionWidth: number;
  compositionHeight: number;
  videoFile?: string;
  renderMode?: 'video';
};

// CET is the first test asset, not the app's identity. Additional stickers
// need their own animation and a compiled target before joining this list.
export const targetFile = '/stickers/collection.mind';
export const stickers: StickerDefinition[] = [{
  id: 'garden-fizcool', name: 'Fizcool Garden', assetBase: '/stickers/garden-fizcool',
  targetFile, targetIndex: 2, aspectRatio: 1,
  printedSize: '', animationName: 'Garden scatter',
  durationInFrames: 180, fps: 30, compositionWidth: 1080, compositionHeight: 1080,
  videoFile: '/stickers/garden-fizcool/animation.mp4', renderMode: 'video',
}, {
  id: 'red-no-rush', name: 'Red No Rush', assetBase: '/stickers/red-no-rush',
  targetFile, targetIndex: 0, aspectRatio: 1179 / 1184,
  printedSize: '', animationName: 'Original animation',
  durationInFrames: 8, fps: 6, compositionWidth: 2048, compositionHeight: 2048,
  videoFile: '/stickers/red-no-rush/animation.mp4',
}, {
  id: 'cet', name: 'CET', assetBase: '/stickers/cet',
  targetFile, targetIndex: 1, aspectRatio: 1,
  printedSize: '4 × 4 in', animationName: 'Rainbow sweep + subtle pulse',
  durationInFrames: 60, fps: 15, compositionWidth: 384, compositionHeight: 384,
}];
