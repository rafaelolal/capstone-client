import { Agent } from 'https'
import React, { useState } from 'react'
import axios from 'axios'
import { Card, Table, Button, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useAppContext } from '@/context/state'
import LoginRequired from '@/components/login-required'
import PeerReviewModal from '@/components/peer-review-modal'
import ContinueModal from '@/components/continue-modal'
import UnitProfile from '@/components/unit-profile'

const TOKEN = process.env.NEXT_PUBLIC_TOKEN

const httpsAgent = new Agent({
  rejectUnauthorized: false,
})

type Question = {
  pk: number
  title: string
  type: string
  opens_on: string
  due_on: string
}

type unitAnswersType = { question: number }[]

const isPretest = (record: Question) => record.title == 'Pretest'

const hasAnsweredPreviousQuestion = (
  unitAnswers: unitAnswersType,
  record: Question
) => unitAnswers.map((a) => a.question).includes(record.pk - 1)

const hasAnsweredThisQuestion = (
  unitAnswers: unitAnswersType,
  record: Question
) => unitAnswers.map((a) => a.question).includes(record.pk)

const isQuestionWithinDateRange = (record: Question) =>
  new Date() > new Date(record.opens_on) && new Date() < new Date(record.due_on)

const isQuestionAccessible = (
  unitAnswers: unitAnswersType,
  record: Question,
  unitKey: number
) =>
  ((isPretest(record) || hasAnsweredPreviousQuestion(unitAnswers, record)) &&
    !hasAnsweredThisQuestion(unitAnswers, record) &&
    isQuestionWithinDateRange(record)) ||
  unitKey === 0

const getColumns = (
  onStart: (record: Question) => void,
  unitAnswers: unitAnswersType,
  unitKey: number
): ColumnsType<Question> => {
  return [
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
      // title: 'START',
      dataIndex: 'start',
      key: 'start',
      render: (_: any, record: Question) => (
        <Button
          disabled={!isQuestionAccessible(unitAnswers, record, unitKey)}
          onClick={() => onStart(record)}
        >
          Start
        </Button>
      ),
    },
  ]
}

export default function QuestionsPage(props: { questions: Question[] }) {
  const { unitKey, unitAnswers } = useAppContext()

  const [isContinueModalOpen, setIsContinueModalOpen] = useState(false)
  const [isPeerReviewModalOpen, setIsPeerReviewModalOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<number>()

  if (unitKey === undefined) {
    return <LoginRequired />
  }

  const showContinueModal = (record: Question) => {
    setSelectedQuestion(record.pk)
    setIsContinueModalOpen(true)
  }

  const dataSource = props.questions
    .filter((q) => (unitKey >= 2200 && q.type != 'Normal') || unitKey < 2200)
    .map((q) => ({
      key: q.pk,
      ...q,
    }))

  return (
    <>
      <ContinueModal
        selectedQuestion={selectedQuestion as number}
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
            columns={getColumns(showContinueModal, unitAnswers, unitKey)}
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
      headers: {
        Authorization: `Token ${TOKEN}`,
      },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.log({ error })
    })

  return { props: { questions: data } }
}
