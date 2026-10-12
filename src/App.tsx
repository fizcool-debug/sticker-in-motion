import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import type { ScanState, Tracker } from './tracking';
import { stickers, type StickerDefinition } from './stickers';
const MotionPreview = lazy(() => import('./MotionPreview'));
function Icon({ kind }: { kind: 'camera' | 'replay' | 'arrow' }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === 'camera' ? <><path d="M4 7h3l2-3h6l2 3h3v13H4z"/><circle cx="12" cy="13" r="4"/></> : kind === 'replay' ? <><path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/></> : <><path d="m10 5-7 7 7 7M3 12h18"/></>}
  </svg>;
}
export function App() {
  const [preview, setPreview] = useState(location.hash === '#preview');
  const [scan, setScan] = useState<ScanState>('loading');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [help, setHelp] = useState(false);
  const [activeSticker, setActiveSticker] = useState<StickerDefinition | null>(null);
  const [previewId, setPreviewId] = useState(stickers[0].id);
  const previewSticker = stickers.find(sticker => sticker.id === previewId) ?? stickers[0];
  const container = useRef<HTMLDivElement>(null);
  const tracker = useRef<Tracker | null>(null);
  const navigate = useCallback((next: boolean) => { location.hash = next ? 'preview' : 'scan'; }, []);
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
      setScan('error'); setError('Open the HTTPS link in Safari to use your camera. You can still preview the animation here.');
      return;
    }
    import('./tracking').then(({ startTracker }) => startTracker(container.current!, abort.signal,
      (state, sticker) => { if (!abort.signal.aborted) { setScan(state); setActiveSticker(state === 'found' ? sticker ?? null : null); } }))
      .then(result => { if (abort.signal.aborted) result.stop(); else tracker.current = result; })
      .catch(e => {
        if (abort.signal.aborted) return;
        setScan('error'); setError(e instanceof Error ? e.message : 'Camera access was not granted. Allow the camera in Safari settings, then try again.');
      });
    const onVisibility = () => {
      if (document.hidden) { abort.abort(); tracker.current = null; setScan('paused'); }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => { abort.abort(); tracker.current?.stop(); tracker.current = null; document.removeEventListener('visibilitychange', onVisibility); };
  }, [preview, attempt]);
  const status = {
    loading: ['Opening your camera', 'Allow camera access when Safari asks.'],
    scanning: ['Find a sticker', 'Keep the whole sticker in view.'],
    found: [`${activeSticker?.name ?? 'Your sticker'} is in motion`, 'Move your phone gently around the sticker.'],
    lost: ['Bring the sticker back into view', 'Hold steady for a moment to reconnect.'],
    paused: ['Camera paused', 'Resume when you’re ready to scan.'],
    error: ['Your camera needs a moment', error],
  }[scan];
  return <main className={preview ? 'app preview' : 'app scanner'}>
    {!preview && <div className="camera-surface" ref={container} aria-hidden="true" />}
    <header className="topbar">
      <span className="wordmark">Sticker in Motion</span>
      {preview ? <button className="icon-button" aria-label="Back to scanner" onClick={() => navigate(false)}><Icon kind="camera" /></button>
      : <button className="text-button" onClick={() => navigate(true)}>Preview <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg></button>}
    </header>
    {preview ? <section className="preview-content">
      <div className="preview-heading"><h1>A little print.<br/>A new dimension.</h1><label className="sticker-select-label" htmlFor="sticker-select">Preview sticker</label><select id="sticker-select" value={previewId} onChange={e => setPreviewId(e.target.value)}>{stickers.map(sticker => <option key={sticker.id} value={sticker.id}>{sticker.name}</option>)}</select>{previewSticker.printedSize && <p>{previewSticker.printedSize}</p>}</div>
      <Suspense fallback={<div className="preview-loading" role="status">Loading animation…</div>}><MotionPreview key={previewId} sticker={previewSticker} /></Suspense>
      <div className="preview-caption"><span>{previewSticker.animationName}</span><span>{Number((previewSticker.durationInFrames / previewSticker.fps).toFixed(2))} sec loop</span></div>
      <p className="preview-note">This is an animation preview. Scan the printed sticker to see it in AR.</p>
      <button className="primary-button" onClick={() => navigate(false)}><Icon kind="camera"/> Scan my sticker</button>
      <a className="print-link" href={`${previewSticker.assetBase}/print-preview.png`} target="_blank" rel="noreferrer">View the sticker artwork</a>
    </section> : <>
      <div className={`aim-area ${scan === 'found' ? 'is-found' : ''}`} aria-hidden="true">
        <div className="reticle"><i/><i/><i/><i/></div>
        {(scan === 'loading' || scan === 'error' || scan === 'paused') && <div className="camera-placeholder"><Icon kind="camera" /><span>{scan === 'loading' ? 'Camera view' : 'Ready when you are'}</span></div>}
      </div>
      <section className="scan-panel">
        <div className="status" role="status" aria-live="polite"><span className={`status-dot ${scan === 'found' ? 'connected' : ''}`} aria-hidden="true"/><h1>{status[0]}</h1><p>{status[1]}</p></div>
        {scan === 'error' || scan === 'paused' ? <button className="primary-button" onClick={() => setAttempt(n => n + 1)}><Icon kind="camera"/>{scan === 'paused' ? 'Resume camera' : 'Try camera again'}</button>
          : scan === 'found' ? <button className="primary-button" onClick={() => tracker.current?.replay()}><Icon kind="replay"/>Replay animation</button> : null}
        <div className="scan-meta"><span>{scan === 'found' && activeSticker ? [activeSticker.name, activeSticker.printedSize].filter(Boolean).join(' · ') : 'Scan a supported sticker'}</span><button className="text-button" aria-expanded={help} aria-controls="scan-help" onClick={() => setHelp(!help)}>{help ? 'Close tips' : 'Scanning tips'}</button></div>
        {help && <div id="scan-help" className="help"><p>Use the original print in even light. Avoid glare, keep the sticker flat, and move closer until it fills the guide.</p><p>Camera access: in Safari’s website settings, allow Camera, then try again. Camera images stay on your device.</p></div>}
        <p className="privacy">Camera images stay on your device.</p>
      </section>
    </>}
  </main>;
}
