import { Avatar, Card, Col, Row } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { useAppContext } from '@/context/state'

export default function UnitProfile() {
  const { unit } = useAppContext()

  return (
    <Card size='small'>
      <Row wrap={false} align='middle'>
        <Col
          flex='100px'
          style={{
            textAlign: 'center',
          }}
        >
          <Avatar shape='square' size={64} icon={<UserOutlined />} />

          <p
            style={{
              fontWeight: 'bold',
              marginTop: '4px',
              marginBottom: '0px',
            }}
          >{`Unit ${unit.key}`}</p>
        </Col>

        <Col flex='auto'>
          <p>
            No personal information is collected, so have fun learning. And,
            remember that honesty is of the utmost importance for the experiment
            to go well, so take your time and do not worry about mistakes.
            Thanks for participating.
          </p>

          {unit.type == 'Test' && (
            <p>
              As a test unit, you will see exactly what participants see.
              However, questions will be open despite of the date, and you will
              have more navigation options (like leaving a question).
            </p>
          )}
        </Col>
      </Row>
    </Card>
  )
}
