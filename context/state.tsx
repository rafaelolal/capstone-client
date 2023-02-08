import {
  Context,
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from 'react'
import { notification } from 'antd'

type ContextType = {
  unitKey: number | undefined
  setUnitKey: Dispatch<SetStateAction<number | undefined>>
  unitAnswers: { question: number }[]
  setUnitAnswers: Dispatch<SetStateAction<{ question: number }[]>>
  notify: any // TODO: import NotificationInstance
}

let AppContext: Context<ContextType>

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const [notify, contextHolder] = notification.useNotification()
  const [unitKey, setUnitKey] = useState<number>()
  const [unitAnswers, setUnitAnswers] = useState<{ question: number }[]>([])

  const sharedState = {
    unitKey,
    setUnitKey,
    unitAnswers,
    setUnitAnswers,
    notify,
  }

  AppContext = createContext(sharedState)

  return (
    <AppContext.Provider value={sharedState}>
      {contextHolder}
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  return useContext(AppContext)
}
