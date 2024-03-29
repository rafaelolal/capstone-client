import { useEffect, useRef, useState } from 'react'
import { GetServerSidePropsContext } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import axios from 'axios'
import { Agent } from 'https'
import styled from 'styled-components'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { Typography, Button, Form, Input, Modal, Checkbox, Space } from 'antd'
import { ParsedUrlQuery } from 'querystring'
import { useAppContext } from '@/context/state'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import LoginRequired from '@/components/sign-in-required'
import Head from 'next/head'

const httpsAgent = new Agent({
  rejectUnauthorized: false,
})

const ActionButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`

export default function QuestionPage(props: {
  question: { title: string; description: string; type: string }
}) {
  const { unit, setUnit, notify } = useAppContext()

  const router = useRouter()
  const [form] = Form.useForm()
  const startDate = useRef<Date>()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isOKEnabled, setIsOKEnabled] = useState(false)
  const [submitEnabled, setSubmitEnabled] = useState(false)
  const [isLeaveButtonLoading, setIsLeaveButtonLoading] = useState(false)
  const [isSubmitButtonLoading, setIsSubmitButtonLoading] = useState(false)

  useEffect(() => {
    props.question.type == 'Test' ? (startDate.current = new Date()) : undefined
  }, [props])

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
      const values = await form.validateFields()

      axios
        .post(
          'https://ralmeida.dev/capstone_server/answer/',
          {
            unit: unit.key,
            question: router.query.pk,
            content: values.content,
            time_spent: startDate.current
              ? Math.ceil(
                  (new Date().getTime() - startDate.current.getTime()) / 1000
                )
              : null,
          },
          {
            httpsAgent: httpsAgent,
          }
        )
        .then((response) => {
          router.replace('/questions/')
          setIsModalOpen(false)
          setUnit({
            ...unit,
            answers: [...unit.answers!, parseInt(router.query.pk as string)],
          })

          notify.success({
            message: 'Answer submitted successfully',
            placement: 'bottomRight',
          })
        })
        .catch(function (error) {
          console.error({ createAnswerAxiosError: error })
        })
    } catch (error) {
      console.error(error)
    }
  }

  if (unit.key === undefined) {
    return <LoginRequired />
  }

  return (
    <>
      <Head>
        <title>{props.question.title}</title>
        {/* TODO: Change description */}
        <meta name='description' content='' />
        {/* TODO: Change icon */}
        <link rel='icon' href='/favicon.ico' />
      </Head>

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
          li: ({ node, ...props }) => (
            <li
              style={{
                fontFamily: 'Roboto Mono, monospace',
              }}
              {...props}
            />
          ),
          h3: ({ node, ...props }) => <Typography.Title {...props} level={3} />,
          h4: ({ node, ...props }) => <Typography.Title {...props} level={4} />,
          code: ({ children }) => {
            return (
              <SyntaxHighlighter showLineNumbers language={'py'}>
                {children as string}
              </SyntaxHighlighter>
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
          <ActionButtonWrapper>
            {unit.type == 'Test' && (
              <Link href='/questions/' passHref>
                <Button
                  type='primary'
                  danger
                  loading={isLeaveButtonLoading}
                  onClick={() => setIsLeaveButtonLoading(true)}
                >
                  Leave
                </Button>
              </Link>
            )}

            <Button
              type='primary'
              onClick={showModal}
              disabled={!submitEnabled}
            >
              Submit
            </Button>
          </ActionButtonWrapper>
        </Form.Item>

        <Modal
          centered
          open={isModalOpen}
          onCancel={handleCancel}
          closable={false}
          footer={[
            <Space key='footer'>
              <Button onClick={handleCancel}>
                Cancel
              </Button>

              <Button
                type='primary'
                disabled={!isOKEnabled}
                loading={isSubmitButtonLoading}
                onClick={() => {
                  setIsSubmitButtonLoading(true)
                  onFinish()
                }}
              >
                Submit
              </Button>
            </Space>
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
    .get(`https://ralmeida.dev/capstone_server/question/${pk}/`, {
      httpsAgent: httpsAgent,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.log({ error })
    })

  return { props: { question: data } }
}
