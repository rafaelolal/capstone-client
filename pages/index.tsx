import Head from 'next/head'
import Image from 'next/image' // TODO: Delete image import and file
import styled from 'styled-components'
import { Card, Input, Button } from 'antd'
import { NumberOutlined } from '@ant-design/icons'

const Container = styled.div``

export default function Home() {
  return (
    <>
      <Head>
        <title>Capstone</title>
        {/* TODO: Change description */}
        <meta name='description' content='' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        {/* TODO: Change icon */}
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Card title='Join assignment' style={{ width: 400 }}>
        <Input.Group compact>
          <Input
            style={{ width: 'calc(100% - 160px)' }}
            prefix={<NumberOutlined />}
            placeholder='12345'
          />
          <Button type='primary'>Submit</Button>
        </Input.Group>
      </Card>
    </>
  )
}
