import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    'connectors/dappPortalWallet': 'connectors/dappPortalWallet/index.ts',
  },
  treeshake: true,
  splitting: true,
  format: ['esm'],
  dts: true,
})
