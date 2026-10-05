import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { ROLE_DEFAULT, type Pick, type Role } from '../data/courses';
import { track } from './analytics';

interface GuideState {
  role: Role | '';
  pick: Pick | '';
  chooseRole: (role: Role | 'unsure', source: string) => void;
}

const GuideContext = createContext<GuideState | null>(null);

/**
 * The visitor's situation, picked on the "Which describes you?" tiles. Used to tailor WhatsApp
 * messages and to tag form events. The course question itself is answered in the SPlus form.
 */
export function GuideProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | ''>('');
  const [pick, setPick] = useState<Pick | ''>('');
  const started = useRef(false);

  const chooseRole = useCallback((r: Role | 'unsure', source: string) => {
    const next = r === 'unsure' ? '' : r, course: Pick = r === 'unsure' ? 'unsure' : ROLE_DEFAULT[r];
    setRole(next);
    setPick(course);
    if (!started.current && source !== 'variant') { started.current = true; track('eligibility_started', { source }); }
    track('eligibility_completed', { role: next || 'unsure', course });
  }, []);

  const value = useMemo(() => ({ role, pick, chooseRole }), [role, pick, chooseRole]);
  return <GuideContext.Provider value={value}>{children}</GuideContext.Provider>;
}

export function useGuide() {
  const g = useContext(GuideContext);
  if (!g) throw new Error('useGuide must be used inside <GuideProvider>');
  return g;
}
