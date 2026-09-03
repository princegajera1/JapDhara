import React from 'react';
import Button from '../ui/Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[JapDhara ErrorBoundary]', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-light-bg text-light-text dark:bg-dark-bg dark:text-dark-text text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-spiritual-500/15 border border-spiritual-500/30 flex items-center justify-center text-4xl shadow-soft-md">
            🕉
          </div>
          <div className="space-y-2 max-w-sm">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-xs text-light-muted dark:text-dark-muted leading-relaxed">
              JapDhara encountered an unexpected error. Your saved Jaap counts and history remain completely safe.
            </p>
          </div>
          <Button variant="primary" size="md" onClick={this.handleReload}>
            Reload Application
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
