import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Player, type PlayerRef} from '@remotion/player';
import {Video} from '../video/Video';
import {DEFAULT_SCENES} from '../config/defaults';
import {FPS, HEIGHT, WIDTH, type VideoProps} from '../config/types';
import {buildTiming, fitScenesToAudio, sceneFrames, sceneStarts, totalFrames} from '../lib/timing';
import {audioDuration, useProject} from './store';

const fmt = (frames: number) => {
  const s = Math.max(0, frames) / FPS;
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${(s - m * 60).toFixed(1).padStart(4, '0')}`;
};

const usePlayerFrame = (ref: React.RefObject<PlayerRef | null>) => {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const r = ref.current;
    if (!r) return;
    const on = (e: {detail: {frame: number}}) => setFrame(e.detail.frame);
    r.addEventListener('frameupdate', on);
    return () => r.removeEventListener('frameupdate', on);
  }, [ref]);
  return frame;
};

const usePlaying = (ref: React.RefObject<PlayerRef | null>) => {
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const r = ref.current;
    if (!r) return;
    const a = () => setPlaying(true);
    const b = () => setPlaying(false);
    r.addEventListener('play', a);
    r.addEventListener('pause', b);
    r.addEventListener('ended', b);
    return () => {
      r.removeEventListener('play', a);
      r.removeEventListener('pause', b);
      r.removeEventListener('ended', b);
    };
  }, [ref]);
  return playing;
};

const currentScene = (starts: number[], frame: number) => {
  let idx = 0;
  starts.forEach((s, i) => {
    if (frame >= s) idx = i;
  });
  return idx;
};

type Tab = 'script' | 'audio' | 'render';

export const Studio: React.FC = () => {
  const {project, updateScene, setScenes, updateSettings, patch, reset} = useProject();
  const playerRef = useRef<PlayerRef>(null);
  const frame = usePlayerFrame(playerRef);
  const playing = usePlaying(playerRef);
  const [tab, setTab] = useState<Tab>('script');
  const [selectedState, setSelected] = useState(0);
  const [loopScene, setLoopScene] = useState(false);
  const [notice, setNotice] = useState<{kind: 'error' | 'ok'; text: string} | null>(null);

  const total = totalFrames(project.scenes);
  const starts = useMemo(() => sceneStarts(project.scenes), [project.scenes]);
  const active = currentScene(starts, frame);
  // While playing (and not looping a scene) the scene list follows playback.
  const selected = playing && !loopScene ? active : selectedState;
  const inputProps = project as unknown as Record<string, unknown>;

  const seek = useCallback((f: number) => playerRef.current?.seekTo(Math.max(0, Math.min(total - 1, Math.round(f)))), [total]);
  const toggle = useCallback(() => playerRef.current?.toggle(), []);

  const goScene = useCallback(
    (i: number, play = false) => {
      setSelected(i);
      seek(starts[i]);
      if (play) playerRef.current?.play();
    },
    [seek, starts],
  );

  // Loop the active scene when "Loop scene" is on.
  useEffect(() => {
    if (!loopScene) return;
    const end = starts[selected] + sceneFrames(project.scenes[selected]);
    if (frame >= end - 1) seek(starts[selected]);
  }, [frame, loopScene, selected, starts, project.scenes, seek]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        toggle();
      } else if (e.code === 'ArrowRight') seek((playerRef.current?.getCurrentFrame() ?? 0) + FPS);
      else if (e.code === 'ArrowLeft') seek((playerRef.current?.getCurrentFrame() ?? 0) - FPS);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle, seek]);

  const upload = async (file: File, kind: 'narration' | 'music') => {
    setNotice(null);
    const blobUrl = URL.createObjectURL(file);
    let dur: number;
    try {
      dur = await audioDuration(blobUrl);
    } catch (e) {
      setNotice({kind: 'error', text: e instanceof Error ? e.message : 'Could not read that audio file.'});
      return;
    }
    let src = blobUrl;
    let warn = '';
    try {
      const res = await fetch(`/api/upload?name=${encodeURIComponent(`${kind}-${file.name}`)}`, {method: 'POST', body: file});
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? res.statusText);
      src = data.src;
    } catch (e) {
      warn = ` Preview only — could not copy it to /public/uploads for rendering (${e instanceof Error ? e.message : 'upload failed'}).`;
    }
    if (kind === 'narration') patch({narrationSrc: src, narrationOffsetSec: 0});
    else patch({musicSrc: src});
    setNotice({kind: warn ? 'error' : 'ok', text: `${kind === 'narration' ? 'Narration' : 'Music'} loaded (${dur.toFixed(1)} s).${warn}`});
  };

  const fitToAudio = async () => {
    if (!project.narrationSrc) return;
    try {
      const src = /^(blob:|https?:|\/)/.test(project.narrationSrc) ? project.narrationSrc : `/${project.narrationSrc}`;
      const dur = await audioDuration(src);
      setScenes(fitScenesToAudio(project.scenes, dur));
      setNotice({kind: 'ok', text: `Scene durations re-timed to the ${dur.toFixed(1)} s narration track (proportional to words per scene).`});
    } catch (e) {
      setNotice({kind: 'error', text: e instanceof Error ? e.message : 'Could not measure the narration.'});
    }
  };

  const scene = project.scenes[selected];
  const timing = useMemo(() => buildTiming(scene), [scene]);

  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          <span className="mark" /> ZİHNİ OYUNU <em>preview studio</em>
        </div>
        <div className="title">Why Your Mind Turns Every Conversation Into a Test</div>
        <div className="meta">
          1920×1080 · {FPS} fps · {total} frames · {fmt(total)}
        </div>
      </header>

      <main className="main">
        <section className="left">
          <div className="stageWrap">
            <div className="stage" onClick={toggle} title="Click to play / pause">
              <Player
                ref={playerRef}
                component={Video as unknown as React.FC<Record<string, unknown>>}
                inputProps={inputProps}
                durationInFrames={total}
                compositionWidth={WIDTH}
                compositionHeight={HEIGHT}
                fps={FPS}
                controls={false}
                clickToPlay={false}
                acknowledgeRemotionLicense
                style={{width: '100%', height: '100%'}}
                errorFallback={({error}) => <div className="err">Preview error: {error.message}</div>}
              />
            </div>
          </div>

          <div className="controls">
            <button className="btn primary" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
              {playing ? '❚❚ Pause' : '▶ Play'}
            </button>
            <button className="btn" onClick={() => goScene(Math.max(0, active - 1))} aria-label="Previous scene">
              ⏮
            </button>
            <button className="btn" onClick={() => goScene(Math.min(project.scenes.length - 1, active + 1))} aria-label="Next scene">
              ⏭
            </button>
            <button className="btn" onClick={() => goScene(active, true)}>
              ↻ Replay scene {active + 1}
            </button>
            <label className="check">
              <input type="checkbox" checked={loopScene} onChange={(e) => setLoopScene(e.target.checked)} /> Loop scene
            </label>
            <Clock frame={frame} total={total} />
          </div>

          <Timeline scenes={project.scenes} starts={starts} total={total} frame={frame} active={active} onSeek={seek} onScene={(i) => goScene(i)} />
          <div className="hint">Space = play/pause · ←/→ = ±1 s · click a scene or drag the timeline to scrub</div>
        </section>

        <aside className="right">
          <nav className="tabs">
            {(['script', 'audio', 'render'] as Tab[]).map((t) => (
              <button key={t} className={tab === t ? 'tab on' : 'tab'} onClick={() => setTab(t)}>
                {t === 'script' ? 'Script & timing' : t === 'audio' ? 'Audio & effects' : 'Render'}
              </button>
            ))}
          </nav>

          {notice ? (
            <div className={`notice ${notice.kind}`} role="status" onClick={() => setNotice(null)}>
              {notice.text}
            </div>
          ) : null}

          {tab === 'script' ? (
            <div className="panel">
              <div className="sceneList">
                {project.scenes.map((s, i) => (
                  <button key={s.id} className={i === selected ? 'sceneBtn on' : 'sceneBtn'} onClick={() => goScene(i)}>
                    <b>{i + 1}</b> {s.title}
                    <span>{s.durationSec.toFixed(1)}s</span>
                  </button>
                ))}
              </div>
              <h3>
                Scene {selected + 1} — {scene.title}
              </h3>
              <div className="row">
                <Num label="Duration (s)" value={scene.durationSec} min={2} max={60} step={0.5} onChange={(v) => updateScene(selected, {durationSec: v})} />
                <Num label="Lead-in (s)" value={scene.leadSec} min={0} max={10} step={0.1} onChange={(v) => updateScene(selected, {leadSec: v})} />
                <Num label="Tail (s)" value={scene.tailSec} min={0} max={10} step={0.1} onChange={(v) => updateScene(selected, {tailSec: v})} />
              </div>
              <label className="lbl">
                Narration <small>(wrap *words* in asterisks for emphasis)</small>
              </label>
              <textarea
                className="ta"
                value={scene.narration}
                rows={5}
                onChange={(e) => updateScene(selected, {narration: e.target.value})}
                aria-label="Narration text"
              />
              <label className="lbl">Subtitle preview</label>
              <ol className="cues">
                {timing.cues.map((c, i) => (
                  <li key={i}>
                    <button onClick={() => seek(starts[selected] + c.start)}>
                      <time>{((starts[selected] + c.start) / FPS).toFixed(1)}s</time>
                      {c.lines.map((l) => l.map((w) => w.text).join(' ')).join(' / ')}
                    </button>
                  </li>
                ))}
              </ol>
              <div className="row">
                <button className="btn" onClick={() => updateScene(selected, DEFAULT_SCENES[selected])}>
                  Reset this scene
                </button>
                <button className="btn" onClick={reset}>
                  Reset everything
                </button>
              </div>
            </div>
          ) : null}

          {tab === 'audio' ? (
            <div className="panel">
              <h3>Display</h3>
              <Toggle label="Subtitles" value={project.settings.subtitles} onChange={(v) => updateSettings({subtitles: v})} />
              <Toggle label="Film grain" value={project.settings.grain} onChange={(v) => updateSettings({grain: v})} />
              <Toggle label="Visual effects (line boil, spotlights, particles)" value={project.settings.effects} onChange={(v) => updateSettings({effects: v})} />
              <h3>Narration track</h3>
              <p className="muted">Import a WAV/MP3 recording of the script. No TTS service is used or required — the film plays fine without it.</p>
              <input type="file" accept="audio/*" aria-label="Import narration" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], 'narration')} />
              {project.narrationSrc ? (
                <>
                  <div className="row">
                    <Num label="Offset (s)" value={project.narrationOffsetSec} min={0} max={30} step={0.1} onChange={(v) => patch({narrationOffsetSec: v})} />
                    <Slider label="Volume" value={project.settings.narrationVolume} onChange={(v) => updateSettings({narrationVolume: v})} />
                  </div>
                  <div className="row">
                    <button className="btn" onClick={fitToAudio}>
                      Fit scene durations to audio
                    </button>
                    <button className="btn" onClick={() => patch({narrationSrc: null})}>
                      Remove narration
                    </button>
                  </div>
                  <p className="muted">Current: {project.narrationSrc.startsWith('blob:') ? 'browser-only file' : project.narrationSrc}</p>
                </>
              ) : null}
              <h3>Music & sound effects</h3>
              <Toggle label="Background music" value={project.settings.music} onChange={(v) => updateSettings({music: v})} />
              <Slider label="Music volume" value={project.settings.musicVolume} onChange={(v) => updateSettings({musicVolume: v})} />
              <Toggle label="Sound effects" value={project.settings.sfx} onChange={(v) => updateSettings({sfx: v})} />
              <Slider label="SFX volume" value={project.settings.sfxVolume} onChange={(v) => updateSettings({sfxVolume: v})} />
              <p className="muted">Built-in music/SFX are synthesised by <code>npm run audio</code>. Import your own music track to replace the drone:</p>
              <input type="file" accept="audio/*" aria-label="Import music" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], 'music')} />
              {project.musicSrc ? (
                <button className="btn" onClick={() => patch({musicSrc: null})}>
                  Use built-in music
                </button>
              ) : null}
            </div>
          ) : null}

          {tab === 'render' ? <RenderPanel project={project} setNotice={setNotice} /> : null}
        </aside>
      </main>
    </div>
  );
};

const Clock: React.FC<{frame: number; total: number}> = ({frame, total}) => (
  <div className="clock" aria-label="Timecode">
    <b>{fmt(frame)}</b> / {fmt(total)}
  </div>
);

const Timeline: React.FC<{
  scenes: VideoProps['scenes'];
  starts: number[];
  total: number;
  frame: number;
  active: number;
  onSeek: (f: number) => void;
  onScene: (i: number) => void;
}> = ({scenes, total, frame, active, onSeek, onScene, starts}) => {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const fromEvent = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    onSeek(((e.clientX - r.left) / r.width) * total);
  };
  return (
    <div
      className="timeline"
      ref={ref}
      role="slider"
      aria-label="Timeline"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={frame}
      onPointerDown={(e) => {
        dragging.current = true;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        fromEvent(e);
      }}
      onPointerMove={(e) => dragging.current && fromEvent(e)}
      onPointerUp={() => (dragging.current = false)}
    >
      {scenes.map((s, i) => (
        <div
          key={s.id}
          className={i === active ? 'seg on' : 'seg'}
          style={{flexGrow: sceneFrames(s)}}
          onDoubleClick={() => onScene(i)}
          title={`${i + 1}. ${s.title} (${s.durationSec}s) — double-click to jump`}
        >
          <span className="n">{i + 1}</span>
          <span className="t">{s.title}</span>
          <span className="fill" style={{width: `${Math.max(0, Math.min(1, (frame - starts[i]) / sceneFrames(s))) * 100}%`}} />
        </div>
      ))}
      <div className="playhead" style={{left: `${(frame / total) * 100}%`}} />
    </div>
  );
};

const Num: React.FC<{label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void}> = ({label, value, min, max, step, onChange}) => (
  <label className="num">
    <span>{label}</span>
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => {
        const v = parseFloat(e.target.value);
        if (Number.isFinite(v)) onChange(Math.min(max, Math.max(min, v)));
      }}
    />
  </label>
);

const Toggle: React.FC<{label: string; value: boolean; onChange: (v: boolean) => void}> = ({label, value, onChange}) => (
  <label className="toggle">
    <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
    <span className="sw" />
    {label}
  </label>
);

const Slider: React.FC<{label: string; value: number; onChange: (v: number) => void}> = ({label, value, onChange}) => (
  <label className="slider">
    <span>
      {label} <em>{Math.round(value * 100)}%</em>
    </span>
    <input type="range" min={0} max={1} step={0.01} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} />
  </label>
);

type Job = {state: 'idle' | 'running' | 'done' | 'error'; progress: number; message: string; file: string | null};

const RenderPanel: React.FC<{project: VideoProps; setNotice: (n: {kind: 'error' | 'ok'; text: string} | null) => void}> = ({project, setNotice}) => {
  const [job, setJob] = useState<Job>({state: 'idle', progress: 0, message: '', file: null});
  const [api, setApi] = useState<'unknown' | 'ok' | 'missing'>('unknown');
  const json = useMemo(() => JSON.stringify(project, null, 2), [project]);

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const r = await fetch('/api/render/status');
        if (!r.ok) throw new Error('status');
        const j = (await r.json()) as Job;
        if (alive) {
          setApi('ok');
          setJob(j);
        }
      } catch {
        if (alive) setApi('missing');
      }
    };
    poll();
    const id = setInterval(poll, 1200);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const start = async () => {
    setNotice(null);
    try {
      const r = await fetch('/api/render', {method: 'POST', body: json});
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? r.statusText);
      setJob({state: 'running', progress: 0, message: 'Starting…', file: null});
    } catch (e) {
      setNotice({kind: 'error', text: e instanceof Error ? e.message : 'Could not start render.'});
    }
  };
  const download = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([json], {type: 'application/json'}));
    a.download = 'props.json';
    a.click();
  };
  const frames = totalFrames(project.scenes);

  return (
    <div className="panel">
      <h3>Render MP4</h3>
      <p className="muted">
        Renders the same Remotion composition you are previewing, with the current durations, narration text, settings and audio ({frames} frames, {fmt(frames)}).
      </p>
      <div className="row">
        <button className="btn primary" disabled={job.state === 'running' || api !== 'ok'} onClick={start}>
          Render MP4 now
        </button>
        {job.state === 'running' ? (
          <button className="btn" onClick={() => fetch('/api/render/cancel', {method: 'POST'})}>
            Cancel
          </button>
        ) : null}
      </div>
      {api === 'missing' ? <p className="notice error">The render API is only available while running <code>npm run studio</code>. Use the CLI commands below instead.</p> : null}
      {job.state !== 'idle' ? (
        <div className="job" data-state={job.state}>
          <div className="bar">
            <i style={{width: `${Math.round(job.progress * 100)}%`}} />
          </div>
          <div>
            {Math.round(job.progress * 100)}% — {job.message}
          </div>
          {job.state === 'done' && job.file ? (
            <a className="btn primary" href={`/api/download?file=${encodeURIComponent(job.file)}`}>
              Download {job.file}
            </a>
          ) : null}
        </div>
      ) : null}
      <h3>Command line</h3>
      <p className="muted">1 · Save the current project, 2 · render from the repo root:</p>
      <button className="btn" onClick={download}>
        Download props.json
      </button>
      <pre className="code">{`# save it as out/props.json, then:
npm run render:props
# or render the built-in defaults:
npm run render`}</pre>
    </div>
  );
};
