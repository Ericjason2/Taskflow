import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-wrapper">
          <div className="error-boundary-card">
            <div className="error-icon-box">
              <AlertTriangle size={36} color="var(--prio-critique)" />
            </div>
            <h1 className="error-title">Une erreur inattendue est survenue</h1>
            <p className="error-desc">
              L'affichage de ce composant a rencontré un problème. Vous pouvez actualiser la page ou revenir au tableau de bord.
            </p>
            {this.state.error?.message && (
              <pre className="error-details">
                {this.state.error.message}
              </pre>
            )}
            <div className="error-actions">
              <button className="btn btn-outline" onClick={this.handleReload}>
                <RefreshCw size={15} /> Actualiser la page
              </button>
              <button className="btn btn-primary" onClick={this.handleGoHome}>
                <Home size={15} /> Tableau de bord
              </button>
            </div>
          </div>

          <style>{`
            .error-boundary-wrapper {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 80vh;
              padding: 24px;
            }
            .error-boundary-card {
              max-width: 480px;
              width: 100%;
              background: var(--bg-surface);
              border: 1px solid var(--border);
              border-radius: var(--radius-xl);
              padding: 32px 24px;
              text-align: center;
              box-shadow: var(--shadow-lg);
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 16px;
            }
            .error-icon-box {
              width: 64px;
              height: 64px;
              border-radius: 50%;
              background: var(--prio-critique-bg);
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .error-title {
              font-size: 18px;
              font-weight: 700;
              color: var(--text-primary);
              margin: 0;
            }
            .error-desc {
              font-size: 13.5px;
              color: var(--text-secondary);
              margin: 0;
              line-height: 1.5;
            }
            .error-details {
              background: var(--bg-subtle);
              border: 1px solid var(--border);
              border-radius: var(--radius-sm);
              padding: 8px 12px;
              font-size: 11px;
              color: var(--prio-critique);
              max-width: 100%;
              overflow-x: auto;
              text-align: left;
            }
            .error-actions {
              display: flex;
              gap: 10px;
              margin-top: 8px;
              flex-wrap: wrap;
              justify-content: center;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}
