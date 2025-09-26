import { useEffect, useState } from 'react';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/categoryService';
import { toast } from 'react-toastify';

interface Category {
  _id: string;
  name: string;
  description?: string;
}

export default function AdminCategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load categories');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateCategory(editId, { name, description });
        toast.success('Category updated');
      } else {
        await createCategory({ name, description });
        toast.success('Category added');
      }
      setName('');
      setDescription('');
      setEditId(null);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleEdit = (cat: Category) => {
    setEditId(cat._id);
    setName(cat.name);
    setDescription(cat.description || '');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await deleteCategory(id);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Categories</h1>

      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editId ? 'Update' : 'Add'}
        </button>
      </form>

      <ul className="space-y-2">
        {categories.map((cat) => (
          <li key={cat._id} className="flex justify-between items-center border-b py-2">
            <div>
              <strong>{cat.name}</strong>
              {cat.description && <p className="text-sm text-gray-600">{cat.description}</p>}
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleEdit(cat)}
                className="bg-yellow-400 px-2 py-1 text-sm rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(cat._id)}
                className="bg-red-500 text-white px-2 py-1 text-sm rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
