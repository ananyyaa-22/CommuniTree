import React from 'react';
import { AppProvider } from './context';
import { Layout, AuthContainer, Router, ErrorBoundary, Loading } from './components';
import { useUser } from './hooks/useUser';
import { useNavigation } from './hooks/useNavigation';
import { User } from './types';

// Main app content component
const AppContent: React.FC = () => {
  const { user, isAuthenticated } = useUser();
  const { activeSection } = useNavigation();

  const handleAuthComplete = (authenticatedUser: User) => {
    // User is now authenticated and set in global state
    // The component will re-render and show the main app
    console.log('User authenticated:', authenticatedUser.name);
  };

  // Show authentication screen if user is not logged in
  if (!isAuthenticated || !user) {
    return (
      <ErrorBoundary>
        <AuthContainer onAuthComplete={handleAuthComplete} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Layout>
        <Router activeSection={activeSection} />
      </Layout>
    </ErrorBoundary>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;