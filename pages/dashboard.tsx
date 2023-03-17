import { Table } from 'antd'
import axios from 'axios'
import { Agent } from 'https'

const httpsAgent = new Agent({
  rejectUnauthorized: false,
})

type DataType = { key: number; missing: number; classroom: string }
type ModDataType = {
  key: number
  unitKey: number
  missing: number
  classroom: string
}

const getDataSource = (data: DataType[]) => {
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
      missing: datum.missing,
    })
    i++
  }

  dataSource.sort(
    (a, b) => a.missing - b.missing || a.classroom.localeCompare(b.classroom)
  )

  return dataSource
}

const columns = [
  {
    title: 'Classroom',
    dataIndex: 'classroom',
    key: 'classroom',
    filters: [
      { text: 'A-3/4', value: 'A-3/4' },
      { text: 'A-7/8', value: 'A-7/8' },
      { text: 'B-3/4', value: 'B-3/4' },
      { text: 'B-7/8', value: 'B-7/8' },
    ],
    onFilter: (value: string | number | boolean, record: DataType) =>
      record.classroom.indexOf(value as string) == 0,
  },
  {
    title: 'Key',
    dataIndex: 'unitKey',
    key: 'unitKey',
  },
  {
    title: 'Missing Questions',
    dataIndex: 'missing',
    key: 'missing',
    render: (_: any, record: ModDataType) => ({
      props: {
        style: {
          backgroundColor: record.missing > 0 ? '#ffb09c' : '',
        },
      },
      children: <div>{record.missing}</div>,
    }),
  },
]

export default function DashboardPage(props: { data: DataType[] }) {
  return (
    <>
      <Table
        pagination={{
          defaultPageSize: 100,
        }}
        dataSource={getDataSource(props.data)}
        columns={columns}
      />
    </>
  )
}

export async function getServerSideProps() {
  const data = await axios
    .get('https://ralmeida.dev/capstone_server/unit-missings/', {
      httpsAgent: httpsAgent,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.log({ error })
    })

  return { props: { data } }
}
