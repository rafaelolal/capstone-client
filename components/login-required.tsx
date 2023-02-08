import Link from 'next/link'
import { Typography, Button } from 'antd'

export default function LoginRequired() {
  return (
    <>
      <Typography.Title>
        You must sign in before viewing questions
      </Typography.Title>

      <Link href='/'>
        <Button type='primary'>Back</Button>
      </Link>
    </>
  )
}
