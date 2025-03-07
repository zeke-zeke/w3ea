import { Button, Divider, Modal, Text } from '@nextui-org/react'
import { Fragment } from 'react'

import ProjectInfoCard from '@/components/ProjectInfoCard'
import RequesDetailsCard from '@/components/RequestDetalilsCard'
import RequestMethodCard from '@/components/RequestMethodCard'
import RequestModalContainer from '@/components/RequestModalContainer'
import ModalStore from '@/store/ModalStore'

export default function SessionUnsuportedMethodModal() {
  // Get request and wallet data from store
  const requestEvent = ModalStore.state.data?.requestEvent
  const requestSession = ModalStore.state.data?.requestSession

  // Ensure request and wallet are defined
  if (!requestEvent || !requestSession) {
    return <Text>Missing request data</Text>
  }

  // Get required request data
  const { topic, params } = requestEvent
  const { chainId, request } = params

  const getReqAddress = () => {
    // eip155:11155111:0x5ebc3dc13728004bBE83608d05F851136C9fD85C
    if (requestSession == undefined) {
      return ''
    }
    const aaa = requestSession.namespaces.eip155.accounts[0].split(':')
    console.log('w3ea,getReqAddress,xd:', aaa)
    return aaa[2]
  }

  return (
    <Fragment>
      <RequestModalContainer title="Unsuported Method">
        <ProjectInfoCard metadata={requestSession.peer.metadata} />

        <Divider y={1} />

        <RequesDetailsCard
          chains={[chainId ?? '']}
          address={getReqAddress()}
          protocol={requestSession.relay.protocol}
        />

        <Divider y={1} />

        <RequestMethodCard methods={[request.method]} />
      </RequestModalContainer>
      <Modal.Footer>
        <Button auto flat color="error" onClick={ModalStore.close}>
          Close
        </Button>
      </Modal.Footer>
    </Fragment>
  )
}
