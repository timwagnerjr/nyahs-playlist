import { createClient } from '@sanity/client'

import { apiVersion, dataset, projectId, useCdn, token } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
  token: token,
  perspective: 'published',
})
