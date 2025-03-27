// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';

// Auth Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import InitializePage from './pages/InitializePage';

// Dashboard Page
import DashboardPage from './pages/DashboardPage';

// Conversation Pages
import ConversationChatPage from './pages/conversations/ConversationChatPage';
import ConversationsListPage from './pages/conversations/ConversationsListPage';
import MyAssignmentsPage from './pages/conversations/MyAssignmentsPage';


// Contacts Pages
import

ContactFormPage
  from './pages/contacts/ContactFormPage';

import
ContactsListPage
  from './pages/contacts/ContactsListPage';

import
ImportContactsPage
  from './pages/contacts/ImportContactsPage';

// Chatbot Pages
import
ChatbotRulesPage
  from './pages/chatbot/ChatbotRulesPage';

import
ChatbotTestPage
  from './pages/chatbot/ChatbotTestPage';

// Templates Pages
import
TemplateFormPage

  from './pages/templates/TemplateFormPage';

import
TemplateTestPage
  from './pages/templates/TemplateTestPage';

import
TemplatesListPage
  from './pages/templates/TemplatesListPage';

// Campaigns Pages
import
CampaignAnalyticsPage
  from './pages/campaigns/CampaignAnalyticsPage';

import
CampaignFormPage
  from './pages/campaigns/CampaignFormPage';

import
CampaignsListPage
  from './pages/campaigns/CampaignsListPage';

// Error Pages
const UnauthorizedPage = () => (

  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
      <p className="text-gray-600 mb-6">You do not have permission to access this page.</p>
      <button
        onClick={() => window.history.back()}
        className="btn btn-primary"
      >
        Go Back
      </button>
    </div>
  </div>
);

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
      <p className="text-gray-600 mb-6">The page you are looking for does not exist.</p>
      <a href="/" className="btn btn-primary">Go Home</a>
    </div>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: 'white',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: 'white',
            },
          },
        }} />

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/initialize" element={<InitializePage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute roles={['SuperAdmin', 'Admin']} />}>
            <Route element={<MainLayout />}>
              {/* Dashboard */}
              <Route path="/" element={<DashboardPage />} />

              {/* Conversations */}
              <Route path="/conversations" element={<ConversationsListPage />} />
              <Route path="/conversations/assigned" element={<MyAssignmentsPage />} />
              <Route path="/conversations/chat/:contactNumber" element={<ConversationChatPage />} />

              {/* Contacts */}
              <Route path="/contacts" element={<ContactsListPage />} />
              <Route path="/contacts/new" element={<ContactFormPage />} />
              <Route path="/contacts/edit/:id" element={<ContactFormPage />} />
              <Route path="/contacts/import" element={<ImportContactsPage />} />

              {/* Chatbot */}
              <Route path="/chatbot" element={<ChatbotRulesPage />} />
              <Route path="/chatbot/test" element={<ChatbotTestPage />} />

              {/* Templates */}
              <Route path="/templates" element={<TemplatesListPage />} />
              <Route path="/templates/new" element={<TemplateFormPage />} />
              <Route path="/templates/edit/:id" element={<TemplateFormPage />} />
              <Route path="/templates/test/:sid" element={<TemplateTestPage />} />

              {/* Campaigns */}
              <Route path="/campaigns" element={<CampaignsListPage />} />
              <Route path="/campaigns/new" element={<CampaignFormPage />} />
              <Route path="/campaigns/:id" element={<CampaignAnalyticsPage />} />
              <Route path="/campaigns/:id/analytics" element={<CampaignAnalyticsPage />} />
            </Route>
          </Route>

          {/* SuperAdmin Only Routes */}
          <Route element={<ProtectedRoute roles={['SuperAdmin']} />}>
            <Route element={<MainLayout />}>
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/templates/approval" element={<TemplatesListPage />} />
            </Route>
          </Route>

          {/* Fallback Routes */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;