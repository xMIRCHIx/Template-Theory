import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in application:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearCacheAndReload = () => {
    try {
      localStorage.removeItem('cinevo_admin_customizations_v1');
      localStorage.removeItem('cinevo_cached_products_v2');
      localStorage.removeItem('cinevo_cached_products');
      localStorage.removeItem('cinevo_social_settings_v1');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backgroundColor: '#FAF7F2',
            color: '#1a1815',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: '560px',
              width: '100%',
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '36px',
              boxShadow: '0 20px 40px -12px rgba(44, 24, 16, 0.12)',
              border: '1px solid rgba(44, 24, 16, 0.08)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#FBE9E7',
                color: '#D84315',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                margin: '0 auto 20px',
              }}
            >
              ⚠
            </div>
            <h1
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#2C1810',
                marginBottom: '10px',
                letterSpacing: '-0.02em',
              }}
            >
              Something went wrong loading Template Theory
            </h1>
            <p
              style={{
                fontSize: '14px',
                color: '#666',
                lineHeight: '1.6',
                marginBottom: '24px',
              }}
            >
              An unexpected render error occurred. You can reload the page or refresh your local store cache.
            </p>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginBottom: '20px',
              }}
            >
              <button
                onClick={this.handleReload}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#2C1810',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                Reload Page
              </button>
              <button
                onClick={this.handleClearCacheAndReload}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#F5EBE1',
                  color: '#5C3826',
                  border: '1px solid rgba(92, 56, 38, 0.2)',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                Clear Cache & Reload
              </button>
            </div>

            {this.state.error && (
              <details
                style={{
                  marginTop: '20px',
                  textAlign: 'left',
                  backgroundColor: '#F7F4EE',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#666',
                }}
              >
                <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#444' }}>
                  Technical Details ({this.state.error.name}: {this.state.error.message})
                </summary>
                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    marginTop: '8px',
                    fontSize: '11px',
                    color: '#c2410c',
                  }}
                >
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
