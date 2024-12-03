import React, { FC } from 'react'
import { ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client'

export const READ_ALL_RATES = gql`
  {
    rates(currency: "USD") {
      currency
      rate
    }
  }
`

export const client = new ApolloClient({
  uri: 'https://48p1r2roz4.sse.codesandbox.io',
  cache: new InMemoryCache(),
})

const Apollo: FC = ({ children, ...props }) => {
  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

export default Apollo
