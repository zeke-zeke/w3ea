/**
 * @desc Refference list of eip155 chains
 * @url https://chainlist.org
 */

/**
 * Types
 */
export type TEIP155Chain = keyof typeof EIP155_CHAINS

export type EIP155Chain = {
    chainId: number
    name: string
    logo: string
    rgb: string
    rpc: string
    namespace: string
    smartAccountEnabled?: boolean
}

/**
 * Chains
 */
export const EIP155_MAINNET_CHAINS: Record<string, EIP155Chain> = {
    'eip155:1': {
        chainId: 1,
        name: 'Ethereum',
        logo: '/chain-logos/eip155-1.png',
        rgb: '99, 125, 234',
        rpc: 'https://cloudflare-eth.com/',
        namespace: 'eip155'
    },
    'eip155:43114': {
        chainId: 43114,
        name: 'Avalanche C-Chain',
        logo: '/chain-logos/eip155-43113.png',
        rgb: '232, 65, 66',
        rpc: 'https://api.avax.network/ext/bc/C/rpc',
        namespace: 'eip155'
    },
    'eip155:137': {
        chainId: 137,
        name: 'Polygon',
        logo: '/chain-logos/eip155-137.png',
        rgb: '130, 71, 229',
        rpc: 'https://polygon-rpc.com/',
        namespace: 'eip155'
    },
    'eip155:10': {
        chainId: 10,
        name: 'Optimism',
        logo: '/chain-logos/eip155-10.png',
        rgb: '235, 0, 25',
        rpc: 'https://mainnet.optimism.io',
        namespace: 'eip155'
    },
    'eip155:324': {
        chainId: 324,
        name: 'zkSync Era',
        logo: '/chain-logos/eip155-324.svg',
        rgb: '242, 242, 242',
        rpc: 'https://mainnet.era.zksync.io/',
        namespace: 'eip155'
    },
    'eip155:8453': {
        chainId: 8453,
        name: 'Base',
        logo: '/chain-logos/base.webp',
        rgb: '22, 83, 241',
        rpc: 'https://mainnet.base.org',
        namespace: 'eip155'
    },
    'eip155:42161': {
        chainId: 42161,
        name: 'Arbitrum',
        logo: '/chain-logos/arbitrum.webp',
        rgb: '27, 74, 220',
        rpc: 'https://arb1.arbitrum.io/rpc	',
        namespace: 'eip155'
    }
}

export const EIP155_TEST_CHAINS: Record<string, EIP155Chain> = {
    'eip155:5': {
        chainId: 5,
        name: 'Ethereum Goerli',
        logo: '/chain-logos/eip155-1.png',
        rgb: '99, 125, 234',
        rpc: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
        namespace: 'eip155',
        smartAccountEnabled: true
    },
    'eip155:11155111': {
        chainId: 11155111,
        name: 'Ethereum Sepolia',
        logo: '/chain-logos/eip155-11155111.png',
        rgb: '99, 125, 234',
        rpc: 'https://rpc2.sepolia.org',
        namespace: 'eip155',
        smartAccountEnabled: true
    },
    'eip155:43113': {
        chainId: 43113,
        name: 'Avalanche Fuji',
        logo: '/chain-logos/eip155-43113.png',
        rgb: '232, 65, 66',
        rpc: 'https://api.avax-test.network/ext/bc/C/rpc',
        namespace: 'eip155'
    },
    'eip155:80001': {
        chainId: 80001,
        name: 'Polygon Mumbai',
        logo: '/chain-logos/eip155-137.png',
        rgb: '130, 71, 229',
        rpc: 'https://matic-mumbai.chainstacklabs.com',
        namespace: 'eip155',
        smartAccountEnabled: true
    },
    'eip155:420': {
        chainId: 420,
        name: 'Optimism Goerli',
        logo: '/chain-logos/eip155-10.png',
        rgb: '235, 0, 25',
        rpc: 'https://goerli.optimism.io',
        namespace: 'eip155'
    },
    'eip155:11155420': {
        chainId: 11155420,
        name: 'Optimism Sepolia',
        logo: '/chain-logos/eip155-10.png',
        rgb: '235, 0, 25',
        rpc: 'https://sepolia.optimism.io	',
        namespace: 'eip155'
    },
    'eip155:280': {
        chainId: 280,
        name: 'zkSync Era Testnet',
        logo: '/chain-logos/eip155-324.svg',
        rgb: '242, 242, 242',
        rpc: 'https://testnet.era.zksync.dev/',
        namespace: 'eip155'
    },
    'eip155:84532': {
        chainId: 84532,
        name: 'Base Sepolia',
        logo: '/chain-logos/base.webp',
        rgb: '22, 83, 241',
        rpc: 'https://sepolia.base.org',
        namespace: 'eip155',
        smartAccountEnabled: true
    }
}


