import { Button, Modal } from 'antd'
import Link from 'next/link'

export default function ContinueModal(props: {
  selectedQuestion: number
  isModalOpen: boolean
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
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
        <Button key='submit' type='primary'>
          <Link href={`/questions/${props.selectedQuestion}/`}>OK</Link>
        </Button>,
      ]}
    >
      <p>
        Before continuing, please ensure that you are signed in with the correct
        key and that you have around thirty uninterrupted minutes before
        beginning.
      </p>

      <p>
        Keep in mind that you are not evaluated based off accuracy or quality
        and compared to any other participant.
      </p>

      <p>
        After starting, you are only allowed to return by submitting an answer.
      </p>
    </Modal>
  )
}
