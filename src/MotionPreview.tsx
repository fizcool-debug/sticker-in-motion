import { Player } from '@remotion/player';
import { CetMotion } from '../animation/src/CetMotion';
import type { StickerDefinition } from './stickers';
const previewComponents: Record<string, typeof CetMotion> = { cet: CetMotion };
export default function MotionPreview({ sticker }: { sticker: StickerDefinition }) {
  if (sticker.videoFile) return <div className="player-wrap"><video key={sticker.id} className="supplied-video" src={sticker.videoFile} poster={`${sticker.assetBase}/print-preview.png`} controls playsInline muted loop preload="metadata" aria-label={`${sticker.name} animation preview`} /></div>;
  const Component = previewComponents[sticker.id];
  if (!Component) return <p role="status">This sticker’s animation preview is not available yet.</p>;
  return <div className="player-wrap"><Player component={Component} inputProps={{ assetBase: sticker.assetBase }} durationInFrames={sticker.durationInFrames} compositionWidth={sticker.compositionWidth}
    compositionHeight={sticker.compositionHeight} fps={sticker.fps} controls loop autoPlay={false} style={{ width: '100%' }}
    showVolumeControls={false} acknowledgeRemotionLicense /></div>;
}
