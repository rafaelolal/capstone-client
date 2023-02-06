import React from 'react'
import { Card, Table, Button } from 'antd'
import axios from 'axios'
import type { ColumnsType } from 'antd/es/table'

const columns = [
  {
    title: 'OPENS',
    dataIndex: 'open_at',
    key: 'id',
  },
  {
    title: 'DUE',
    dataIndex: 'due_at',
    key: 'id',
  },
  {
    title: 'ACTION',
    dataIndex: 'action',
    key: 'action',
    render: () => <Button>START</Button>,
  },
]

const QuestionsPage = ({ data }) => {
  const dataSource: ColumnsType = data.map((u, idx) => ({
    key: idx,
    open_at: u.open_at,
    due_at: u.due_at,
  }))

  return (
    <Card style={{ width: '90%' }}>
      <Table dataSource={dataSource} columns={columns} />
    </Card>
  )
}

export async function getServerSideProps() {
  const res = await fetch(
    `https://ralmeida.dev/capstone_server/questions/?format=json`
  )
  const data = await res.json()

  return { props: { data } }
}

export default QuestionsPage
