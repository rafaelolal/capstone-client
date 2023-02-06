import 'normalize.css'
import type { AppProps } from 'next/app'
import styled from 'styled-components'
import { AppWrapper } from '@/context/state'

const Container = styled.div`
  display: flex;
  justify-content: center;
  height: 100vh;
  align-items: center;
  background-color: #e3f2fd;
`

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppWrapper>
      <Container>
        <Component {...pageProps} />
      </Container>
    </AppWrapper>
  )
}
