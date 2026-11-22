import { useEffect } from 'react';
import { preloadUniverse } from './components/businessverse/UniverseView';
import { PresentationController } from './components/presentation/PresentationController';
import { PresentationControls } from './components/presentation/PresentationControls';
import { SceneManager } from './components/presentation/SceneManager';
import { ShortcutsOverlay } from './components/presentation/ShortcutsOverlay';
import { StartScreen } from './components/presentation/StartScreen';
import { Stage } from './components/presentation/Stage';
import { BackgroundEffects } from './components/shared/BackgroundEffects';

export default function App() {
  useEffect(() => {
    const id = window.setTimeout(preloadUniverse, 2500);
    return () => window.clearTimeout(id);
  }, []);
  return (
    <PresentationController>
      <main className="app-root">
        <BackgroundEffects />
        <Stage>
          <SceneManager />
          <StartScreen />
          <PresentationControls />
          <ShortcutsOverlay />
        </Stage>
      </main>
    </PresentationController>
  );
}
