import { GetServerSidePropsContext } from 'next'
import axios from 'axios'
import { Agent } from 'https'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { Typography } from 'antd'
import { ParsedUrlQuery } from 'querystring'
import { useAppContext } from '@/context/state'
import LoginRequired from '@/components/login-required'

const httpsAgent = new Agent({
  rejectUnauthorized: false,
})

export default function FeedbackPage(props: {
  feedback: { title: string; description: string; question: number }
}) {
  const { unit } = useAppContext()

  if (unit.key === undefined) {
    return <LoginRequired />
  }

  return (
    <>
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
    </>
  )
}

type MyContext = GetServerSidePropsContext & {
  params: ParsedUrlQuery & { question: string }
}

// TODO: use getStaticProps
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

  return { props: { feedback: data } }
}
