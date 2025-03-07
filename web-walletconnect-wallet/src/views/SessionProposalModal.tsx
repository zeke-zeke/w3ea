import { Col, Grid, Row, Text, styled } from '@nextui-org/react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils'
import { SignClientTypes } from '@walletconnect/types'
import DoneIcon from '@mui/icons-material/Done'
import CloseIcon from '@mui/icons-material/Close'
import ModalStore from '@/store/ModalStore'
import { cosmosAddresses } from '@/utils/CosmosWalletUtil'
import { eip155Addresses } from '@/utils/EIP155WalletUtil'
import { polkadotAddresses } from '@/utils/PolkadotWalletUtil'
import { multiversxAddresses } from '@/utils/MultiversxWalletUtil'
import { tronAddresses } from '@/utils/TronWalletUtil'
import { tezosAddresses } from '@/utils/TezosWalletUtil'
import { solanaAddresses } from '@/utils/SolanaWalletUtil'
import { nearAddresses } from '@/utils/NearWalletUtil'
import { kadenaAddresses } from '@/utils/KadenaWalletUtil'
import { styledToast } from '@/utils/HelperUtil'
import { web3wallet } from '@/utils/WalletConnectUtil'
import { EIP155_CHAINS, EIP155_SIGNING_METHODS } from '@/data/EIP155Data'
import { COSMOS_MAINNET_CHAINS, COSMOS_SIGNING_METHODS } from '@/data/COSMOSData'
import { KADENA_CHAINS, KADENA_SIGNING_METHODS } from '@/data/KadenaData'
import { MULTIVERSX_CHAINS, MULTIVERSX_SIGNING_METHODS } from '@/data/MultiversxData'
import { NEAR_CHAINS, NEAR_SIGNING_METHODS } from '@/data/NEARData'
import { POLKADOT_CHAINS, POLKADOT_SIGNING_METHODS } from '@/data/PolkadotData'
import { SOLANA_CHAINS, SOLANA_SIGNING_METHODS } from '@/data/SolanaData'
import { TEZOS_CHAINS, TEZOS_SIGNING_METHODS } from '@/data/TezosData'
import { TRON_CHAINS, TRON_SIGNING_METHODS } from '@/data/TronData'
import ChainDataMini from '@/components/ChainDataMini'
import ChainAddressMini from '@/components/ChainAddressMini'
import { getChainData } from '@/data/chainsUtil'
import RequestModal from '../components/RequestModal'
import ChainSmartAddressMini from '@/components/ChainSmartAddressMini'
import { useSnapshot } from 'valtio'
import SettingsStore from '@/store/SettingsStore'
import usePriorityAccounts from '@/hooks/usePriorityAccounts'
import useSmartAccounts from '@/hooks/useSmartAccounts'
import { EIP5792_METHODS } from '@/data/EIP5792Data'
import { getWalletCapabilities } from '@/utils/EIP5792WalletUtil'
import { EIP7715_METHOD } from '@/data/EIP7715Data'
import { useRouter } from 'next/router'
import { getW3eaAddress } from '@/w3ea/web3easyaccess'
import { getChain } from '@/w3ea/ChainsData'

const StyledText = styled(Text, {
  fontWeight: 400
} as any)

const StyledSpan = styled('span', {
  fontWeight: 400
} as any)

