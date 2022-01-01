import React, { ErrorInfo } from 'react'

type ErrorBoundaryState = {
  hasError: boolean
}

class ErrorBoundary extends React.Component<{}, ErrorBoundaryState> {
  constructor(props: {}) {
    super(props)
    this.state = {
      hasError: false
    }
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    console.log("getDerivedStatefromErrorがよばれました。");
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(error)
    console.error(errorInfo)
  }

  render() {
    const { children } = this.props

    if (this.state.hasError) {
      return (
        <div>
          <h2>エラーが発生しました。</h2>
        </div>
      )
    }
    // Normally, just render children
    return children
  }
}

export default ErrorBoundary
