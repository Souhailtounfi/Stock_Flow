import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductFormPage from './pages/ProductFormPage';
import StockAdjustmentPage from './pages/StockAdjustmentPage';
import Categories from './pages/Categories';
import CategoryFormPage from './pages/CategoryFormPage';
import Suppliers from './pages/Suppliers';
import SupplierFormPage from './pages/SupplierFormPage';
import Customers from './pages/Customers';
import CustomerFormPage from './pages/CustomerFormPage';
import Invoices from './pages/Invoices';
import CreateInvoice from './pages/CreateInvoice';
import Users from './pages/Users';
import UserFormPage from './pages/UserFormPage';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/new" element={<ProductFormPage />} />
            <Route path="/products/:id/edit" element={<ProductFormPage />} />
            <Route path="/products/:id/stock" element={<StockAdjustmentPage />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/new" element={<CategoryFormPage />} />
            <Route path="/categories/:id/edit" element={<CategoryFormPage />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/suppliers/new" element={<SupplierFormPage />} />
            <Route path="/suppliers/:id/edit" element={<SupplierFormPage />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/new" element={<CustomerFormPage />} />
            <Route path="/customers/:id/edit" element={<CustomerFormPage />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoices/create" element={<CreateInvoice />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/new" element={<UserFormPage />} />
            <Route path="/users/:id/edit" element={<UserFormPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
