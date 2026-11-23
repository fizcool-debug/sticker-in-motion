import {useEffect, useState} from 'react';
import {Player} from '@remotion/player';
import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';
import type {StickerDefinition} from './stickers';

type Manifest = {sheets:string[];frames:number;fps:number;columns:number;rows:number;frameSize:number};
function AtlasFrame({assetBase, manifest}: {assetBase:string;manifest:Manifest}) {
  const frame = useCurrentFrame() % manifest.frames;
  const perSheet = manifest.columns * manifest.rows;
  const sheetFrame = frame % perSheet;
  return <AbsoluteFill style={{overflow:'hidden'}}>
    <Img src={`${assetBase}/${manifest.sheets[Math.floor(frame/perSheet)]}`} style={{position:'absolute',maxWidth:'none',width:`${manifest.columns*100}%`,height:`${manifest.rows*100}%`,left:`${-(sheetFrame%manifest.columns)*100}%`,top:`${-Math.floor(sheetFrame/manifest.columns)*100}%`}}/>
  </AbsoluteFill>;
}
export function AtlasPreview({sticker}: {sticker:StickerDefinition}) {
  const [manifest, setManifest] = useState<Manifest>();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    setManifest(undefined); setFailed(false);
    fetch(`${sticker.assetBase}/atlas.json`, {signal:controller.signal}).then(response => {
      if (!response.ok) throw Error('Preview could not load');
      return response.json() as Promise<Manifest>;
    }).then(setManifest).catch(() => {if (!controller.signal.aborted) setFailed(true);});
    return () => controller.abort();
  }, [sticker.assetBase]);
  if (failed) return <p role="status">The animation preview could not load. Return to the scanner and try again.</p>;
  if (!manifest) return <p role="status" className="preview-loading">Loading animation…</p>;
  return <div className="player-wrap" data-atlas-preview={sticker.id}>
    <Player component={AtlasFrame} inputProps={{assetBase:sticker.assetBase,manifest}}
      durationInFrames={manifest.frames} fps={manifest.fps} compositionWidth={manifest.frameSize} compositionHeight={manifest.frameSize}
      controls loop autoPlay={false} style={{width:'100%'}} showVolumeControls={false} acknowledgeRemotionLicense/>
  </div>;
}
