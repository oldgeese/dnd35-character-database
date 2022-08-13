import { createTheme, ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import 'firebase/analytics'
import firebase from 'firebase/app'
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

const firebaseConfig = {
  apiKey: 'AIzaSyA8NGwQmCq5TF16lQy4fSAyti8zpHIwXqI',
  authDomain: 'dnd35-character-database.firebaseapp.com',
  databaseURL: 'https://dnd35-character-database.firebaseio.com',
  projectId: 'dnd35-character-database',
  storageBucket: 'dnd35-character-database.appspot.com',
  messagingSenderId: '551444495572',
  appId: '1:551444495572:web:5ef6070eb157db6da50f41',
  measurementId: 'G-0M7NMCXK1Y',
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)
firebase.analytics()
const useEmulator = window.location.hostname === 'localhost'
if (useEmulator) {
  firebase.firestore().useEmulator('localhost', 8081)
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