export default function SessionProposalModal() {
  const { smartAccountEnabled } = useSnapshot(SettingsStore.state)
  // Get proposal data and wallet address from store
  const data = useSnapshot(ModalStore.state)
  const proposal = data?.data?.proposal as SignClientTypes.EventArguments['session_proposal']
  const [isLoadingApprove, setIsLoadingApprove] = useState(false)
  const [isLoadingReject, setIsLoadingReject] = useState(false)
  const { getAvailableSmartAccountsOnNamespaceChains } = useSmartAccounts()

  const { query } = useRouter()

  const addressesToApprove = Number(query.addressesToApprove) || null

  const supportedNamespaces = useMemo(() => {
    // eip155
    const eip155Chains = Object.keys(EIP155_CHAINS)
    console.log('supportedNamespaces eip 155 raw1:', eip155Chains)
    const eipW3eaChains = [getChain().chainKey]
    console.log('supportedNamespaces eip 155 raw2:', eipW3eaChains)
    const eip155Methods = Object.values(EIP155_SIGNING_METHODS)

    //eip5792
    const eip5792Chains = Object.keys(EIP155_CHAINS)
    const eip5792Methods = Object.values(EIP5792_METHODS)

    //eip7715
    const eip7715Chains = Object.keys(EIP155_CHAINS)
    const eip7715Methods = Object.values(EIP7715_METHOD)

    // cosmos
    const cosmosChains = Object.keys(COSMOS_MAINNET_CHAINS)
    const cosmosMethods = Object.values(COSMOS_SIGNING_METHODS)

    // Kadena
    const kadenaChains = Object.keys(KADENA_CHAINS)
    const kadenaMethods = Object.values(KADENA_SIGNING_METHODS)

    // multiversx
    const multiversxChains = Object.keys(MULTIVERSX_CHAINS)
    const multiversxMethods = Object.values(MULTIVERSX_SIGNING_METHODS)

    // near
    const nearChains = Object.keys(NEAR_CHAINS)
    const nearMethods = Object.values(NEAR_SIGNING_METHODS)

    // polkadot
    const polkadotChains = Object.keys(POLKADOT_CHAINS)
    const polkadotMethods = Object.values(POLKADOT_SIGNING_METHODS)

    // solana
    const solanaChains = Object.keys(SOLANA_CHAINS)
    const solanaMethods = Object.values(SOLANA_SIGNING_METHODS)

    // tezos
    const tezosChains = Object.keys(TEZOS_CHAINS)
    const tezosMethods = Object.values(TEZOS_SIGNING_METHODS)

    // tron
    const tronChains = Object.keys(TRON_CHAINS)
    const tronMethods = Object.values(TRON_SIGNING_METHODS)

    const myAddresses = [getW3eaAddress()] // eip155Addresses.concat(getW3eaAddress())
    return {
      eip155: {
        chains: eipW3eaChains, // eip155Chains,
        methods: eip155Methods.concat(eip5792Methods).concat(eip7715Methods),
        events: ['accountsChanged', 'chainChanged'],
        accounts: eipW3eaChains // eip155Chains
          .map(
            chain =>
              myAddresses // eip155Addresses
                .map(account => `${chain}:${account}`)
                .slice(0, addressesToApprove ?? myAddresses.length) // eip155Addresses.length)
          )
          .flat()
      }
      // w3ea comments:
      //   cosmos: {
      //     chains: cosmosChains,
      //     methods: cosmosMethods,
      //     events: [],
      //     accounts: cosmosChains
      //       .map(chain => cosmosAddresses.map(address => `${chain}:${address}`))
      //       .flat()
      //   },
      //   kadena: {
      //     chains: kadenaChains,
      //     methods: kadenaMethods,
      //     events: [],
      //     accounts: kadenaChains
      //       .map(chain => kadenaAddresses.map(address => `${chain}:${address}`))
      //       .flat()
      //   },
      //   mvx: {
      //     chains: multiversxChains,
      //     methods: multiversxMethods,
      //     events: [],
      //     accounts: multiversxChains
      //       .map(chain => multiversxAddresses.map(address => `${chain}:${address}`))
      //       .flat()
      //   },
      //   near: {
      //     chains: nearChains,
      //     methods: nearMethods,
      //     events: ['accountsChanged', 'chainChanged'],
      //     accounts: nearChains
      //       .map(chain => nearAddresses.map(address => `${chain}:${address}`))
      //       .flat()
      //   },
      //   polkadot: {
      //     chains: polkadotChains,
      //     methods: polkadotMethods,
      //     events: [],
      //     accounts: polkadotChains
      //       .map(chain => polkadotAddresses.map(address => `${chain}:${address}`))
      //       .flat()
      //   },
      //   solana: {
      //     chains: solanaChains,
      //     methods: solanaMethods,
      //     events: [],
      //     accounts: solanaChains
      //       .map(chain => solanaAddresses.map(address => `${chain}:${address}`))
      //       .flat()
      //   },
      //   tezos: {
      //     chains: tezosChains,
      //     methods: tezosMethods,
      //     events: [],
      //     accounts: tezosChains
      //       .map(chain => tezosAddresses.map(address => `${chain}:${address}`))
      //       .flat()
      //   },
      //   tron: {
      //     chains: tronChains,
      //     methods: tronMethods,
      //     events: [],
      //     accounts: tronChains
      //       .map(chain => tronAddresses.map(address => `${chain}:${address}`))
      //       .flat()
      //   }
    }
  }, [])
  console.log('supportedNamespaces', supportedNamespaces, eip155Addresses)
  console.log('supportedNamespaces2', supportedNamespaces, getW3eaAddress())

  const requestedChains = useMemo(() => {
    if (!proposal) return []
    const required = []
    for (const [key, values] of Object.entries(proposal.params.requiredNamespaces)) {
      const chains = key.includes(':') ? key : values.chains
      required.push(chains)
    }

    const optional = []
    for (const [key, values] of Object.entries(proposal.params.optionalNamespaces)) {
      const chains = key.includes(':') ? key : values.chains
      optional.push(chains)
    }
    console.log('requestedChains', [...new Set([...required.flat(), ...optional.flat()])])

    return [...new Set([...required.flat(), ...optional.flat()])]
  }, [proposal])

  const noMatchedChainMsg = useRef('')
  // the chains that are supported by the wallet from the proposal
  const supportedChains = useMemo(
    () =>
      requestedChains
        .map(chain => {
          const chainData = getChainData(chain!)

          if (!chainData) return null

          console.log('xyz123:chainData:', chainData)
          if (getChain().chainId != Number(chainData.chainId)) {
            return null
          }

          return chainData
        })
        .filter(chain => chain), // removes null values
    [requestedChains]
  )

  if (supportedChains.length == 0) {
    noMatchedChainMsg.current = `your chain [${getChain().name}|${
      getChain().chainId
    }]  may be not supported by the dapp[1st=${requestedChains[0]}, count=${
      requestedChains.length
    }]`
    console.log('may be not supported by the dapp, it requestedChains:', requestedChains)
  }

  // get required chains that are not supported by the wallet
  const notSupportedChains = useMemo(() => {
    if (!proposal) return []
    const required = []
    for (const [key, values] of Object.entries(proposal.params.requiredNamespaces)) {
      const chains = key.includes(':') ? key : values.chains
      required.push(chains)
    }
    return required
      .flat()
      .filter(
        chain =>
          !supportedChains
            .map(supportedChain => `${supportedChain?.namespace}:${supportedChain?.chainId}`)
            .includes(chain!)
      )
  }, [proposal, supportedChains])
  console.log('notSupportedChains1', { notSupportedChains, supportedChains })
  const getAddress = useCallback((namespace?: string) => {
    if (!namespace) return 'N/A'
    switch (namespace) {
      case 'eip155':
        return getW3eaAddress() // eip155Addresses[0]
      case 'cosmos':
        return cosmosAddresses[0]
      case 'kadena':
        return kadenaAddresses[0]
      case 'mvx':
        return multiversxAddresses[0]
      case 'near':
        return nearAddresses[0]
      case 'polkadot':
        return polkadotAddresses[0]
      case 'solana':
        return solanaAddresses[0]
      case 'tezos':
        return tezosAddresses[0]
      case 'tron':
        return tronAddresses[0]
    }
  }, [])

  const namespaces = useMemo(() => {
    try {
      // the builder throws an exception if required namespaces are not supported
      return buildApprovedNamespaces({
        proposal: proposal.params,
        supportedNamespaces
      })
    } catch (e) {}
  }, [proposal.params, supportedNamespaces])

  const reorderedEip155Accounts = usePriorityAccounts({ namespaces })
  console.log('Reordered accounts', { reorderedEip155Accounts })

  // Hanlde approve action, construct session namespace
  const onApprove = useCallback(async () => {
    try {
      if (proposal && namespaces) {
        setIsLoadingApprove(true)
        if (reorderedEip155Accounts.length > 0) {
          // we should append the smart accounts to the available eip155 accounts
          namespaces.eip155.accounts = reorderedEip155Accounts.concat(namespaces.eip155.accounts)
        }
        //get capabilities for all reorderedEip155Accounts in wallet
        const capabilities = getWalletCapabilities(reorderedEip155Accounts)
        const sessionProperties = { capabilities: JSON.stringify(capabilities) }

        await web3wallet.approveSession({
          id: proposal.id,
          namespaces,
          sessionProperties
        })
        SettingsStore.setSessions(Object.values(web3wallet.getActiveSessions()))
      }
    } catch (e) {
      styledToast((e as Error).message, 'error')
    } finally {
      setIsLoadingApprove(false)
      ModalStore.close()
    }
  }, [namespaces, proposal, reorderedEip155Accounts])

  // Hanlde reject action
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const onReject = useCallback(async () => {
    if (proposal) {
      try {
        setIsLoadingReject(true)
        await new Promise(resolve => setTimeout(resolve, 1000))
        await web3wallet.rejectSession({
          id: proposal.id,
          reason: getSdkError('USER_REJECTED_METHODS')
        })
      } catch (e) {
        setIsLoadingReject(false)
        styledToast((e as Error).message, 'error')
        ModalStore.close()
        return
      }
    }
    setIsLoadingReject(false)
    ModalStore.close()
  }, [proposal])
  console.log('notSupportedChains2', notSupportedChains)
  return (
    <RequestModal
      metadata={proposal.params.proposer.metadata}
      onApprove={onApprove}
      onReject={onReject}
      approveLoader={{ active: isLoadingApprove }}
      rejectLoader={{ active: isLoadingReject }}
      infoBoxCondition={notSupportedChains.length > 0 || supportedChains.length === 0}
      disableApprove={notSupportedChains.length > 0 || supportedChains.length === 0}
      infoBoxText={`The session cannot be approved because the wallet does not the support some or all of the proposed chains. Please inspect the console for more information.`}
    >
      <Row>
        <Col>
          <StyledText h4>Requested permissions</StyledText>
        </Col>
      </Row>
      <Row>
        <Col>
          <DoneIcon style={{ verticalAlign: 'bottom' }} />{' '}
          <StyledSpan>View your balance and activity</StyledSpan>
        </Col>
      </Row>
      <Row>
        <Col>
          <DoneIcon style={{ verticalAlign: 'bottom' }} />{' '}
          <StyledSpan>Send approval requests</StyledSpan>
        </Col>
      </Row>
      <Row>
        <Col style={{ color: 'gray' }}>
          <CloseIcon style={{ verticalAlign: 'bottom' }} />
          <StyledSpan>Move funds without permission</StyledSpan>
        </Col>
      </Row>
      <Grid.Container style={{ marginBottom: '10px', marginTop: '10px' }} justify={'space-between'}>
        <Grid>
          <Row style={{ color: 'GrayText' }}>Accounts</Row>
          {(supportedChains.length > 0 &&
            supportedChains.map((chain, i) => {
              return (
                <Row key={i}>
                  <ChainAddressMini key={i} address={getAddress(chain?.namespace) || 'test'} />
                </Row>
              )
            })) || <Row>Non available:</Row>}

          {/* <Row style={{ color: 'GrayText' }}>Smart Accounts</Row>
          {smartAccountEnabled &&
            namespaces &&
            getAvailableSmartAccountsOnNamespaceChains(namespaces.eip155.chains).map(
              (account, i) => {
                if (!account) {
                  return <></>
                }
                return (
                  <Row key={i}>
                    <ChainSmartAddressMini account={account} />
                  </Row>
                )
              }
            )} */}
        </Grid>
        <Grid>
          <Row style={{ color: 'GrayText' }} justify="flex-end">
            Chains
          </Row>
          {(supportedChains.length > 0 &&
            supportedChains.map((chain, i) => {
              if (!chain) {
                return <></>
              }

              return (
                <Row key={i}>
                  <ChainDataMini key={i} chainId={`${chain?.namespace}:${chain?.chainId}`} />
                </Row>
              )
            })) || <Row>{noMatchedChainMsg.current}</Row>}
          {/* <Row style={{ color: 'GrayText' }} justify="flex-end">
            Chains
          </Row>
          {smartAccountEnabled &&
            namespaces &&
            getAvailableSmartAccountsOnNamespaceChains(namespaces.eip155.chains).map(
              ({ chain }, i) => {
                if (!chain) {
                  return <></>
                }
                return (
                  <Row key={i} style={{ marginTop: '24px' }}>
                    <ChainDataMini key={i} chainId={`eip155:${chain.id}`} />
                  </Row>
                )
              }
            )} */}
        </Grid>
      </Grid.Container>
    </RequestModal>
  )
}
