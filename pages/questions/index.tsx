import React from 'react'
import { Card, Table, Button } from 'antd'
import axios from 'axios'
import type { ColumnsType } from 'antd/es/table'
import Link from 'next/link'
import { useAppContext } from '@/context/state'
import LoginRequired from '@/components/login-required'

type Question = {
  pk: number
  title: string
  type: string
  open_at: string
  due_at: string
}

export default function QuestionsPage(props: { questions: Question[] }) {
  const { unitKey, unitAnswers } = useAppContext()

  console.log({ unitAnswers })

  const dataSource: ColumnsType = props.questions.map((q) => ({
    key: q.pk,
    pk: q.pk,
    title: q.title,
    type: q.type,
    open_at: q.open_at,
    due_at: q.due_at,
  }))

  const columns = [
    {
      title: 'TITLE',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'TYPE',
      dataIndex: 'type',
      key: 'type',
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
      render: (_: any, record: Question) => {
        const today = new Date()
        if (
          !unitAnswers.map((a) => a.question).includes(record.pk) &&
          today > new Date(record.open_at) &&
          today < new Date(record.due_at)
        ) {
          return (
            <Link href={`/questions/${record.pk}`}>
              <Button>START</Button>
            </Link>
          )
        }
        return <Button disabled>START</Button>
      },
    },
  ]

  if (!unitKey) {
    return <LoginRequired />
  }

  return (
    <Card style={{ width: '90%' }}>
      <Table dataSource={dataSource} columns={columns} />
    </Card>
  )
}

export async function getServerSideProps() {
  const data = await axios
    .get('https://ralmeida.dev/capstone_server/question-list/?format=json')
    .then((response) => response.data)
    .catch((error) => {
      console.log({ error })
    })

  return { props: { questions: data } }
}
