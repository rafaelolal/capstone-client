import { Agent } from 'https'
import axios from 'axios'
import { useAppContext } from '@/context/state'
import { Button, Form, Modal, Radio, Space } from 'antd'

const httpsAgent = new Agent({
  rejectUnauthorized: false,
})

export default function SignedModal(props: {
  isModalOpen: boolean
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const { unit, setUnit, notify } = useAppContext()

  const [form] = Form.useForm()

  async function onPeerReviewSubmit() {
    try {
      const values = await form.validateFields()

      axios
        .patch(
          `https://ralmeida.dev/capstone_server/unit-signed/${unit.key}/`,
          {
            signed: values.signed,
          },
          {
            httpsAgent: httpsAgent,
          }
        )
        .then((response) => {
          setUnit({ ...unit, signed: values.signed })
          props.setIsModalOpen(false)
          notify.success({
            message: 'Decision set successfully',
            placement: 'bottomRight',
          })
        })
        .catch(function (error) {
          console.log({ unitSignedAxiosError: error })
        })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Modal
      centered
      closable={false}
      maskClosable={false}
      open={props.isModalOpen}
      onCancel={() => {
        props.setIsModalOpen(false)
      }}
      footer={[
        <Button key='submit' type='primary' onClick={onPeerReviewSubmit}>
          Submit
        </Button>,
      ]}
    >
      <p>Before continuing, confirm that you agreed to be in the study.</p>
      <p>
        If you are unsure, use your school email to sign the informed consent
        form{' '}
        <a target='_blank' rel="noreferrer" href='https://forms.gle/55HnH7p4UciAVqsg7'>
          here
        </a>
        . You will receive a receipt of your response.
      </p>

      <Form form={form}>
        <Form.Item
          name='signed'
          rules={[
            {
              required: true,
              message: 'Please select an option!',
            },
          ]}
        >
          <Radio.Group>
            <Space direction='vertical'>
              <Radio value={true}>I agreed</Radio>
              <Radio value={false}>I DID NOT agree</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  )
}
