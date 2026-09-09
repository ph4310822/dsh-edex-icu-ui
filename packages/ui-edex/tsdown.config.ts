import { clientBundle } from '../tsdown.client.ts'

// eDEX shell: node half (no-op loader entry) + browser bundle, both from src.
export default clientBundle('@danielng23/dsh-icu-client-ui-edex', [], {
  lib: { entry: { index: 'src/index.ts' } },
})
