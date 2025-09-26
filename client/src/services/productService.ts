import api from './api'; // Axios instance

// Fetch all products of the logged-in vendor
export const getVendorProducts = () => {
  return api.get('/products');
};

// Create a new product (FormData for file uploads)
export const createProduct = (formData: FormData) => {
  return api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Update a product by ID
export const updateProduct = (id: string, formData: FormData) => {
  return api.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Delete a product by ID
export const deleteProduct = (id: string) => {
  return api.delete(`/products/${id}`);
};

// Fetch a single product by ID
export const getProductById = (id: string) => {
  return api.get(`/products/${id}`);
};

// Fetch all active products (public route)
export const getAllProducts = () => {
  return api.get('/products/public/all'); // We'll need to create this route on the server
};