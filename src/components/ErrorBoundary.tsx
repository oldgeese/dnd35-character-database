import React, { ErrorInfo } from 'react'

class ErrorBoundary extends React.Component<{}, {error: Error, errorInfo: ErrorInfo}> {
  constructor(props: {}) {
    super(props)
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error,
      errorInfo,
    })
    // You can also log error messages to an error reporting service here
  }

  render() {
    const { error, errorInfo } = this.state
    const { children } = this.props

    if (errorInfo) {
      // Error path
      return (
        <div>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {error && error.toString()}
            <br />
            {errorInfo.componentStack}
          </details>
        </div>
      )
    }
    // Normally, just render children
    return children
  }
}

export default ErrorBoundary
