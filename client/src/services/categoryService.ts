import api from './api';

export const getCategories = () => api.get('/categories');
export const createCategory = (data: { name: string; description?: string }) => api.post('/categories', data);
export const updateCategory = (id: string, data: { name: string; description?: string }) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id: string) => api.delete(`/categories/${id}`);
