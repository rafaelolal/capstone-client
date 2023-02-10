import 'normalize.css'
import type { AppProps } from 'next/app'
import { AppWrapper } from '@/context/state'
import styled from 'styled-components'

const Container = styled.div`
  max-width: 720px;
  margin: auto;
  padding: 32px;
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
