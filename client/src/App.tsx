import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Storefront
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Products } from './pages/Products'
import { ProductDetail } from './pages/ProductDetail'
import { Cart } from './pages/Cart'
import { Checkout } from './pages/Checkout'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Account } from './pages/Account'
import { Wishlist } from './pages/Wishlist'
import { OrderTracking } from './pages/OrderTracking'
import { About } from './pages/About'
import { NotFound } from './pages/NotFound'

// Admin
import { AdminLayout } from './components/admin/AdminLayout'
import { DashboardHome } from './pages/admin/DashboardHome'
import { ProductManager } from './pages/admin/ProductManager'
import { OrderManager } from './pages/admin/OrderManager'
import { CustomerManager } from './pages/admin/CustomerManager'
import { AdminSettings } from './pages/admin/AdminSettings'
import { CouponManager } from './pages/admin/CouponManager'

// Global Utils
import { ScrollToTop } from './components/ScrollToTop'
import { useThemeStore } from './store/themeStore'

function ThemeSync() {
  const theme = useThemeStore((s) => s.theme)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeSync />
      <ScrollToTop />

      <Routes>
        {/* PUBLIC STOREFRONT SCENE */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<Account />} />
          <Route path="/orders/:id" element={<OrderTracking />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* ADMIN SCENE (Premium Apple-like layout) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="orders" element={<OrderManager />} />
          <Route path="customers" element={<CustomerManager />} />
          <Route path="coupons" element={<CouponManager />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
