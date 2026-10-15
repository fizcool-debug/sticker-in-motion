import React, {useEffect, useState} from 'react';
import {AbsoluteFill, cancelRender, continueRender, delayRender, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import parts from './aeris-parts.json';

const ease = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(.45, 0, .25, 1)} as const;
const Shape = ({markup}: {markup: string}) => <g dangerouslySetInnerHTML={{__html: markup}}/>;

export const useAerisFont = () => {
  const [fontHandle] = useState(() => delayRender('Load original Rozha One lettering'));
  useEffect(() => {
    const font = new FontFace('AerisRozha', `url(${staticFile('aeris/RozhaOne-Regular.ttf')})`);
    font.load().then(loaded => {document.fonts.add(loaded); continueRender(fontHandle);}).catch(cancelRender);
  }, [fontHandle]);
};

export const AerisMotion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  useAerisFont();
  const emerge = interpolate(t, [0, .65, 2.1, 7.1, 8.8, 10], [0, 0, 1, 1, 0, 0], ease);
  const look = interpolate(t, [0, 2.3, 3.2, 3.8, 4.8, 5.5, 6.25, 7.2, 10], [0, 0, -1, -1, 1, 1, 0, 0, 0], ease);
  const breath = Math.sin(t * Math.PI * 2 / 2.5) * emerge;
  const blink = interpolate(t, [0, 2.55, 2.66, 2.78, 5.72, 5.83, 5.95, 10], [1, 1, .06, 1, 1, .06, 1, 1], ease);
  const flick = interpolate(t, [0, 3.9, 4.05, 4.25, 6.4, 6.55, 6.75, 10], [0, 0, -1, 0, 0, 1, 0, 0], ease);
  const windowLift = Math.sin(t * Math.PI / 10) * 1.5;
  return <AbsoluteFill style={{backgroundColor: '#ff5509'}}>
    <svg width="100%" height="100%" viewBox="0 0 162 234" style={{isolation: 'isolate'}}>
      <defs>
        <style>{`.cls-5{fill:#b75c62}.cls-8{fill:#41251a}.cls-9{fill:#bd6a5a}.cls-10{fill:#a64a4d}.cls-11{fill:#e8bc82}.cls-13{fill:#a3544a}`}</style>
        <clipPath id="aeris-card"><rect width="162" height="234"/></clipPath>
        <clipPath id="aeris-medallion-edge"><rect x="31.17" y="41.88" width="98.6" height="150.25"/></clipPath>
        <clipPath id="aeris-emergence"><rect x={31.17 - emerge * 31.17} y={41.88 - emerge * 41.88} width={92.99 + emerge * 69.01} height={150.25 + emerge * 83.75} rx={7.32}/></clipPath>
        <filter id="aeris-pop-shadow" x="-40%" y="-40%" width="200%" height="200%"><feDropShadow dx={2 + emerge * 4} dy={3 + emerge * 6} stdDeviation={emerge * 1.5} floodColor="#23130b" floodOpacity=".8"/></filter>
      </defs>
      <g clipPath="url(#aeris-card)">
        <rect width="162" height="234" fill="#ff5509"/>
        <image href={staticFile('aeris/floral-texture.png')} width="172.86" height="249.66" style={{mixBlendMode: 'color-burn', transformOrigin: '81px 117px', scale: `${1 + .012 * Math.sin(t * Math.PI / 5)} 1`, translate: `${Math.sin(t * Math.PI / 5) * 1.1}px ${Math.sin(t * Math.PI / 5) * -.9}px`}}/>
        <g style={{translate: `0px ${-windowLift}px`}}>
          <rect x="38.17" y="48.88" width="92.99" height="150.25" rx="7.32" fill="#17100b"/>
          <rect x="31.17" y="41.88" width="92.99" height="150.25" rx="7.32" fill="#61d0ff"/>
          <g clipPath="url(#aeris-emergence)">
            <g opacity={interpolate(t, [0, .8, 1.4, 8.4, 9.2, 10], [.22, .22, 1, 1, .22, .22], ease)} style={{transformOrigin: '78px 121px', scale: `${.79 + emerge * .21}`, translate: `0px ${15 * (1-emerge)}px`}}>
              <circle cx="75.35" cy="117" r="53.8" fill="#e8bc82" clipPath="url(#aeris-medallion-edge)"/>
              <Shape markup={parts.medallion}/>
            </g>
            <g filter="url(#aeris-pop-shadow)">
              <g style={{transformOrigin: '84px 133px', translate: `${emerge * 5 + look * 4}px ${15 * (1-emerge) - emerge * 4 + breath * .45}px`, scale: `${.73 + emerge * .37} ${.73 + emerge * .37 + breath * .003}`, rotate: `${look * 6.5 + breath * .35}deg`}}>
                <g style={{transformOrigin: '111px 108px', rotate: `${flick * 2.2 + look * -.6}deg`}}><Shape markup={parts.rearHorn}/></g>
                <Shape markup={parts.face}/>
                <g style={{transformOrigin: '61px 109px', rotate: `${look * -.7 - flick * .7}deg`}}><Shape markup={parts.frontHorn}/></g>
                <Shape markup={parts.browAndNose}/>
                <ellipse cx="86.5" cy="121.5" rx="6.1" ry="4.6" fill="#bd6a5a"/>
                <g style={{transformOrigin: '86px 121px', scale: `1 ${blink}`, translate: `${look * .45}px 0px`}}><Shape markup={parts.eye}/></g>
                <path d="M81.5 120.6 Q86.5 124.2 91.8 123.6" fill="none" stroke="#41251a" strokeWidth=".65" opacity={1-blink}/>
                <Shape markup={parts.cheek}/>
              </g>
            </g>
            <g style={{transformOrigin:'123.6px 121.2px',rotate:`${Math.sin(t*Math.PI/2.5)*12}deg`,scale:1 + .18*Math.sin(t*Math.PI/1.25)}}><Shape markup={parts.stars[0]}/></g>
            <g style={{transformOrigin:'53.8px 70.8px',rotate:`${-Math.sin(t*Math.PI/2.5)*16}deg`,scale:1 + .2*Math.sin(t*Math.PI/1.25+1)}}><Shape markup={parts.stars[1]}/></g>
            <g style={{transformOrigin:'88px 164.5px',rotate:`${Math.sin(t*Math.PI/2.5)*20}deg`,scale:1 + .2*Math.sin(t*Math.PI/1.25+2)}}><Shape markup={parts.stars[2]}/></g>
          </g>
        </g>
        <g fill="#c9ffa3" fontFamily="AerisRozha" fontSize="41.67">
          <text x="29.36" y="35.76" style={{translate:`0px ${Math.sin(t*Math.PI/5)*-.5}px`}}>
            <tspan dy={Math.sin(t*Math.PI/2.5)*.55}>A</tspan>
            <tspan dy={Math.sin(t*Math.PI/2.5+.5)*.55}>e</tspan>
            <tspan dy={Math.sin(t*Math.PI/2.5+1)*.55}>r</tspan>
            <tspan dy={Math.sin(t*Math.PI/2.5+1.5)*.55}>i</tspan>
            <tspan dy={Math.sin(t*Math.PI/2.5+2)*.55}>s</tspan>
          </text>
          <text x="54.97" y="228.21" fontSize="43.25" style={{transformOrigin:'81px 215px',translate:`0px ${Math.sin(t*Math.PI/5)*.8}px`,scale:1 + .008*Math.sin(t*Math.PI/5)}}>मेष</text>
        </g>
      </g>
    </svg>
  </AbsoluteFill>;
};
