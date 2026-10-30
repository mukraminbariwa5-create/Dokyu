/**
 * Guided tour plumbing (plan §3.1 H.12): screens mark parts of the UI as targets, and the overlay
 * (components/doki/TourOverlay) measures them, scrolls them into view and walks Doki over to point at them.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

/** Anything on screen that can report where it is (a View, a Pressable). */
export interface Measurable {
  measureInWindow(cb: (x: number, y: number, width: number, height: number) => void): void;
}
import type { DokiPose } from '../components/ui/Doki';

export interface TourStep {
  /** Target id, or none for a centred message (hello / goodbye). */
  target?: string;
  /** i18n key of what Doki says. */
  text: string;
  pose?: DokiPose;
  confetti?: boolean;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Scrollable {
  scrollTo(options: { y: number; animated?: boolean }): void;
}

interface Scroller {
  ref: Scrollable;
  offset: () => number;
}

interface TourContextValue {
  steps: TourStep[] | null;
  start: (steps: TourStep[]) => void;
  stop: () => void;
  register: (id: string, node: Measurable | null) => void;
  setScroller: (scroller: Scroller | null) => void;
  /** Scrolls the target into view if needed, then measures it on screen. */
  locate: (id: string, viewportHeight: number) => Promise<Rect | null>;
}

const TourContext = createContext<TourContextValue | null>(null);

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function measure(node: Measurable): Promise<Rect | null> {
  return new Promise((resolve) => {
    try {
      node.measureInWindow((x, y, width, height) =>
        resolve(width || height ? { x, y, width, height } : null),
      );
    } catch {
      resolve(null);
    }
  });
}

export function TourProvider({ children }: { children: ReactNode }) {
  const [steps, setSteps] = useState<TourStep[] | null>(null);
  const targets = useRef(new Map<string, Measurable>());
  const scroller = useRef<Scroller | null>(null);

  const register = useCallback((id: string, node: Measurable | null) => {
    if (node) targets.current.set(id, node);
    else targets.current.delete(id);
  }, []);

  const setScroller = useCallback((s: Scroller | null) => {
    scroller.current = s;
  }, []);

  const locate = useCallback(async (id: string, viewportHeight: number) => {
    const node = targets.current.get(id);
    if (!node) return null;
    let rect = await measure(node);
    const s = scroller.current;
    // Keep room under the target for Doki and his bubble.
    if (rect && s && (rect.y < 60 || rect.y + rect.height > viewportHeight - 260)) {
      const y = Math.max(0, s.offset() + rect.y - 140);
      s.ref.scrollTo({ y, animated: true });
      await wait(450);
      rect = await measure(node);
    }
    return rect;
  }, []);

  const value = useMemo<TourContextValue>(
    () => ({
      steps,
      start: (next) => setSteps(next),
      stop: () => setSteps(null),
      register,
      setScroller,
      locate,
    }),
    [steps, register, setScroller, locate],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used inside <TourProvider>');
  return ctx;
}

/** The tour, or null outside the tabs (sign-in, welcome). */
export function useTourMaybe(): TourContextValue | null {
  return useContext(TourContext);
}

/** Ref callback that marks a View as a tour target. Safe to use outside a tour. */
export function useTourTarget(id: string) {
  const ctx = useContext(TourContext);
  const register = ctx?.register;
  return useCallback((node: Measurable | null) => register?.(id, node), [register, id]);
}

/** The Home tour: services, "For you", Ask Doki, Guides, then a little celebration. */
export const HOME_TOUR: TourStep[] = [
  { text: 'tour.hello', pose: 'wave' },
  { target: 'home.services', text: 'tour.services', pose: 'point' },
  { target: 'home.forYou', text: 'tour.forYou', pose: 'point' },
  { target: 'tab.ask', text: 'tour.ask', pose: 'pointDown' },
  { target: 'tab.guides', text: 'tour.guides', pose: 'pointDown' },
  { text: 'tour.done', pose: 'happy', confetti: true },
];
