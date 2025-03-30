import { createClient } from '@sanity/client'

export const sanity = createClient({
  projectId: 'hh0bz47b', 
  dataset: 'production',
  apiVersion: '2024-03-29',
  useCdn: false,           
  token: process.env.SANITY_API_TOKEN,
})
