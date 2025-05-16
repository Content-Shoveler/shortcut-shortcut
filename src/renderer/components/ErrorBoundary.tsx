import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component to catch and display runtime errors
 * This prevents white screens in production by showing error information
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details for debugging
    console.error('Uncaught error in component:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log to console even in production
    if (process.env.NODE_ENV === 'production') {
      console.error('Application error:', {
        error: error.toString(),
        componentStack: errorInfo.componentStack,
        stack: error.stack
      });
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          borderRadius: '5px',
          backgroundColor: '#2d2d2d',
          color: '#ffffff',
          fontFamily: 'sans-serif'
        }}>
          <h1 style={{ color: '#ff5555' }}>Something went wrong</h1>
          <details style={{ whiteSpace: 'pre-wrap', marginBottom: '20px' }}>
            <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
              <strong>Show error details</strong>
            </summary>
            <p style={{ color: '#ff8888' }}>{this.state.error?.toString()}</p>
            <p style={{ color: '#bbbbbb', fontSize: '0.9em' }}>
              Component Stack: {this.state.errorInfo?.componentStack}
            </p>
          </details>
          <div style={{ marginTop: '20px' }}>
            <button 
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#3a3a3a',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
