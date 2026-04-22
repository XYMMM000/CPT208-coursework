import { createContext, useContext, useEffect, useMemo, useState } from "react";

const EXPERIENCE_MODE_STORAGE_KEY = "climbquest_experience_mode";

export const EXPERIENCE_MODES = {
  LITE: "lite",
  GUIDED: "guided",
  IMPACT: "impact"
};

const ExperienceModeContext = createContext({
  mode: EXPERIENCE_MODES.LITE,
  setMode: () => {}
});

function readSavedMode() {
  try {
    const value = localStorage.getItem(EXPERIENCE_MODE_STORAGE_KEY);
    if (Object.values(EXPERIENCE_MODES).includes(value)) return value;
  } catch {
    // ignore
  }
  return EXPERIENCE_MODES.LITE;
}

export function ExperienceModeProvider({ children }) {
  const [mode, setMode] = useState(() => readSavedMode());

  useEffect(() => {
    localStorage.setItem(EXPERIENCE_MODE_STORAGE_KEY, mode);
  }, [mode]);

  const contextValue = useMemo(() => ({ mode, setMode }), [mode]);

  return (
    <ExperienceModeContext.Provider value={contextValue}>
      {children}
    </ExperienceModeContext.Provider>
  );
}

export function useExperienceMode() {
  return useContext(ExperienceModeContext);
}
