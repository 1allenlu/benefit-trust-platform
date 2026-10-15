import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router'
import { CommunityPage } from './pages/CommunityPage'
import { ComparePage } from './pages/ComparePage'
import { CompanyProfilePage } from './pages/CompanyProfilePage'
import { EmployerDashboardPage } from './pages/EmployerDashboardPage'
import { ExplorePage } from './pages/ExplorePage'
import { MyBenefitsPage } from './pages/MyBenefitsPage'
import { RetirementExplorerPage } from './pages/RetirementExplorerPage'

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
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<ExplorePage />} />
        <Route path="/companies/:companyId" element={<CompanyProfilePage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/my-benefits" element={<MyBenefitsPage />} />
        <Route path="/my-benefits/401k" element={<RetirementExplorerPage />} />
        <Route path="/employer" element={<EmployerDashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
