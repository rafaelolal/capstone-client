import { useRouter } from 'next/router'
import { Modal } from 'antd'

export default function ContinueModal(props: {
  selectedQuestion: number
  isModalOpen: boolean
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const router = useRouter()

  const handleContinueOk = () => {
    router.replace(`/questions/${props.selectedQuestion}/`)
    props.setIsModalOpen(false)
  }

  return (
    <Modal
      centered
      open={props.isModalOpen}
      onOk={handleContinueOk}
      onCancel={() => {
        props.setIsModalOpen(false)
      }}
      closable={false}
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
