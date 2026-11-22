import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { scenes } from '../../config/presentation.config';
import { SceneLayerContext, usePresentation } from '../../hooks/usePresentation';
import { sceneComponents } from '../../scenes';

interface Layer {
  key: string;
  index: number;
  leaving: boolean;
  direction: 1 | -1;
}

const EXIT_MS = 950;

/**
 * Single-page scene stack. The outgoing scene stays mounted while it plays its
 * exit so transitions overlap instead of cutting.
 */
export function SceneManager() {
  const { sceneIndex, runId, direction, isPaused, started } = usePresentation();
  const [layers, setLayers] = useState<Layer[]>(() => [
    { key: `${runId}-${sceneIndex}`, index: sceneIndex, leaving: false, direction },
  ]);
  const lastRun = useRef(runId);

  useLayoutEffect(() => {
    const key = `${runId}-${sceneIndex}`;
    setLayers((prev) => {
      if (lastRun.current !== runId) {
        lastRun.current = runId;
        return [{ key, index: sceneIndex, leaving: false, direction }];
      }
      if (prev.some((l) => l.key === key && !l.leaving)) return prev;
      return [
        ...prev.filter((l) => l.key !== key).map((l) => ({ ...l, leaving: true, direction })),
        { key, index: sceneIndex, leaving: false, direction },
      ];
    });
  }, [sceneIndex, runId, direction]);

  useEffect(() => {
    if (!layers.some((l) => l.leaving)) return;
    const id = window.setTimeout(() => setLayers((prev) => prev.filter((l) => !l.leaving)), EXIT_MS);
    return () => window.clearTimeout(id);
  }, [layers]);

  if (!started) return null;

  return (
    <div className={`absolute inset-0 ${isPaused ? 'is-paused' : ''}`}>
      {layers.map((layer) => {
        const def = scenes[layer.index];
        const Scene = sceneComponents[def.id];
        return (
          <div
            key={layer.key}
            className={`scene-layer ${layer.leaving ? 'scene-leaving' : 'scene-entering'}`}
            data-exit={def.exit}
            data-dir={layer.direction}
            aria-hidden={layer.leaving}
          >
            <SceneLayerContext.Provider value={{ active: !layer.leaving }}>
              <Scene def={def} />
            </SceneLayerContext.Provider>
          </div>
        );
      })}
    </div>
  );
}
