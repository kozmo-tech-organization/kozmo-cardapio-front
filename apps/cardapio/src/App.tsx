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
  ViewMenuPage,
  MenuPage,
  ProtectedRoute,
} from '@repo/features'
import { I18nProvider } from '@repo/i18n'

export default function App() {
  return (
    <I18nProvider>
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
          <Route path="visualizar" element={<ViewMenuPage />} />
          <Route path="settings" element={<RestaurantSettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </I18nProvider>
  )
}
