import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import type { ScanState, Tracker } from './tracking';
import { stickers, type StickerDefinition } from './stickers';
import { Capacitor } from '@capacitor/core';
import { App as NativeApp } from '@capacitor/app';
const native = Capacitor.isNativePlatform();
const cameraRecovery = native ? 'Camera access was not granted. Allow Camera in Android Settings → Apps → Sticker in Motion → Permissions, then try again.' : 'Camera access was not granted. Allow the camera in your browser settings, then try again.';
const MotionPreview = lazy(() => import('./MotionPreview'));
function Icon({ kind }: { kind: 'camera' | 'replay' | 'preview' }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === 'camera' ? <><path d="M4 7h3l2-3h6l2 3h3v13H4z"/><circle cx="12" cy="13" r="4"/></> : kind === 'replay' ? <><path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/></> : <><rect x="3" y="4" width="18" height="16" rx="3"/><path d="m10 9 5 3-5 3z"/></>}
  </svg>;
}
export function App() {
  const [preview, setPreview] = useState(location.hash === '#preview');
  const [scan, setScan] = useState<ScanState>('loading');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [help, setHelp] = useState(false);
  const [artwork, setArtwork] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [activeSticker, setActiveSticker] = useState<StickerDefinition | null>(null);
  const [previewId, setPreviewId] = useState(stickers[0].id);
  const previewSticker = stickers.find(sticker => sticker.id === previewId) ?? stickers[0];
  const container = useRef<HTMLDivElement>(null);
  const tracker = useRef<Tracker | null>(null);
  const navigate = useCallback((next: boolean) => { if (!next) { setHelp(false); setArtwork(false); } location.hash = next ? 'preview' : 'scan'; }, []);
  useEffect(() => {
    setShowHint(true);
    if (scan !== 'scanning' && scan !== 'lost') return;
    const timer = setTimeout(() => setShowHint(false), 4000);
    return () => clearTimeout(timer);
  }, [scan]);
  useEffect(() => {
    if (!native) return;
    let disposed = false;
    const listener = NativeApp.addListener('backButton', () => { if (artwork) setArtwork(false); else if (help) setHelp(false); else navigate(false); });
    listener.then(() => { if (!disposed) void NativeApp.toggleBackButtonHandler({ enabled: preview || help }); });
    return () => { disposed = true; void listener.then(handle => handle.remove()); };
  }, [preview, help, artwork, navigate]);
  useEffect(() => {
    const onHash = () => setPreview(location.hash === '#preview');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => {
    if (preview || !container.current) return;
    const abort = new AbortController();
    setScan('loading'); setError(''); setActiveSticker(null);
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setScan('error'); setError(native ? 'Camera support is unavailable. Update Android System WebView and restart the app.' : 'Open the HTTPS link in your browser to use your camera. You can still preview the animation here.');
      return;
    }
    import('./tracking').then(({ startTracker }) => startTracker(container.current!, abort.signal,
      (state, sticker) => { if (!abort.signal.aborted) { setScan(state); setActiveSticker(state === 'found' ? sticker ?? null : null); } }))
      .then(result => { if (abort.signal.aborted) result.stop(); else tracker.current = result; })
      .catch(e => {
        if (abort.signal.aborted) return;
        setScan('error'); setError(e instanceof Error && e.message && e.name !== 'NotAllowedError' ? e.message : cameraRecovery);
      });
    const onVisibility = () => {
      if (document.hidden) { abort.abort(); tracker.current = null; setScan('paused'); }
    };
    const nativeState = native ? NativeApp.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) { abort.abort(); tracker.current = null; setScan('paused'); }
    }) : null;
    document.addEventListener('visibilitychange', onVisibility);
    return () => { abort.abort(); tracker.current?.stop(); tracker.current = null; document.removeEventListener('visibilitychange', onVisibility); void nativeState?.then(handle => handle.remove()); };
  }, [preview, attempt]);
  const status = {
    loading: ['Opening your camera', 'Allow camera access when asked.'],
    scanning: ['Find a sticker', 'Keep the whole sticker in view.'],
    found: [`${activeSticker?.name ?? 'Your sticker'} is in motion`, 'Move your phone gently around the sticker.'],
    lost: ['Bring the sticker back into view', 'Hold steady for a moment to reconnect.'],
    paused: ['Camera paused', 'Resume when you’re ready to scan.'],
    error: ['Your camera needs a moment', error],
  }[scan];
  return <main className={preview ? 'app preview' : 'app scanner'} data-scan-state={scan}>
    {!preview && <div className="camera-surface" ref={container} aria-hidden="true" />}
    {preview && <header className="topbar">
      <span className="wordmark">Sticker in Motion</span>
      <button className="icon-button" aria-label="Back to scanner" onClick={() => navigate(false)}><Icon kind="camera" /></button>
    </header>}
    {preview ? <section className="preview-content">
      <div className="preview-heading"><h1>A little print.<br/>A new dimension.</h1><label className="sticker-select-label" htmlFor="sticker-select">Preview sticker</label><select id="sticker-select" value={previewId} onChange={e => setPreviewId(e.target.value)}>{stickers.map(sticker => <option key={sticker.id} value={sticker.id}>{sticker.name}</option>)}</select>{previewSticker.printedSize && <p>{previewSticker.printedSize}</p>}</div>
      {artwork ? <div className="player-wrap"><img style={{ width: '100%', display: 'block' }} src={`${previewSticker.assetBase}/print-preview.png`} alt={`${previewSticker.name} original sticker artwork`} /></div> : <Suspense fallback={<div className="preview-loading" role="status">Loading animation…</div>}><MotionPreview key={previewId} sticker={previewSticker} /></Suspense>}
      {!artwork && <div className="preview-caption"><span>{previewSticker.animationName}</span><span>{Number((previewSticker.durationInFrames / previewSticker.fps).toFixed(2))} sec loop</span></div>}
      <p className="preview-note">This is an animation preview. Scan the printed sticker to see it in AR.</p>
      <button className="primary-button" onClick={() => navigate(false)}><Icon kind="camera"/> Scan my sticker</button>
      {native ? <button className="text-button print-link" style={{ width: '100%' }} onClick={() => setArtwork(!artwork)}>{artwork ? 'Return to animation' : 'View the sticker artwork'}</button> : <a className="print-link" href={`${previewSticker.assetBase}/print-preview.png`} target="_blank" rel="noreferrer">View the sticker artwork</a>}
      <button className="text-button" aria-expanded={help} aria-controls="scan-help" onClick={() => setHelp(!help)}>{help ? 'Close tips' : 'Scanning tips'}</button>
      {help && <div id="scan-help" className="help"><p>Use the original print in even light. Avoid glare, keep the sticker flat, and hold steady.</p><p>{cameraRecovery} Camera images stay on your device.</p></div>}
    </section> : <>
      <div className="sr-only" role="status" aria-live="polite">{status[0]}. {status[1]}</div>
      {(scan === 'scanning' || scan === 'lost') && <div className="aim-area" aria-hidden="true"><div className="reticle"><i/><i/><i/><i/></div></div>}
      {(scan === 'scanning' || scan === 'lost') && showHint && <p className="camera-hint">{scan === 'lost' ? 'Bring the sticker back into view' : 'Point at a sticker'}</p>}
      {(scan === 'loading' || scan === 'error' || scan === 'paused') && <section className="camera-recovery"><Icon kind="camera" /><h1>{status[0]}</h1><p>{status[1]}</p>
        {scan !== 'loading' && <button className="primary-button" onClick={() => setAttempt(n => n + 1)}>{scan === 'paused' ? 'Resume camera' : 'Try camera again'}</button>}
      </section>}
      <div className="camera-actions">
        {scan === 'found' && <button className="camera-control" aria-label="Replay animation" title="Replay animation" onClick={() => tracker.current?.replay()}><Icon kind="replay" /></button>}
        <button className="camera-control" aria-label="Preview stickers" title="Preview stickers" onClick={() => navigate(true)}><Icon kind="preview" /></button>
      </div>
    </>}
  </main>;
}
