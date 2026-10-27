import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeGlobalFaultTolerance } from './utils/faultTolerance';
import { ErrorBoundary } from './components/Common/ErrorBoundary';

// Initialize Global Uncaught Exception & Promise Rejection Handlers (Requirement 3)
initializeGlobalFaultTolerance();

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary sectionName="প্রধান পোর্টাল" fallbackTitle="পোর্টাল লোড হতে বিঘ্ন ঘটেছে" showHomeButton={true}>
    <App />
  </ErrorBoundary>
);
