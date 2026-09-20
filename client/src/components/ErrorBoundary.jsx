import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Sparq ErrorBoundary Caught]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-sparq-cream flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-lg border border-sparq-gold shadow-md text-center">
            <h2 className="text-xl font-bold text-sparq-darkmaroon mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-600 mb-6">
              We encountered an unexpected issue while preparing your celebration catalogue.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-sparq-maroon text-sparq-cream text-xs font-bold px-4 py-2.5 rounded hover:bg-sparq-darkmaroon"
              >
                Refresh Page
              </button>
              <a
                href="/"
                className="bg-sparq-gold text-sparq-darkmaroon text-xs font-bold px-4 py-2.5 rounded hover:bg-sparq-lightgold"
              >
                Return Home
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
