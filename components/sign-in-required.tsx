import Link from 'next/link'
import { Typography, Button } from 'antd'
import styled from 'styled-components'
import { useState } from 'react'
import Head from 'next/head'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: calc(100vh - 180px);
  align-items: center;
  text-align: center;
`

export default function LoginRequired() {
  const [isSignInButtonLoading, setIsSignInButtonLoading] = useState(false)

  return (
    <>
      <Head>
        <title>Sign In Required</title>
        {/* TODO: Change description */}
        <meta name='description' content='' />
        {/* TODO: Change icon */}
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Container>
        <Typography.Title>Sign in before viewing questions</Typography.Title>

        <Link href='/' passHref>
          <Button
            type='primary'
            loading={isSignInButtonLoading}
            onClick={() => setIsSignInButtonLoading(true)}
          >
            Sign In
          </Button>
        </Link>
      </Container>
    </>
  )
}
