import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router'
import { AuthProvider } from './auth/AuthContext'
import { ToastProvider } from './components/Toast'
import { RequireAuth } from './auth/RequireAuth'
import { CommunityPage } from './pages/CommunityPage'
import { ComparePage } from './pages/ComparePage'
import { CompanyProfilePage } from './pages/CompanyProfilePage'
import { ContributePage } from './pages/ContributePage'
import { EmployerDashboardPage } from './pages/EmployerDashboardPage'
import { ExplorePage } from './pages/ExplorePage'
import { LoginPage } from './pages/LoginPage'
import { MyBenefitsPage } from './pages/MyBenefitsPage'
import { RetirementExplorerPage } from './pages/RetirementExplorerPage'
import { SignupPage } from './pages/SignupPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<ExplorePage />} />
            <Route path="/companies/:companyId" element={<CompanyProfilePage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route
              path="/my-benefits"
              element={
                <RequireAuth>
                  <MyBenefitsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/my-benefits/401k"
              element={
                <RequireAuth>
                  <RetirementExplorerPage />
                </RequireAuth>
              }
            />
            <Route path="/contribute" element={<ContributePage />} />
            <Route path="/employer" element={<EmployerDashboardPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
