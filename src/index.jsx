import {
  createTheme,
  ThemeProvider,
} from '@material-ui/core/styles'
import 'firebase/analytics'
import firebase from 'firebase/app'
import React from 'react'
import ReactDOM from 'react-dom'
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

const theme = createTheme({
  typography: {
    caption: {
      fontSize: '0.5rem',
    },
    caption2: {
      fontSize: '0.75rem',
    },
  },
  overrides: {
    MuiOutlinedInput: {
      input: {
        padding: '1px',
      },
      inputMarginDense: {
        padding: '1px',
        paddingTop: '1px',
        paddingBottom: '1px',
      },
    },
    MuiInputBase: {
      root: {
        backgroundColor: 'white',
      },
    },
  },
})

const getUserConfirmation = (message, callback) => {
  const modal = document.createElement('div')
  document.body.appendChild(modal)

  const withCleanup = (answer) => {
    ReactDOM.unmountComponentAtNode(modal)
    document.body.removeChild(modal)
    callback(answer)
  }

  ReactDOM.render(
    <DirtyDialog
      message={message}
      onCancel={() => withCleanup(false)}
      onConfirm={() => withCleanup(true)}
    />,
    modal,
  )
}

function App() {
  return (
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
  )
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

ReactDOM.render(<App />, document.querySelector('#app'))
