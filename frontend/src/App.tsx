import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import UploadEmailPage from "./pages/UploadEmailPage";
import EmailsListPage from "./pages/EmailsListPage";
import EmailDetailPage from "./pages/EmailDetailPage";
import ThreatGraphPage from "./pages/ThreatGraphPage";
import ThreatIntelligencePage from "./pages/ThreatIntelligencePage";
import CampaignsPage from "./pages/CampaignsPage";
import CampaignDetailPage from "./pages/CampaignDetailPage";
import CasesListPage from "./pages/CasesListPage";
import CaseDetailPage from "./pages/CaseDetailPage";
import EvidenceVaultPage from "./pages/EvidenceVaultPage";
import ReportsPage from "./pages/ReportsPage";
import AlertsPage from "./pages/AlertsPage";
import CopilotPage from "./pages/CopilotPage";
import AuditLogPage from "./pages/AuditLogPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="investigate/upload" element={<UploadEmailPage />} />
            <Route path="investigate/emails" element={<EmailsListPage />} />
            <Route path="investigate/emails/:id" element={<EmailDetailPage />} />
            <Route path="investigate/threat-graph" element={<ThreatGraphPage />} />
            <Route path="threat-intelligence" element={<ThreatIntelligencePage />} />
            <Route path="campaigns" element={<CampaignsPage />} />
            <Route path="campaigns/:id" element={<CampaignDetailPage />} />
            <Route path="cases" element={<CasesListPage />} />
            <Route path="cases/:id" element={<CaseDetailPage />} />
            <Route path="evidence" element={<EvidenceVaultPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="copilot" element={<CopilotPage />} />
            <Route path="audit" element={<AuditLogPage />} />
            <Route path="admin/users" element={<AdminUsersPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
