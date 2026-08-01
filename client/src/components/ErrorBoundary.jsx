import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught React Error Boundary Exception:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-canvas text-ink flex items-center justify-center p-6">
          <div className="bg-white p-10 rounded-3xl border border-warm-grey-light shadow-xl max-w-md w-full text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-print-red-light text-print-red border border-print-red/20 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-ink">Something went wrong</h1>
              <p className="text-xs text-warm-grey mt-2">
                An unexpected interface error occurred. You can reload the application or return to the shop.
              </p>
            </div>
            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-warm-grey-subtle border border-warm-grey-light text-[11px] font-mono text-print-red text-left overflow-x-auto">
                {this.state.error.message}
              </div>
            )}
            <div className="flex gap-3 justify-center pt-2">
              <Button onClick={this.handleReload} size="sm" icon={RefreshCw}>
                Reload Page
              </Button>
              <a href="/">
                <Button variant="outline" size="sm" icon={Home}>
                  Return Home
                </Button>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
