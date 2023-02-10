import { useRef, useState } from 'react'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import axios from 'axios'
import { Agent } from 'https'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { Typography, Button, Form, Input, Modal, Checkbox } from 'antd'
import { ParsedUrlQuery } from 'querystring'
import { useAppContext } from '@/context/state'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import LoginRequired from '@/components/login-required'
import Link from 'next/link'

const TOKEN = process.env.NEXT_PUBLIC_TOKEN

const httpsAgent = new Agent({
  rejectUnauthorized: false,
})

export default function QuestionPage(props: {
  question: { title: string; description: string; type: string }
}) {
  const { unitKey, notify, unitAnswers, setUnitAnswers } = useAppContext()

  const router = useRouter()
  const [form] = Form.useForm()
  const startDate = useRef<Date>()
  props.question.type == 'Test' ? (startDate.current = new Date()) : undefined

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isOKEnabled, setIsOKEnabled] = useState(false)
  const [submitEnabled, setSubmitEnabled] = useState(false)

  const showModal = () => {
    setIsModalOpen(true)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  const onCheckboxChange = (e: CheckboxChangeEvent) => {
    setIsOKEnabled(!isOKEnabled)
  }

  async function onFinish() {
    try {
      if (unitKey) {
        const values = await form.validateFields()

        axios
          .post(
            'https://ralmeida.dev/capstone_server/answer/',
            {
              unit: unitKey,
              question: router.query.pk,
              content: values.content,
              time_spent: startDate.current
                ? Math.ceil(
                    (new Date().getTime() - startDate.current.getTime()) / 1000
                  )
                : null,
            },
            {
              headers: {
                Authorization: `Token ${TOKEN}`,
              },
              httpsAgent: httpsAgent,
            }
          )
          .then((response) => {
            router.replace('/questions/')
            setIsModalOpen(false)
            setUnitAnswers([
              ...unitAnswers,
              { question: parseInt(router.query.pk as string) },
            ])
            notify.success({
              message: 'Answer submitted successfully',
              placement: 'bottomRight',
            })
          })
          .catch(function (error) {
            console.log({ createAnswerAxiosError: error })
          })
      } else {
        router.replace('/questions/')
      }
    } catch (error) {
      console.error(error)
    }
  }

  if (unitKey === undefined) {
    return <LoginRequired />
  }

  return (
    <>
      <Typography.Title>{props.question.title}</Typography.Title>
      <ReactMarkdown
        className='markdown'
        components={{
          p: ({ node, ...props }) => (
            <p
              style={{
                fontFamily: 'Roboto Mono, monospace',
              }}
              {...props}
            />
          ),
          h3: ({ node, ...props }) => <Typography.Title {...props} level={3} />,
          h4: ({ node, ...props }) => <Typography.Title {...props} level={4} />,
          code: ({ children }) => {
            console.log()

            return (
              <SyntaxHighlighter
                showLineNumbers
                language={'py'}
                children={children as string}
              />
            )
          },
        }}
      >
        {props.question.description}
      </ReactMarkdown>
      <Form form={form}>
        <Form.Item
          name='content'
          rules={[{ required: true, message: 'Please input your answer!' }]}
        >
          <Input.TextArea
            placeholder='Answer'
            onInput={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setSubmitEnabled(Boolean(e.target.value))
            }
          />
        </Form.Item>

        <Form.Item>
          <Button type='primary' onClick={showModal} disabled={!submitEnabled}>
            Submit
          </Button>
        </Form.Item>

        <Modal
          centered
          open={isModalOpen}
          onCancel={handleCancel}
          closable={false}
          footer={[
            <Button key='back' onClick={handleCancel}>
              Cancel
            </Button>,
            <Button
              key='submit'
              type='primary'
              onClick={onFinish}
              disabled={!isOKEnabled}
            >
              Submit
            </Button>,
          ]}
        >
          <p>Thank you for taking the time to complete this question.</p>

          <p>
            Before continuing, the checkbox is your digital signature confirming
            you tried your best and produced your own answer.
          </p>

          <Checkbox onChange={onCheckboxChange}>I confirm</Checkbox>
        </Modal>
      </Form>

      {unitKey === 0 && (
        <Button type='primary' style={{ backgroundColor: '#ff1616' }}>
          <Link href='/questions/'>Leave</Link>
        </Button>
      )}
    </>
  )
}

type MyContext = GetServerSidePropsContext & {
  params: ParsedUrlQuery & { pk: string }
}

// TODO: use getStaticProps
export async function getServerSideProps(context: MyContext) {
  const { pk } = context.params

  const data = await axios
    .get(`https://ralmeida.dev/capstone_server/question/${pk}`, {
      httpsAgent: httpsAgent,
      headers: {
        Authorization: `Token ${TOKEN}`,
      },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.log({ error })
    })

  return { props: { question: data } }
}
