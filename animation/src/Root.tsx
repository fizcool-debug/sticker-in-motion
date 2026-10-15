import { Composition, Still } from 'remotion';
import { CetMotion } from './CetMotion';
import { AerisMotion } from './AerisMotion';
import { AerisSticker } from './AerisSticker';
export const RemotionRoot = () => <>
  <Composition id="CetRainbow" component={CetMotion}
    width={384} height={384} durationInFrames={60} fps={15} />
  <Composition id="AerisWindow" component={AerisMotion}
    width={810} height={1170} durationInFrames={300} fps={30} />
  <Still id="AerisSticker" component={AerisSticker} width={810} height={1170}/>
</>;
