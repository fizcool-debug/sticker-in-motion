declare module 'mind-ar/dist/mindar-image-three.prod.js' {
  import type { WebGLRenderer, Scene, PerspectiveCamera, Group } from 'three';
  export class MindARThree {
    constructor(options: Record<string, unknown>);
    renderer: WebGLRenderer; scene: Scene; camera: PerspectiveCamera;
    video?: HTMLVideoElement;
    controller?: { stopProcessVideo(): void; worker?: Worker };
    cssRenderer: { domElement: HTMLElement };
    resize(): void;
    resizeHandler?: EventListener;
    _startAR(): Promise<void>;
    start(): Promise<void>;
    stop(): void;
    addAnchor(index: number): { group: Group; onTargetFound: (() => void) | null; onTargetLost: (() => void) | null };
  }
}
