import { Agent } from 'https'
import axios from 'axios'
import { useAppContext } from '@/context/state'
import { Button, DatePicker, Form, Input, Modal, Space } from 'antd'
import { useState } from 'react'

const httpsAgent = new Agent({
  rejectUnauthorized: false,
})

export default function PeerReviewModal(props: {
  isModalOpen: boolean
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const { unit, notify } = useAppContext()

  const [isPeerReviewSubmitButtonLoading, setIsPeerReviewSubmitButtonLoading] =
    useState(false)
  const [form] = Form.useForm()

  async function onPeerReviewSubmit() {
    try {
      const values = await form.validateFields()

      axios
        .post(
          'https://ralmeida.dev/capstone_server/peer-review/',
          {
            unit: unit.key,
            ...values,
            submitted_on: new Date(values.submitted_on.$d)
              .toISOString()
              .split('T')[0],
          },
          {
            httpsAgent: httpsAgent,
          }
        )
        .then(() => {
          props.setIsModalOpen(false)
          notify.success({
            message: 'Peer review submitted successfully',
            placement: 'bottomRight',
          })
        })
        .catch(function (error) {
          console.log({ createPeerReviewAxiosError: error })
        })
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
        <Space key="footer">
          <Button
            onClick={() => {
              props.setIsModalOpen(false)
            }}
          >
            Cancel
          </Button>

          <Button
            type='primary'
            loading={isPeerReviewSubmitButtonLoading}
            onClick={() => {
              setIsPeerReviewSubmitButtonLoading(true)
              onPeerReviewSubmit()
            }}
          >
            Submit
          </Button>
        </Space>
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
