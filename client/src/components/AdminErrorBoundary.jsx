import React from 'react';

export default class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Admin Boundary Caught]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white p-8 rounded-lg border border-red-200 shadow-sm max-w-xl mx-auto my-12 text-center">
          <h3 className="text-lg font-bold text-red-700 mb-2">Admin View Unavailable</h3>
          <p className="text-xs text-gray-600 mb-6">
            A temporary component error occurred. Click below to refresh your view or return to the dashboard.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => this.setState({ hasError: false })}
              className="bg-gray-800 text-white text-xs font-semibold px-4 py-2 rounded"
            >
              Try Again
            </button>
            <a
              href="/admin"
              className="bg-sparq-maroon text-white text-xs font-semibold px-4 py-2 rounded"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
