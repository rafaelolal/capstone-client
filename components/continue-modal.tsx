import { Button, Modal } from 'antd'
import Link from 'next/link'
import { useState } from 'react'

export default function ContinueModal(props: {
  selectedQuestion: number
  isModalOpen: boolean
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const [isOKButtonLoading, setIsOKButtonLoading] = useState(false)

  return (
    <Modal
      centered
      open={props.isModalOpen}
      closable={false}
      footer={[
        <Button
          key='back'
          onClick={() => {
            props.setIsModalOpen(false)
          }}
        >
          Cancel
        </Button>,

        <Link 
          key='submit'
          href={`/questions/${props.selectedQuestion}/`} passHref>
          <Button
            type='primary'
            loading={isOKButtonLoading}
            onClick={() => setIsOKButtonLoading(true)}
          >
            OK
          </Button>
        </Link>,
      ]}
    >
      <p>
        Before continuing, please ensure that you are signed in with the correct
        key and that you have around thirty uninterrupted minutes before
        beginning.
      </p>

      <p>
        Keep in mind that the accuracy of your response will be recorded.
      </p>

      <p>
        After starting, you are only allowed to return by submitting an answer.
      </p>
    </Modal>
  )
}
