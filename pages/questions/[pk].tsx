import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import axios from 'axios'
import * as https from "https";
import ReactMarkdown from 'react-markdown'
import { Typography, Button, Form, Input } from 'antd'
import { ParsedUrlQuery } from 'querystring'
import { useAppContext } from '@/context/state'
import LoginRequired from '@/components/login-required'
import Link from 'next/link'

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export default function QuestionsPage(props: {
  question: { title: string; description: string }
}) {
  const { unitKey, notify, unitAnswers, setUnitAnswers } = useAppContext()

  const router = useRouter()

  const startDate = new Date()

  function onFinish(values: { content: string }) {
    axios
      .post('https://ralmeida.dev/capstone_server/answer', {
        unit: unitKey,
        question: router.query.pk,
        content: values.content,
        time_spent: Math.ceil(
          (new Date().getTime() - startDate.getTime()) / 1000
        ),
        httpsAgent: httpsAgent,
      })
      .then((response) => {
        notify.success({
          message: 'Answer submitted successfully',
          placement: 'bottomRight',
        })
        setUnitAnswers([
          ...unitAnswers,
          { question: parseInt(router.query.pk as string) },
        ])
        router.replace('/questions')
      })
      .catch(function (error) {
        console.log({ createAnswerAxiosError: error })
      })
  }

  function onFinishFailed(errorInfo: any) {
    console.log({ answerFinishError: errorInfo })
  }

  if (!unitKey) {
    return <LoginRequired />
  }

  return (
    <div style={{ display: 'flex-column' }}>
      <Typography.Title>{props.question.title}</Typography.Title>
      <ReactMarkdown>{props.question.description}</ReactMarkdown>
      <Form onFinish={onFinish} onFinishFailed={onFinishFailed}>
        <Form.Item
          name='content'
          rules={[{ required: true, message: 'Please input your answer!' }]}
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item>
          <Button type='primary' htmlType='submit'>
            Submit
          </Button>
        </Form.Item>

        <Link href='/questions'>
          <Button type='primary'>Leave</Button>
        </Link>
      </Form>
    </div>
  )
}

type MyContext = GetServerSidePropsContext & {
  params: ParsedUrlQuery & { pk: string }
}

// TODO: use getStaticProps
export async function getServerSideProps(context: MyContext) {
  const { pk } = context.params
  const data = await axios
    .get(`https://ralmeida.dev/capstone_server/question/${pk}?format=json`, {httpsAgent})
    .then((response) => response.data)
    .catch((error) => {
      console.log({ error })
    })

  return { props: { question: data } }
}
