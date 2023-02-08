import React, { useState } from 'react'
import { useRouter } from 'next/router'
import * as https from 'https'
import axios from 'axios'
import { Card, Table, Button, Modal, Space, Avatar, Row, Col } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useAppContext } from '@/context/state'
import { UserOutlined } from '@ant-design/icons'

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
})

type Question = {
  pk: number
  title: string
  type: string
  open_at: string
  due_at: string
}

type unitAnswersType = { question: number }[]

const unitHasAnswered = (unitAnswers: unitAnswersType, record: Question) =>
  unitAnswers.map((a) => a.question).includes(record.pk)

const isQuestionWithinDateRange = (record: Question) =>
  new Date() > new Date(record.open_at) && new Date() < new Date(record.due_at)

const isQuestionAccessible = (unitAnswers: unitAnswersType, record: Question) =>
  !unitHasAnswered(unitAnswers, record) && isQuestionWithinDateRange(record)

const getColumns = (
  onStart: (record: Question) => void,
  unitAnswers: unitAnswersType
): ColumnsType<Question> => {
  return [
    {
      title: 'TITLE',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'OPENS',
      dataIndex: 'open_at',
      key: 'open_at',
    },
    {
      title: 'DUE',
      dataIndex: 'due_at',
      key: 'due_at',
    },
    {
      // title: 'START',
      dataIndex: 'start',
      key: 'start',
      render: (_: any, record: Question) => (
        <Button
          disabled={!isQuestionAccessible(unitAnswers, record)}
          onClick={() => onStart(record)}
        >
          START
        </Button>
      ),
    },
  ]
}

export default function QuestionsPage(props: { questions: Question[] }) {
  const { unitKey, unitAnswers } = useAppContext()

  const router = useRouter()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<number>()

  const showModal = (record: Question) => {
    setSelectedQuestion(record.pk)
    setIsModalOpen(true)
  }

  const handleOk = () => {
    router.replace(`/questions/${selectedQuestion}`)
    setIsModalOpen(false)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  const dataSource = props.questions.map((q) => ({
    key: q.pk,
    pk: q.pk,
    title: q.title,
    type: q.type,
    open_at: q.open_at,
    due_at: q.due_at,
  }))

  return (
    <>
      <Modal
        centered
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        closable={false}
      >
        <p>
          Before continuing, please ensure that you are signed in with the
          correct key and that you have around thirty uninterrupted minutes
          before beginning.
        </p>
        <p>
          Keep in mind that you are not evaluated based off accuracy or quality
          and compared to any other student.
        </p>
        <p>
          After starting, you are only allowed to return by submitting an
          answer.
        </p>
      </Modal>

      <Space direction='vertical' size={'large'}>
        <Card size='small'>
          <Row wrap={false} align='middle'>
            <Col
              flex='100px'
              style={{
                textAlign: 'center',
              }}
            >
              <Avatar
                shape='square'
                size={64}
                icon={<UserOutlined />}
                style={{ marginBottom: 0 }}
              />
              <p
                style={{
                  fontWeight: 'bold',
                  marginTop: '4px',
                  marginBottom: '0px',
                }}
              >{`Unit ${unitKey}`}</p>
            </Col>

            <Col flex='auto' style={{ marginRight: '16px' }}>
              <p style={{ margin: '0px' }}>
                No personal information is collected, so have fun learning. And,
                remember that honesty is of the utmost importance for the
                experiment to go well, so take your time and do not worry about
                mistakes. Thanks for participating.
              </p>
            </Col>
          </Row>
        </Card>

        <Card>
          <Table
            pagination={false}
            dataSource={dataSource}
            columns={getColumns(showModal, unitAnswers)}
          />
        </Card>
      </Space>
    </>
  )
}

// TODO: use getStaticProps
export async function getServerSideProps() {
  const { unitKey } = useAppContext()

  if (Boolean(unitKey)) {
    return { redirect: { destination: '/signIn', permanent: true } }
  }

  const data = await axios
    .get(
      `https://ralmeida.dev/capstone_server/question-list/?format=json${
        unitKey.substring(0, 2) == '22' ? '&control' : ''
      }`,
      {
        httpsAgent: httpsAgent,
        headers: {
          Authorization: `Token ${process.env.TOKEN}`,
        },
      }
    )
    .then((response) => response.data)
    .catch((error) => {
      console.log({ error })
    })

  return { props: { questions: data } }
}
