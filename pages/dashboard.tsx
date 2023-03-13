import { Table } from 'antd'
import axios from 'axios'
import { Agent } from 'https'

const httpsAgent = new Agent({
  rejectUnauthorized: false,
})

const getDataSource = (data) => {
  const dataSource = []

  var i = 0
  for (const datum of data) {
    if (datum.key == 9999) {
      continue
    }

    dataSource.push({
      key: i,
      classroom: datum.classroom,
      unitKey: datum.key,
      answerCount: datum.answers,
    })
    i++
  }

  return dataSource
}

const columns = [
  {
    title: 'Classroom',
    dataIndex: 'classroom',
    key: 'classroom',
  },
  {
    title: 'Key',
    dataIndex: 'unitKey',
    key: 'unitKey',
  },
  {
    title: 'Answer Count',
    dataIndex: 'answerCount',
    key: 'answerCount',
    render: (_: any, record) => (
      <p
        style={{
          color:
            (record.classroom.includes('A') && record.answerCount < 1) ||
            (record.classroom.includes('B') && record.answerCount < 5)
              ? 'red'
              : '',
        }}
      >
        {record.answerCount}
      </p>
    ),
  },
]

export default function DashboardPage(props) {
  return (
    <>
      <Table dataSource={getDataSource(props.data)} columns={columns} />
    </>
  )
}

export async function getServerSideProps() {
  const data = await axios
    .get('https://ralmeida.dev/capstone_server/unit-answers/', {
      httpsAgent: httpsAgent,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.log({ error })
    })

  return { props: { data } }
}
