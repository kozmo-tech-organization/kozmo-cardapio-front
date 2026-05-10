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
  MenuPage,
  ProtectedRoute,
} from '@repo/features'

export default function App() {
  return (
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
        <Route path="settings" element={<RestaurantSettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
