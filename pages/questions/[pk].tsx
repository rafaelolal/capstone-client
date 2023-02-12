import { useRef, useState } from 'react'
import { GetServerSidePropsContext } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import axios from 'axios'
import { Agent } from 'https'
import styled from 'styled-components'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { Typography, Button, Form, Input, Modal, Checkbox } from 'antd'
import { ParsedUrlQuery } from 'querystring'
import { useAppContext } from '@/context/state'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import LoginRequired from '@/components/login-required'

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
          console.log({ createAnswerAxiosError: error })
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
              <Button type='primary' danger>
                <Link href='/questions/'>Leave</Link>
              </Button>
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
    })
    .then((response) => response.data)
    .catch((error) => {
      console.log({ error })
    })

  return { props: { question: data } }
}
