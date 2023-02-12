import Head from 'next/head'
import axios from 'axios'
import { Agent } from 'https'
import { useEffect } from 'react'
import { Card, Input, Button, Form } from 'antd'
import { NumberOutlined } from '@ant-design/icons'
import { useAppContext } from '@/context/state'
import { useRouter } from 'next/router'
import styled from 'styled-components'

const httpsAgent = new Agent({
  rejectUnauthorized: false,
})

const Container = styled.div`
  display: flex;
  justify-content: center;
  height: calc(100vh - 180px);
  align-items: center;
`

export default function IndexPage() {
  const { unit, setUnit, notify } = useAppContext()

  const router = useRouter()

  useEffect(() => {
    if (unit.key !== undefined) {
      router.replace('/questions/')
    }
  }, [unit.key, router])

  function onFinish(values: { key: string }) {
    axios
      .get(`https://ralmeida.dev/capstone_server/unit/${values.key}/`, {
        httpsAgent: httpsAgent,
      })
      .then((response) => {
        if (response.data !== undefined) {
          setUnit({
            key: parseInt(response.data.key),
            type: response.data.type,
            answers: response.data.answers.map(
              (a: { question: number }) => a.question
            ),
            signed: response.data.signed,
          })
        }
      })
      .catch((error) => {
        notify.warning({ message: 'Incorrect key', placement: 'bottomRight' })
        console.log({ signInAxiosError: error })
      })
  }

  function onFinishFailed(errorInfo: any) {
    console.log({ signInFinishError: errorInfo })
  }

  return (
    <>
      <Head>
        <title>Capstone</title>
        {/* TODO: Change description */}
        <meta name='description' content='' />
        {/* TODO: Change icon */}
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Container>
        <Card title='Sign In'>
          <p>Participants must use unique key.</p>
          <p>Visitors can enter 9999 to just explore.</p>
          <Form onFinish={onFinish} onFinishFailed={onFinishFailed}>
            <Form.Item
              name='key'
              rules={[{ required: true, message: 'Please input your key!' }]}
            >
              <Input prefix={<NumberOutlined />} placeholder='1234' />
            </Form.Item>

            <Form.Item>
              <Button type='primary' htmlType='submit'>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Container>
    </>
  )
}
