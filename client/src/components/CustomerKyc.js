import * as React from "react";
import CustomerKycForm from "./CustomerKycForm";
import CompletedKyc from "./CompletedKyc";
import CustomerKycStatus from "./CustomerKycStatus";
import useTabs from "../customHooks/useTabs"; // Keeping for logic if needed, but UI is custom
import ViewDrafts from "./ViewDrafts";
import HodApprovalPending from "./HodApprovalPending";
import RevisionList from "./RevisionList";
import { UserContext } from "../contexts/UserContext";
import { useNavigation } from "../contexts/NavigationContext";
import BackButton from "./BackButton";

function CustomerKyc() {
  const { user } = React.useContext(UserContext);
  const { saveTabState, getTabState } = useNavigation();
  const [value, setValue] = React.useState(() => getTabState('/customer-kyc'));

  const handleTabChange = (newValue) => {
    setValue(newValue);
    saveTabState('/customer-kyc', newValue);
  };

  // Save scroll position when component unmounts
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      saveTabState('/customer-kyc', value);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveTabState('/customer-kyc', value);
    };
  }, [value, saveTabState]);

  const tabs = user.role === "Admin" ? [
    { label: "Dashboard", icon: "📊" },
    { label: "New Application", icon: "👤" },
    { label: "Draft Applications", icon: "📝" },
    { label: "Revisions Required", icon: "✍️" },
    { label: "Pending Approval", icon: "⏳" },
    { label: "Completed KYC", icon: "✅" }
  ] : [
    { label: "New Application", icon: "👤" },
    { label: "My Drafts", icon: "📝" },
    { label: "Revisions", icon: "✍️" },
    { label: "Completed KYC", icon: "✅" }
  ];

  const renderContent = () => {
    if (user.role === "Admin") {
      switch (value) {
        case 0: return <CustomerKycStatus />;
        case 1: return <CustomerKycForm />;
        case 2: return <ViewDrafts />;
        case 3: return <RevisionList />;
        case 4: return <HodApprovalPending />;
        case 5: return <CompletedKyc />;
        default: return <CustomerKycStatus />;
      }
    } else {
      switch (value) {
        case 0: return <CustomerKycForm />;
        case 1: return <ViewDrafts />;
        case 2: return <RevisionList />;
        case 3: return <CompletedKyc />;
        default: return <CustomerKycForm />;
      }
    }
  };

  return (
    <div className="app-layout">
      {/* Left Navigation Sidebar */}
      <aside className="side-nav">
        <div className="nav-header">
          <h2 className="brand-logo">OceanBreeze.</h2>
        </div>

        <nav className="nav-menu">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`nav-item ${value === index ? 'active' : ''}`}
              onClick={() => handleTabChange(index)}
            >
              <span className="nav-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-400), var(--primary-600))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 'bold', fontSize: '0.8rem'
            }}>
              {user.role?.[0] || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ margin: 0, color: 'white', fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.username || user.role}
              </p>
              <p style={{ margin: 0, color: 'var(--slate-500)', fontSize: '0.75rem' }}>
                {user.department || user.role}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Header Removed to avoid duplication with child components */}
        <div className="fade-in-up">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default React.memo(CustomerKyc);
