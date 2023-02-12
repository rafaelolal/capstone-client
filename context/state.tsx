import {
  Context,
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from 'react'
import { notification } from 'antd'

type Unit = {
  key: number | undefined
  type: string | undefined
  answers: number[] | undefined
  signed: boolean | null | undefined
}

type ContextType = {
  unit: Unit
  setUnit: Dispatch<SetStateAction<Unit>>
  notify: any // TODO: import NotificationInstance
}

let AppContext: Context<ContextType>

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const [notify, contextHolder] = notification.useNotification()
  const [unit, setUnit] = useState<Unit>({
    key: undefined,
    type: undefined,
    answers: undefined,
    signed: undefined,
  })

  const sharedState = {
    unit,
    setUnit,
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
