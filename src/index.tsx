import { createTheme, ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import 'firebase/compat/analytics'
import 'firebase/compat/functions'
import firebase from 'firebase/compat/app'
import React from 'react'
import { createRoot } from 'react-dom/client'
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom'
import {
  DirtyDialog,
  ErrorBoundary,
} from './components'
import { firebaseConfig, firebaseEnv } from './firebaseConfig'
import {
  EditCharPage,
  HomePage,
  NewCharPage,
  ViewCharPage,
} from './pages'

declare module '@mui/material/styles' {
  interface TypographyVariants {
    caption2: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    caption2?: React.CSSProperties;
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    caption2: true;
  }
}

const theme = createTheme({
  typography: {
    caption: {
      fontSize: '0.5rem',
    },
    caption2: {
      fontSize: '0.75rem',
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          padding: '1px',
        },
        inputSizeSmall: {
          padding: '1px',
          paddingTop: '1px',
          paddingBottom: '1px',
        },
      }
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: 'white',
        },
      }
    },
  },
})

const getUserConfirmation = (message: string, callback: (answer: boolean)=> void) => {
  const modal = document.createElement('div')
  document.body.appendChild(modal)

  const root = createRoot(modal!)

  const withCleanup = (answer: boolean) => {
    root.unmount()
    document.body.removeChild(modal)
    callback(answer)
  }

  root.render(
    <DirtyDialog
      message={message}
      onCancel={() => withCleanup(false)}
      onConfirm={() => withCleanup(true)}
    />
  )
}

function App() {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <ErrorBoundary>
          <Router getUserConfirmation={getUserConfirmation}>
            <div>
              <Switch>
                <Route path="/char/:id">
                  <ViewCharPage />
                </Route>
                <Route path="/newchar">
                  <NewCharPage />
                </Route>
                <Route path="/editchar/:id">
                  <EditCharPage />
                </Route>
                <Route path="/">
                  <HomePage />
                </Route>
              </Switch>
            </div>
          </Router>
        </ErrorBoundary>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)
// Analytics is set up only in the prod project
if (firebaseEnv === 'prod') {
  firebase.analytics()
}
const useEmulator = window.location.hostname === 'localhost'
if (useEmulator) {
  firebase.firestore().useEmulator('localhost', 8081)
  firebase.app().functions('asia-northeast1').useEmulator('localhost', 5001)
}

// prevent back-forward cache in Safari
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    window.location.reload()
  }
})

const container = document.querySelector('#app')
const root = createRoot(container!)

root.render(<App />)
