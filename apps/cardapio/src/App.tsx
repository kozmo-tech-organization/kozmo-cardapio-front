import { Routes, Route, Navigate } from 'react-router'
import {
  LoginPage,
  RegisterPage,
  AdminLayout,
  DashboardPage,
  RestaurantSettingsPage,
  ProductsPage,
  MenuPage,
  ProtectedRoute,
} from '@repo/features'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
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
        <Route path="settings" element={<RestaurantSettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
