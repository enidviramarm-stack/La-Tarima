import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Orders from './Pages/Orders'
import Reservations from './Pages/Reservations'
import Clients from './Pages/Clients'
import Products from './Pages/Products'
import Payments from './Pages/Payments'
import Staff from './Pages/Staff'
import Reports from './Pages/Reports'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to="/orders" replace />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/products" element={<Products />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
