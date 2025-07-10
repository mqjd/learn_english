import { createContext, useContext } from 'react';

export const StudyContext = createContext({ studyMode: false, reset: false });

export const useStudyContext = () => useContext(StudyContext);
