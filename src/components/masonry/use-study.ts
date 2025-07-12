import { createContext, useContext } from 'react';

export const StudyContext = createContext({ studyMode: false, reset: false });
export const GlobalStudyContext = createContext({
  studyMode: false,
  reset: false,
});

export const useStudyContext = () => useContext(StudyContext);
export const useGlobalStudyContext = () => useContext(GlobalStudyContext);
