import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
export const CetMotion = ({ assetBase }: { assetBase?: string }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  return <AbsoluteFill style={{ backgroundColor: 'transparent' }}>
    <AbsoluteFill style={{ scale: 1 + 0.008 * Math.sin(frame / durationInFrames * Math.PI * 2) }}>
      <Img src={assetBase ? `${assetBase}/letters.png` : staticFile('stickers/cet/letters.png')} style={{ width: '100%', height: '100%' }} />
      <AbsoluteFill style={{
        clipPath: `inset(0 ${interpolate(frame, [0, .8 * fps, 3.6 * fps, 4 * fps], [100, 0, 0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}% 0 0)`,
        opacity: .94 + .06 * Math.sin(frame / durationInFrames * Math.PI * 2),
      }}><Img src={assetBase ? `${assetBase}/rainbow.png` : staticFile('stickers/cet/rainbow.png')} style={{ width: '100%', height: '100%' }} /></AbsoluteFill>
    </AbsoluteFill>
  </AbsoluteFill>;
};
