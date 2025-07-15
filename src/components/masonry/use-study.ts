import { createContext, useContext } from 'react'

export type GlobalStudyContextType = {
  masonryItemState: Record<number, boolean>
  globalStudySwitch: boolean
  globalResetSwitch: boolean
  globalSuccessCount: number
  globalFailedCount: number
  markGlobalSuccess: (num: number) => void
  markGlobalFailure: (num: number) => void
}

export type StudyContextType = {
  studySwitch: boolean
  resetSwitch: boolean
  successCount: number
  failedCount: number
}

export const StudyContext = createContext<StudyContextType>({} as StudyContextType)
export const GlobalStudyContext = createContext<GlobalStudyContextType>(
  {} as GlobalStudyContextType
)

export const useStudyContext = () => useContext<StudyContextType>(StudyContext)

export const useGlobalStudyContext = () => useContext<GlobalStudyContextType>(GlobalStudyContext)
