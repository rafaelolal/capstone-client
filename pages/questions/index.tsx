import { Agent } from 'https'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Card, Table, Button, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useAppContext } from '@/context/state'
import LoginRequired from '@/components/sign-in-required'
import PeerReviewModal from '@/components/peer-review-modal'
import ContinueModal from '@/components/continue-modal'
import UnitProfile from '@/components/unit-profile'
import SignedModal from '@/components/signed-modal'
import Link from 'next/link'
import Head from 'next/head'

const httpsAgent = new Agent({
  rejectUnauthorized: false,
})

type Question = {
  pk: number
  title: string
  type: string
  opens_on: string
  due_on: string
  pre_requisite: number
}

const meetsPreRequisite = (unitAnswers: number[], record: Question) =>
  !record.pre_requisite || unitAnswers.includes(record.pre_requisite)

const hasAnsweredThisQuestion = (unitAnswers: number[], record: Question) =>
  unitAnswers.includes(record.pk)

const isQuestionWithinDateRange = (record: Question) =>
  new Date() > new Date(record.opens_on) && new Date() < new Date(record.due_on)

const isQuestionAccessible = (
  unitType: string,
  unitAnswers: number[],
  record: Question
) =>
  (meetsPreRequisite(unitAnswers, record) &&
    !hasAnsweredThisQuestion(unitAnswers, record) &&
    isQuestionWithinDateRange(record)) ||
  unitType == 'Test'

const getColumns = (
  onStart: (record: Question) => void,
  unitType: string,
  unitAnswers: number[],
  feedbacks: number[],
  isFeedbackButtonLoading: boolean,
  setIsFeedbackButtonLoading: React.Dispatch<React.SetStateAction<boolean>>
): ColumnsType<Question> => [
  {
    title: 'TITLE',
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: 'OPENS ON',
    dataIndex: 'opens_on',
    key: 'opens_on',
  },
  {
    title: 'DUE ON',
    dataIndex: 'due_on',
    key: 'due_on',
  },
  {
    // title: 'ACTIONS',
    dataIndex: 'actions',
    key: 'actions',
    render: (_: any, record: Question) => (
      <Space>
        <Button
          disabled={!isQuestionAccessible(unitType, unitAnswers, record)}
          onClick={() => onStart(record)}
        >
          Start
        </Button>

        <Link href={`/feedback/${record.pk}/`} passHref>
          <Button
            disabled={
              unitType == 'Test'
                ? !feedbacks.includes(record.pk)
                : !(
                    unitAnswers.includes(record.pk) &&
                    feedbacks.includes(record.pk)
                  )
            }
            loading={isFeedbackButtonLoading}
            onClick={() => setIsFeedbackButtonLoading(true)}
          >
            Feedback
          </Button>
        </Link>
      </Space>
    ),
  },
]

export default function QuestionsPage(props: {
  questions: Question[]
  feedbacks: number[]
}) {
  const { unit } = useAppContext()

  const [isSignedModalOpen, setIsSignedModalOpen] = useState(false)
  const [isContinueModalOpen, setIsContinueModalOpen] = useState(false)
  const [isPeerReviewModalOpen, setIsPeerReviewModalOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<number>()
  const [isFeedbackButtonLoading, setIsFeedbackButtonLoading] = useState(false)

  useEffect(() => {
    if (unit.signed === null) {
      setIsSignedModalOpen(true)
    }
  }, [unit.signed])

  if (unit.key === undefined) {
    return <LoginRequired />
  }

  const showContinueModal = (record: Question) => {
    setSelectedQuestion(record.pk)
    setIsContinueModalOpen(true)
  }

  const dataSource = props.questions
    .filter(
      (q) =>
        (unit.type == 'Control' && q.type == 'Test') ||
        ['Experimental', 'Test'].includes(unit.type!)
    )
    .map((q) => ({
      key: q.pk,
      ...q,
    }))

  return (
    <>
      <Head>
        <title>Questions</title>
        {/* TODO: Change description */}
        <meta name='description' content='' />
        {/* TODO: Change icon */}
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <SignedModal
        isModalOpen={isSignedModalOpen}
        setIsModalOpen={setIsSignedModalOpen}
      />

      <ContinueModal
        selectedQuestion={selectedQuestion!}
        isModalOpen={isContinueModalOpen}
        setIsModalOpen={setIsContinueModalOpen}
      />

      <PeerReviewModal
        isModalOpen={isPeerReviewModalOpen}
        setIsModalOpen={setIsPeerReviewModalOpen}
      />

      <Space direction='vertical' size={'large'}>
        <UnitProfile />

        <Button
          type='default'
          onClick={() => {
            setIsPeerReviewModalOpen(true)
          }}
        >
          Create Peer Review
        </Button>

        <Card>
          <Table
            pagination={false}
            dataSource={dataSource}
            columns={getColumns(
              showContinueModal,
              unit.type!,
              unit.answers!,
              props.feedbacks,
              isFeedbackButtonLoading,
              setIsFeedbackButtonLoading
            )}
          />
        </Card>
      </Space>
    </>
  )
}

// TODO: use getStaticProps
export async function getServerSideProps() {
  const data = await axios
    .get('https://ralmeida.dev/capstone_server/question-list/', {
      httpsAgent: httpsAgent,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error({ error })
    })

  const feedbackData = await axios
    .get('https://ralmeida.dev/capstone_server/feedback-list/', {
      httpsAgent: httpsAgent,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error({ error })
    })

  const formattedFeedbackData = feedbackData.map(
    (o: { question: number }) => o.question
  )

  return { props: { questions: data, feedbacks: formattedFeedbackData } }
}
