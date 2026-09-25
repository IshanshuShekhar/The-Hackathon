import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { JourneyProvider } from './context/JourneyContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { GoalIntakePage } from './pages/journey/GoalIntakePage';
import { CandidateDetailsFormPage } from './pages/journey/CandidateDetailsFormPage';
import { ProfileChatPage } from './pages/journey/ProfileChatPage';
import { VideoIntroPage } from './pages/journey/VideoIntroPage';
import { DocumentsPage } from './pages/journey/DocumentsPage';
import { QualificationPage } from './pages/journey/QualificationPage';
import { CvPage } from './pages/journey/CvPage';
import { NextStepsPage } from './pages/journey/NextStepsPage';
import { RecommendationsDashboard } from './pages/journey/RecommendationsDashboard';
import { KnowledgeBaseAdminPage } from './pages/admin/KnowledgeBaseAdminPage';
import { CandidateDetailsPage } from './pages/CandidateDetailsPage';
import { GermanLearningPathPage } from './pages/GermanLearningPathPage';
import { CheckoutPage } from './pages/CheckoutPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <JourneyProvider>
          <Routes>
            {/* Homepage */}
            <Route path="/" element={<HomePage />} />

            {/* Authentication (PRD Section 8.2: dedicated sign up / login page) */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/login" element={<Navigate to="/auth?mode=login" replace />} />
            <Route path="/signup" element={<Navigate to="/auth?mode=signup" replace />} />

            {/* Step-by-Step Applicant Journey */}
            <Route
              path="/journey/goal"
              element={
                <ProtectedRoute>
                  <GoalIntakePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/journey/details"
              element={
                <ProtectedRoute>
                  <CandidateDetailsFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/journey/chat"
              element={
                <ProtectedRoute>
                  <ProfileChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/journey/video"
              element={
                <ProtectedRoute>
                  <VideoIntroPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/journey/documents"
              element={
                <ProtectedRoute>
                  <DocumentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/journey/qualification"
              element={
                <ProtectedRoute>
                  <QualificationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/journey/cv"
              element={
                <ProtectedRoute>
                  <CvPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/journey/next-steps"
              element={
                <ProtectedRoute>
                  <NextStepsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/journey/recommendations"
              element={
                <ProtectedRoute>
                  <RecommendationsDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/knowledge-base"
              element={
                <ProtectedRoute>
                  <KnowledgeBaseAdminPage />
                </ProtectedRoute>
              }
            />

            {/* Consolidated Candidate Details (PRD Section 11) */}
            <Route
              path="/candidate-details"
              element={
                <ProtectedRoute>
                  <CandidateDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/profile" element={<Navigate to="/candidate-details" replace />} />

            {/* German Learning Path (PRD Section 8.1 & Differentiator #10) */}
            <Route
              path="/learning-path"
              element={
                <ProtectedRoute>
                  <GermanLearningPathPage />
                </ProtectedRoute>
              }
            />

            {/* Educaro Premium Checkout (PRD Section 8.3) */}
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </JourneyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
