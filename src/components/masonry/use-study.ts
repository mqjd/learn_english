import { createContext, useContext } from 'react'

export type GlobalStudyContextType = {
  globalStudySwitch: boolean
  globalResetSwitch: boolean
  globalSuccessCount: number
  globalFailedCount: number
  addGlobalSuccessCount: (num?: number) => void
  addGlobalFailedCount: (num?: number) => void
}

export type StudyContextType = {
  studySwitch: boolean
  resetSwitch: boolean
  successCount: number
  failedCount: number
  addSuccessCount: (num?: number) => void
  addFailedCount: (num?: number) => void
}

export const StudyContext = createContext<StudyContextType>({} as StudyContextType)
export const GlobalStudyContext = createContext<GlobalStudyContextType>(
  {} as GlobalStudyContextType
)

export const useStudyContext = () => useContext<StudyContextType>(StudyContext)

export const useGlobalStudyContext = () => useContext<GlobalStudyContextType>(GlobalStudyContext)
