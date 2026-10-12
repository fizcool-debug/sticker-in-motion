import { Composition } from 'remotion';
import { CetMotion } from './CetMotion';
export const RemotionRoot = () => <Composition id="CetRainbow" component={CetMotion}
  width={384} height={384} durationInFrames={60} fps={15} />;
