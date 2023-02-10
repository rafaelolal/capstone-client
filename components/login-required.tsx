import Link from 'next/link'
import { Typography, Button } from 'antd'
import styled from 'styled-components'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: calc(100vh - 180px);
  align-items: center;
`

export default function LoginRequired() {
  return (
    <Container>
      <Typography.Title>Sign in before viewing questions</Typography.Title>

      <Button type='primary'>
        <Link href='/'>Sign In</Link>
      </Button>
    </Container>
  )
}
