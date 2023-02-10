import { Agent } from 'https'
import axios from 'axios'
import { useAppContext } from '@/context/state'
import { Button, DatePicker, Form, Input, Modal } from 'antd'

const TOKEN = process.env.NEXT_PUBLIC_TOKEN

const httpsAgent = new Agent({
  rejectUnauthorized: false,
})

export default function PeerReviewModal(props: {
  isModalOpen: boolean
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const { unitKey, notify } = useAppContext()

  const [form] = Form.useForm()

  async function onPeerReviewSubmit() {
    try {
      if (unitKey) {
        const values = await form.validateFields()

        axios
          .post(
            'https://ralmeida.dev/capstone_server/peer-review/',
            {
              unit: unitKey,
              ...values,
              submitted_on: new Date(values.submitted_on.$d)
                .toISOString()
                .split('T')[0],
            },
            {
              headers: {
                Authorization: `Token ${TOKEN}`,
              },
              httpsAgent: httpsAgent,
            }
          )
          .then((response) => {
            props.setIsModalOpen(false)
            notify.success({
              message: 'Peer review submitted successfully',
              placement: 'bottomRight',
            })
          })
          .catch(function (error) {
            console.log({ createPeerReviewAxiosError: error })
          })
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Modal
      centered
      closable={false}
      open={props.isModalOpen}
      onCancel={() => {
        props.setIsModalOpen(false)
      }}
      footer={[
        <Button
          key='back'
          onClick={() => {
            props.setIsModalOpen(false)
          }}
        >
          Cancel
        </Button>,
        <Button key='submit' type='primary' onClick={onPeerReviewSubmit}>
          Submit
        </Button>,
      ]}
    >
      <p>
        After every peer-review assignment, paste the code YOU reviewed here
        with date the review happened.
      </p>

      <Form form={form}>
        <Form.Item
          name='content'
          rules={[
            {
              required: true,
              message: 'Please input the code YOU reviewed!',
            },
          ]}
        >
          <Input.TextArea placeholder='Code YOU reviewed' />
        </Form.Item>

        <Form.Item
          name='submitted_on'
          rules={[
            {
              required: true,
              message: 'Please input the date the review happened!',
            },
          ]}
        >
          <DatePicker />
        </Form.Item>
      </Form>
    </Modal>
  )
}