export const EIP155_W3EA_CHAINS: Record<string, EIP155Chain> = {
    'eip155:5000': {
        chainId: 5000,
        name: 'Mantle Mainnet',
        logo: '/chain-logos/eip155-5000.png',
        rgb: '99, 125, 234',
        rpc: 'https://rpc.mantle.xyz',
        namespace: 'eip155',
        smartAccountEnabled: true
    },
    'eip155:5003': {
        chainId: 5003,
        name: 'Mantle Sepolia Testnet',
        logo: '/chain-logos/eip155-5003.png',
        rgb: '99, 125, 234',
        rpc: 'https://rpc.sepolia.mantle.xyz',
        namespace: 'eip155',
        smartAccountEnabled: true
    },
    'eip155:2810': {
        chainId: 2810,
        name: 'Morph Holesky Testnet',
        logo: '/chain-logos/eip155-2810.png',
        rgb: '99, 125, 234',
        rpc: 'https://rpc-quicknode-holesky.morphl2.io',
        namespace: 'eip155',
        smartAccountEnabled: true
    },
    'eip155:56': {
        chainId: 56,
        name: 'BNB Smart Chain',
        logo: '/chain-logos/eip155-56.png',
        rgb: '99, 125, 234',
        rpc: 'https://rpc.ankr.com/bsc',
        namespace: 'eip155',
        smartAccountEnabled: true
    },
    'eip155:204': {
        chainId: 204,
        name: 'opBNB',
        logo: '/chain-logos/eip155-204.png',
        rgb: '99, 125, 234',
        rpc: 'https://opbnb-mainnet-rpc.bnbchain.org',
        namespace: 'eip155',
        smartAccountEnabled: true
    },
    'eip155:1320': {
        chainId: 1320,
        name: 'AIA Testnet',
        logo: '/chain-logos/eip155-1320.png',
        rgb: '99, 125, 234',
        rpc: 'https://aia-dataseed1-testnet.aiachain.org',
        namespace: 'eip155',
        smartAccountEnabled: true
    },
    'eip155:1319': {
        chainId: 1319,
        name: 'AIA Mainnet',
        logo: '/chain-logos/eip155-1319.png',
        rgb: '99, 125, 234',
        rpc: 'https://aia-dataseed2.aiachain.org',
        namespace: 'eip155',
        smartAccountEnabled: true
    },
    'eip155:12227332': {
        chainId: 12227332,
        name: 'NeoX testnet',
        logo: '/chain-logos/eip155-12227332.png',
        rgb: '99, 125, 234',
        rpc: 'https://neoxt4seed1.ngd.network',
        namespace: 'eip155',
        smartAccountEnabled: true
    },
    'eip155:59141': {
        chainId: 59141,
        name: 'Linea Sepolia',
        logo: '/chain-logos/eip155-59141.png',
        rgb: '99, 125, 234',
        rpc: 'https://rpc.sepolia.linea.build',
        namespace: 'eip155',
        smartAccountEnabled: true
    },
    'eip155:59144': {
        chainId: 59144,
        name: 'Linea',
        logo: '/chain-logos/eip155-59144.png',
        rgb: '99, 125, 234',
        rpc: 'https://rpc.linea.build',
        namespace: 'eip155',
        smartAccountEnabled: true
    },
    'eip155:534351': {
        chainId: 534351,
        name: 'Scroll Sepolia',
        logo: '/chain-logos/eip155-534351.png',
        rgb: '99, 125, 234',
        rpc: 'https://sepolia-rpc.scroll.io',
        namespace: 'eip155',
        smartAccountEnabled: true
    },
    'eip155:81457': {
        chainId: 81457,
        name: 'Blast Mainnet',
        logo: '/chain-logos/eip155-81457.png',
        rgb: '99, 125, 234',
        rpc: 'https://rpc.blast.io',
        namespace: 'eip155',
        smartAccountEnabled: true
    },
}

export const EIP155_CHAINS = {
    ...EIP155_MAINNET_CHAINS,
    ...EIP155_TEST_CHAINS,
    ...EIP155_W3EA_CHAINS
}

/**
 * Methods
 */
export const EIP155_SIGNING_METHODS = {
    PERSONAL_SIGN: 'personal_sign',
    ETH_SIGN: 'eth_sign',
    ETH_SIGN_TRANSACTION: 'eth_signTransaction',
    ETH_SIGN_TYPED_DATA: 'eth_signTypedData',
    ETH_SIGN_TYPED_DATA_V3: 'eth_signTypedData_v3',
    ETH_SIGN_TYPED_DATA_V4: 'eth_signTypedData_v4',
    ETH_SEND_RAW_TRANSACTION: 'eth_sendRawTransaction',
    ETH_SEND_TRANSACTION: 'eth_sendTransaction'
}
