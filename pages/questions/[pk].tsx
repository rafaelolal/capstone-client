import { useEffect, useRef, useState } from 'react'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import { Typography, Button, Form, Input, Modal, Checkbox } from 'antd'
import { ParsedUrlQuery } from 'querystring'
import { useAppContext } from '@/context/state'
import { CheckboxChangeEvent } from 'antd/es/checkbox'

export default function QuestionsPage(props: {
  question: { title: string; description: string }
}) {
  const { unitKey, notify, unitAnswers, setUnitAnswers } = useAppContext()

  const [form] = Form.useForm()
  const router = useRouter()
  const startDate = useRef(new Date())

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
          'https://ralmeida.dev/capstone_server/answer',
          {
            unit: unitKey,
            question: router.query.pk,
            content: values.content,
            time_spent: Math.ceil(
              (new Date().getTime() - startDate.current.getTime()) / 1000
            ),
          },
          {
            headers: {
              Authorization: `Token ${process.env.TOKEN}`,
            },
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
    } catch (error) {
      console.error(error)
    }
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
          h2: ({ node, ...props }) => <Typography.Title {...props} level={2} />,
          h3: ({ node, ...props }) => <Typography.Title {...props} level={3} />,
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
            Before continuing, make the below checkbox your digital signature
            confirming that you tried your best and produced your own answer.
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
  const { unitKey } = useAppContext()

  if (Boolean(unitKey)) {
    return { redirect: { destination: '/signIn', permanent: true } }
  }

  const { pk } = context.params
  const data = await axios
    .get(
      `https://ralmeida.dev/capstone_server/question/${pk}?format=json
      }`,
      { headers: { Authorization: `Token ${process.env.TOKEN}` } }
    )
    .then((response) => response.data)
    .catch((error) => {
      console.log({ error })
    })

  return { props: { question: data } }
}
