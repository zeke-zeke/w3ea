import { COSMOS_MAINNET_CHAINS, TCosmosChain } from '@/data/COSMOSData'
import { EIP155_CHAINS, TEIP155Chain } from '@/data/EIP155Data'
import { KADENA_CHAINS, TKadenaChain } from '@/data/KadenaData'
import { NEAR_TEST_CHAINS, TNearChain } from '@/data/NEARData'
import { SOLANA_CHAINS, TSolanaChain } from '@/data/SolanaData'
import { MULTIVERSX_CHAINS, TMultiversxChain } from '@/data/MultiversxData'
import { TRON_CHAINS, TTronChain } from '@/data/TronData'
import { Col, Divider, Row, Text } from '@nextui-org/react'
import { Fragment } from 'react'

/**
 * Types
 */
interface IProps {
  chains: string[]
  address: string
  protocol: string
}

/**
 * Component
 */
export default function RequestDetailsCard({ chains, address, protocol }: IProps) {
  console.log('w3ea,RequestDetailsCard,chains123:', chains, address)

  return (
    <Fragment>
      <Row>
        <Col>
          <Text color="red" h6>
            {
              "If the chain or address in the top nav doesn't match the one here, you need to switch them before approving"
            }
          </Text>
          <Text h5>Blockchain(s)</Text>
          <Text color="$gray400" data-testid="request-details-chain">
            {chains
              .map(
                chain =>
                  EIP155_CHAINS[chain as TEIP155Chain]?.name ??
                  COSMOS_MAINNET_CHAINS[chain as TCosmosChain]?.name ??
                  SOLANA_CHAINS[chain as TSolanaChain]?.name ??
                  NEAR_TEST_CHAINS[chain as TNearChain]?.name ??
                  MULTIVERSX_CHAINS[chain as TMultiversxChain]?.name ??
                  TRON_CHAINS[chain as TTronChain]?.name ??
                  KADENA_CHAINS[chain as TKadenaChain]?.name ??
                  chain
              )
              .join(', ')}
          </Text>
          <Text color="red" h6>
            {address}
          </Text>
        </Col>
      </Row>

      <Divider y={2} />

      <Row>
        <Col>
          <Text h5>Relay Protocol</Text>
          <Text color="$gray400" data-testid="request-detauls-realy-protocol">
            {protocol}
          </Text>
        </Col>
      </Row>
    </Fragment>
  )
}
