import { Routes, Route, Navigate } from 'react-router'
import {
  LandingPage,
  LoginPage,
  RegisterPage,
  AdminLayout,
  DashboardPage,
  RestaurantSettingsPage,
  ProductsPage,
  CategoriesPage,
  PromotionsPage,
  ViewMenuPage,
  MenuPage,
  ProtectedRoute,
  AccessibilityProvider,
  AccessibilityToolbar,
} from '@repo/features'
import { I18nProvider } from '@repo/i18n'
import { Toaster } from '@repo/ui'

export default function App() {
  return (
    <AccessibilityProvider>
      <I18nProvider>
        <Toaster>
          {/* Accessibility toolbar is inside I18nProvider so it can use useTranslation */}
          <AccessibilityToolbar />

          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/menu/:slug" element={<MenuPage />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="promotions" element={<PromotionsPage />} />
              <Route path="visualizar" element={<ViewMenuPage />} />
              <Route path="settings" element={<RestaurantSettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Toaster>
      </I18nProvider>
    </AccessibilityProvider>
  )
}
