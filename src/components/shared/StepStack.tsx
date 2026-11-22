import { useEffect, useLayoutEffect, useState, type ReactNode } from 'react';

/**
 * Crossfades between step screens: the outgoing screen stays mounted for its
 * exit animation while the incoming one plays its entrance.
 */
export function StepStack({ screen, render }: { screen: string; render: (screen: string) => ReactNode }) {
  const [layers, setLayers] = useState([{ key: screen, leaving: false }]);
  useLayoutEffect(() => {
    setLayers((prev) =>
      prev.some((l) => l.key === screen && !l.leaving)
        ? prev
        : [...prev.filter((l) => l.key !== screen).map((l) => ({ ...l, leaving: true })), { key: screen, leaving: false }],
    );
  }, [screen]);
  useEffect(() => {
    if (!layers.some((l) => l.leaving)) return;
    const id = window.setTimeout(() => setLayers((p) => p.filter((l) => !l.leaving)), 420);
    return () => window.clearTimeout(id);
  }, [layers]);
  return (
    <>
      {layers.map((l) => (
        <div key={l.key} className={`step-layer ${l.leaving ? 'is-leaving' : ''}`} aria-hidden={l.leaving}>
          {render(l.key)}
        </div>
      ))}
    </>
  );
}
