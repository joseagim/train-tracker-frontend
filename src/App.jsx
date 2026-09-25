import { Navigate, Route, Routes } from 'react-router-dom'
import AdminRoute from './components/AdminRoute'
import ApiWakeGate from './components/ApiWakeGate'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import AuthProvider from './context/AuthProvider'
import LanguageProvider from './context/LanguageProvider'
import { useLanguage } from './context/language-context'
import LoginPage from './pages/LoginPage'
import MyTicketsPage from './pages/MyTicketsPage'
import PurchasePage from './pages/PurchasePage'
import SearchPage from './pages/SearchPage'
import ValidateQrPage from './pages/ValidateQrPage'

function Layout({ children }) {
  const { t } = useLanguage()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-700 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
      >
        {t('layout.skipToContent')}
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:py-10">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Layout>
          <ApiWakeGate>
            <Routes>
              {/* Públicas */}
              <Route path="/" element={<SearchPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Requieren sesión */}
              <Route element={<ProtectedRoute />}>
                <Route path="/purchase" element={<PurchasePage />} />
                <Route path="/my-tickets" element={<MyTicketsPage />} />
              </Route>

              {/* Solo admin */}
              <Route element={<AdminRoute />}>
                <Route path="/admin/validate-qr" element={<ValidateQrPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ApiWakeGate>
        </Layout>
      </AuthProvider>
    </LanguageProvider>
  )
}
