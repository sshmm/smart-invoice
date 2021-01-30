import 'focus-visible/dist/focus-visible';

import { ChakraProvider, ColorModeScript, CSSReset } from '@chakra-ui/react';
import { Global } from '@emotion/react';
import React from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';

import { ErrorBoundary } from './components/ErrorBoundary';
import { Web3ContextProvider } from './context/Web3Context';
import { CreateInvoice } from './pages/CreateInvoice';
import { FAQ } from './pages/FAQ';
import { Home } from './pages/Home';
import { Invoices } from './pages/Invoices';
import { LockedInvoice } from './pages/LockedInvoice';
import { ViewInvoice } from './pages/ViewInvoice';
import { Layout } from './shared/Layout';
import { globalStyles, theme } from './theme';

export const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <CSSReset />
      <Global styles={globalStyles} />
      <ErrorBoundary>
        <Web3ContextProvider>
          <Router>
            <Layout>
              <Switch>
                <Route exact path="/" component={Home} />
                <Route exact path="/faq" component={FAQ} />
                <Route exact path="/create-invoice" component={CreateInvoice} />
                <Route exact path="/invoices" component={Invoices} />
                <Route
                  exact
                  path="/invoice/:invoiceId"
                  component={ViewInvoice}
                />
                <Route
                  exact
                  path="/invoice/:invoiceId/locked"
                  component={LockedInvoice}
                />
                <Redirect to="/" />
              </Switch>
            </Layout>
          </Router>
        </Web3ContextProvider>
      </ErrorBoundary>
    </ChakraProvider>
  );
};
