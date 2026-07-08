import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { NavigationBar } from "@/components/NavigationBar";
import { Footer } from "@/components/Footer";

// Lazy load pages to split bundle size
const LandingPage = lazy(() => import("@/pages/LandingPage").then(m => ({ default: m.LandingPage })));
const CitizenPortalPage = lazy(() => import("@/pages/CitizenPortalPage").then(m => ({ default: m.CitizenPortalPage })));
const IssueSubmissionPage = lazy(() => import("@/pages/IssueSubmissionPage").then(m => ({ default: m.IssueSubmissionPage })));
const AIProcessingPage = lazy(() => import("@/pages/AIProcessingPage").then(m => ({ default: m.AIProcessingPage })));
const RecommendationDetailsPage = lazy(() => import("@/pages/RecommendationDetailsPage").then(m => ({ default: m.RecommendationDetailsPage })));
const MPDashboardPage = lazy(() => import("@/pages/MPDashboardPage").then(m => ({ default: m.MPDashboardPage })));
const ActionBriefPage = lazy(() => import("@/pages/ActionBriefPage").then(m => ({ default: m.ActionBriefPage })));

import { LanguageProvider } from "@/context/LanguageContext";

const LoadingFallback: React.FC = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-terracotta border-t-transparent" />
  </div>
);

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <div className="page-shell">
          <NavigationBar />
        
        <main className="flex-grow mx-auto w-full max-w-[1440px] px-6 md:px-10 lg:px-12 py-8">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/citizen-portal" element={<CitizenPortalPage />} />
              <Route path="/issue-submission" element={<IssueSubmissionPage />} />
              <Route path="/ai-processing" element={<AIProcessingPage />} />
              <Route path="/recommendation-details" element={<RecommendationDetailsPage />} />
              <Route path="/mp-dashboard" element={<MPDashboardPage />} />
              <Route path="/action-brief" element={<ActionBriefPage />} />
              
              {/* Fallback routing */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
        
        <Footer />
      </div>
      </BrowserRouter>
    </LanguageProvider>
  );
};

export default App;
