import { Navigate, Route, Routes } from 'react-router'
import { MainLayout } from './layouts/MainLayout'
import { Button } from './components/Button'
import { AboutPage } from './pages/AboutPage'
import { BilKorkortPage } from './pages/BilKorkortPage'
import { BilPricesPage } from './pages/BilPricesPage'
import { ContactPage } from './pages/ContactPage'
import { HomePage } from './pages/HomePage'
import { McKorkortPage } from './pages/McKorkortPage'
import { McPricesPage } from './pages/McPricesPage'
import { PricesPackagesPage } from './pages/PricesPackagesPage'
import { TestLessonRequestPage } from './pages/TestLessonRequestPage'
import { McTrainingInquiryPage } from './pages/McTrainingInquiryPage'
import { McRiskettanBookingPage } from './pages/McRiskettanBookingPage'
import { McRisktvaanInquiryPage } from './pages/McRisktvaanInquiryPage'
import { RiskettanBilPage, RiskettanMcPage } from './pages/RiskettanPage'
import { RiskettanRegistrationPage } from './pages/RiskettanRegistrationPage'
import { RisktvaanBilPage, RisktvaanMcPage } from './pages/RisktvaanPage'
import { LoginPage, NoPermissionPage } from './pages/LoginPage'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { useAuth } from './auth/AuthContext'
import { AdminPage } from './pages/AdminPage'

function NotFoundPage() {
  return (
    <section className="information-page information-page-text-only">
      <div className="information-page-copy">
        <h1>Sidan hittades inte</h1>
        <p>Adressen verkar vara fel. Gå tillbaka till startsidan.</p>
        <Button to="/">Till startsidan</Button>
      </div>
    </section>
  )
}

function App() {
  const { user } = useAuth()
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/bil-korkort" element={<BilKorkortPage />} />
        <Route path="/forfragan-testlektion" element={<TestLessonRequestPage />} />
        <Route path="/mc-korkort" element={<McKorkortPage />} />
        <Route path="/forfragan-mc-utbildning" element={<McTrainingInquiryPage />} />
        <Route path="/bokning-riskettan-mc" element={<McRiskettanBookingPage />} />
        <Route path="/forfragan-risktvaan-mc" element={<McRisktvaanInquiryPage />} />
        <Route path="/bil-priser-och-paket" element={<BilPricesPage />} />
        <Route path="/mc-priser-och-paket" element={<McPricesPage />} />
        <Route path="/riskettan-bil" element={<RiskettanBilPage />} />
        <Route path="/anmalan-riskettan-bil" element={<RiskettanRegistrationPage />} />
        <Route path="/bokning-riskettan-bil" element={<RiskettanRegistrationPage />} />
        <Route path="/risktvaan-bil" element={<RisktvaanBilPage />} />
        <Route path="/riskettan-mc" element={<RiskettanMcPage />} />
        <Route path="/risktvaan-mc" element={<RisktvaanMcPage />} />
        <Route path="/riskettan" element={<RiskettanBilPage />} />
        <Route path="/risktvaan" element={<RisktvaanBilPage />} />
        <Route path="/priser-och-paket" element={<PricesPackagesPage />} />
        <Route path="/priser-och-korkortspaket" element={<PricesPackagesPage />} />
        <Route path="/om-oss" element={<AboutPage />} />
        <Route path="/kontakt" element={<ContactPage />} />
        <Route path="/login" element={user ? <Navigate to="/admin" replace /> : <LoginPage />} />
        <Route path="/logga-in" element={<Navigate to="/login" replace />} />
        <Route path="/ingen-behorighet" element={<NoPermissionPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </MainLayout>
  )
}

export default App
