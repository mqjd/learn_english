import { createContext, useContext, useState } from 'react'

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

type MasonryState = {
  masonryItemState: Record<number, boolean>
  historicalMasonryItem: Record<number, number>
  markMasonryItem: (num: number, value: boolean) => void
  resetMarkMasonryItem: () => void
  resetStoragedMarkMasonryItem: () => void
}

export const useMasonryState = (): MasonryState => {
  const vocabularyExaminationKey = window.location.pathname + '-vocabulary'

  const getVocabularyExamination = () => {
    const vocabularyExaminationStr = localStorage.getItem(vocabularyExaminationKey) || '{}'
    const vocabularyExamination = JSON.parse(vocabularyExaminationStr)
    return vocabularyExamination
  }

  const [masonryItemState, setMasonryItem] = useState<Record<number, boolean>>({})

  const [historicalMasonryItem, setHistoricalMasonryItem] = useState<Record<number, number>>(
    getVocabularyExamination()
  )

  const resetMarkMasonryItem = () => {
    setMasonryItem({})
  }
  const markMasonryItem = (num: number, value: boolean) => {
    setMasonryItem({
      ...masonryItemState,
      [num]: value
    })
    if (!value) {
      const vocabularyExaminationStr = localStorage.getItem(vocabularyExaminationKey) || '{}'
      const vocabularyExamination = JSON.parse(vocabularyExaminationStr)
      const newVocabularyExamination = {
        ...vocabularyExamination,
        [num]: vocabularyExamination[num] || 0 - 1
      }

      localStorage.setItem(vocabularyExaminationKey, JSON.stringify(newVocabularyExamination))
      setHistoricalMasonryItem(newVocabularyExamination)
    }
  }

  const resetStoragedMarkMasonryItem = () => {
    localStorage.removeItem(vocabularyExaminationKey)
    setHistoricalMasonryItem({})
  }

  return {
    masonryItemState,
    markMasonryItem,
    resetMarkMasonryItem,
    resetStoragedMarkMasonryItem,
    historicalMasonryItem
  }
}
