import React, { useState } from 'react';

interface Props {
    onSubmit: (formData: FormData) => void;
    categories: { _id: string; name: string }[];
    loading?: boolean;
}

const ProductForm: React.FC<Props> = ({ onSubmit, categories, loading = false }) => {
    const [formState, setFormState] = useState({
        name: '',
        description: '',
        price: '',
        stockQuantity: '',
        category: '',
    });
    const [images, setImages] = useState<File[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages(Array.from(e.target.files));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', formState.name);
        formData.append('description', formState.description);
        formData.append('price', formState.price);
        formData.append('stockQuantity', formState.stockQuantity);
        formData.append('category', formState.category);
        images.forEach(image => formData.append('images', image));

        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow mb-6">
            <input
                type="text"
                name="name"
                placeholder="Product Name"
                value={formState.name}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
            />
            <textarea
                name="description"
                placeholder="Description"
                value={formState.description}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
            ></textarea>
            <input
                type="number"
                name="price"
                placeholder="Price"
                value={formState.price}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
            />
            <input
                type="number"
                name="stockQuantity"
                placeholder="Stock Quantity"
                value={formState.stockQuantity}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
            />
            <select
                name="category"
                value={formState.category}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
            >
                <option value="">Select Category</option>
                {Array.isArray(categories) &&
                    categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                            {cat.name}
                        </option>
                    ))}

            </select>
            <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full"
            />
            <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
                {loading ? 'Creating...' : 'Create Product'}
            </button>
        </form>
    );
};

export default ProductForm;
