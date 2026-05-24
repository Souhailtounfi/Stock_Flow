import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5172/api',
});

api.interceptors.request.use((config) => {
  const authData = localStorage.getItem('auth_data');
  if (authData) {
    const { token } = JSON.parse(authData);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getDashboardStats = () => api.get('/dashboard/stats');

export const getCategories = (params) => api.get('/categories', { params });
export const getCategoryById = (id) => api.get(`/categories/${id}`);
export const createCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

export const getProducts = (params) => api.get('/products', { params });
export const getProductById = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const adjustStock = (id, quantity, reason) => api.post(`/products/${id}/stock`, { quantity, reason });

export const getSuppliers = (params) => api.get('/suppliers', { params });
export const getSupplierById = (id) => api.get(`/suppliers/${id}`);
export const createSupplier = (data) => api.post('/suppliers', data);
export const updateSupplier = (id, data) => api.put(`/suppliers/${id}`, data);
export const deleteSupplier = (id) => api.delete(`/suppliers/${id}`);

export const getCustomers = (params) => api.get('/customers', { params });
export const getCustomerById = (id) => api.get(`/customers/${id}`);
export const createCustomer = (data) => api.post('/customers', data);
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);

export const getInvoices = (params) => api.get('/invoices', { params });
export const getInvoiceById = (id) => api.get(`/invoices/${id}`);
export const createInvoice = (data) => api.post('/invoices', data);
export const updateInvoiceStatus = (id, status) => api.patch(`/invoices/${id}/status`, { status });
export const deleteInvoice = (id) => api.delete(`/invoices/${id}`);

export const getUsers = (params) => api.get('/users', { params });
export const getUserById = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post('/auth/register', data);
export const updateUser = (id, data) => api.put(`/users/${id}/role`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

export default api;
