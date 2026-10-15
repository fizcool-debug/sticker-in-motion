import {AbsoluteFill} from 'remotion';
import {useAerisFont} from './AerisMotion';
import original from './aeris-original.json';

// Render the supplied SVG, not a frame from the animated composition.
// Its embedded text uses the same original font as the approved animation.
export const AerisSticker = () => {
  useAerisFont();
  return <AbsoluteFill dangerouslySetInnerHTML={{__html: original}}/>;
};
