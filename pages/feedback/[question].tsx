import { GetServerSidePropsContext } from 'next'
import axios from 'axios'
import { Agent } from 'https'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { Button, Typography, Space } from 'antd'
import { ParsedUrlQuery } from 'querystring'
import { useAppContext } from '@/context/state'
import LoginRequired from '@/components/sign-in-required'
import Link from 'next/link'
import styled from 'styled-components'
import { useState } from 'react'
import Head from 'next/head'

const httpsAgent = new Agent({
  rejectUnauthorized: false,
})

const ActionButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`

export default function FeedbackPage(props: {
  question: { title: string; description: string; type: string }
  feedback: { title: string; description: string; question: number }
}) {
  const { unit } = useAppContext()
  const [showQuestion, setShowQuestion] = useState(false)
  const [isLeaveButtonLoading, setIsLeaveButtonLoading] = useState(false)

  if (unit.key === undefined) {
    return <LoginRequired />
  }

  return (
    <>
      <Head>
        <title>{`Feedback For "${props.feedback.title}"`}</title>
        {/* TODO: Change description */}
        <meta name='description' content='' />
        {/* TODO: Change icon */}
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Typography.Title>{`Feedback For "${props.feedback.title}"`}</Typography.Title>

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
        {props.feedback.description}
      </ReactMarkdown>

      <ActionButtonWrapper>
        <Space>
          <Button type='primary' onClick={() => setShowQuestion(!showQuestion)}>
            {showQuestion ? 'Close Question' : 'View Question'}
          </Button>

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
        </Space>
      </ActionButtonWrapper>

      {showQuestion && (
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
            h3: ({ node, ...props }) => (
              <Typography.Title {...props} level={3} />
            ),
            h4: ({ node, ...props }) => (
              <Typography.Title {...props} level={4} />
            ),
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
      )}
    </>
  )
}

type MyContext = GetServerSidePropsContext & {
  params: ParsedUrlQuery & { question: string }
}

export async function getServerSideProps(context: MyContext) {
  const { question } = context.params

  const data = await axios
    .get(`https://ralmeida.dev/capstone_server/feedback/${question}/`, {
      httpsAgent: httpsAgent,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.log({ error })
    })

  const questionData = await axios
    .get(`https://ralmeida.dev/capstone_server/question/${question}/`, {
      httpsAgent: httpsAgent,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.log({ error })
    })

  return { props: { feedback: data, question: questionData } }
}
