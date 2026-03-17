import { useEffect, useState } from "react";
import axiosClient from "../../axios-client";

export default function ProductForm({ onSuccess, productToEdit }) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(null);

    // Initial State
    const [product, setProduct] = useState({
        id: null,
        name: '',
        description: '',
        category_id: '',
        image_file: null, // Stores the new file
        sizes: [{ size: 'Regular', price: '' }] // Default size
    });

    // Load data when "Edit" is clicked
    useEffect(() => {
        if (productToEdit) {
            setProduct({
                id: productToEdit.id,
                name: productToEdit.name,
                description: productToEdit.description || '',
                category_id: productToEdit.category_id || '',
                image_file: null, // Reset file input (we don't re-upload the old one)
                sizes: productToEdit.sizes && productToEdit.sizes.length > 0 
                       ? productToEdit.sizes 
                       : [{ size: 'Regular', price: '' }]
            });
        } else {
            // Reset form for "Add New"
            setProduct({
                id: null,
                name: '',
                description: '',
                category_id: '',
                image_file: null,
                sizes: [{ size: 'Regular', price: '' }]
            });
        }
    }, [productToEdit]);

    const handleImageChange = (e) => {
        setProduct({ ...product, image_file: e.target.files[0] });
    };

    // Helper to change size/price inputs
    const handleSizeChange = (index, field, value) => {
        const newSizes = [...product.sizes];
        newSizes[index][field] = value;
        setProduct({ ...product, sizes: newSizes });
    };

    const addSizeRow = () => {
        setProduct({ ...product, sizes: [...product.sizes, { size: '', price: '' }] });
    };

    const removeSizeRow = (index) => {
        const newSizes = product.sizes.filter((_, i) => i !== index);
        setProduct({ ...product, sizes: newSizes });
    };

    const onSubmit = (ev) => {
        ev.preventDefault();
        setLoading(true);
        setErrors(null);

        const formData = new FormData();
        formData.append('name', product.name);
        formData.append('description', product.description || '');
        formData.append('category_id', product.category_id || 1); // Replace 1 with dynamic category if needed

        // Append sizes array
        product.sizes.forEach((s, index) => {
            formData.append(`sizes[${index}][size]`, s.size);
            formData.append(`sizes[${index}][price]`, s.price);
        });

        // Append Image ONLY if a new one was selected
        if (product.image_file) {
            formData.append('image', product.image_file);
        }

        // === DECIDE: CREATE OR UPDATE ===
        if (product.id) {
            // --- EDIT MODE ---
            formData.append('_method', 'PUT'); // Trick Laravel to accept files on PUT
            
            axiosClient.post(`/admin/products/${product.id}`, formData) // use POST
                .then(() => {
                    setLoading(false);
                    onSuccess(); // Close modal & refresh list
                })
                .catch(err => {
                    setLoading(false);
                    if (err.response && err.response.status === 422) {
                        setErrors(err.response.data.errors);
                    } else {
                        console.error(err);
                        alert("Failed to update product.");
                    }
                });

        } else {
            // --- CREATE MODE ---
            // Do NOT add _method: PUT here
            
            axiosClient.post('/admin/products', formData)
                .then(() => {
                    setLoading(false);
                    onSuccess(); // Close modal & refresh list
                })
                .catch(err => {
                    setLoading(false);
                    console.error('Product creation error:', err.response);
                    if (err.response && err.response.status === 422) {
                        setErrors(err.response.data.errors);
                    } else if (err.response && err.response.data) {
                        // Show the actual server error message in the form's error box
                        const msg = err.response.data.message || err.response.data.detail || 'Unknown server error.';
                        const detail = err.response.data.detail || '';
                        setErrors({ 
                            server: [`Error ${err.response.status}: ${msg}`, detail ? `Detail: ${detail}` : ''].filter(Boolean)
                        });
                    } else {
                        setErrors({ server: ['Network error: Could not reach the server. Check your connection.'] });
                    }
                });
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            
            {/* Error Message Box */}
            {errors && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
                    {Object.keys(errors).map(key => (
                        <p key={key} className="mb-1">• {errors[key][0]}</p>
                    ))}
                </div>
            )}
            
            {/* Product Name */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                <input 
                    value={product.name} 
                    onChange={e => setProduct({...product, name: e.target.value})} 
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" 
                    placeholder="e.g. Cappuccino" 
                />
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea 
                    value={product.description} 
                    onChange={e => setProduct({...product, description: e.target.value})} 
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" 
                    placeholder="Short description..." 
                    rows="2"
                />
            </div>

            {/* Image Upload */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Product Image</label>
                <input 
                    type="file" 
                    onChange={handleImageChange} 
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" 
                />
            </div>

            {/* Sizes & Prices Section */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold text-gray-700">Sizes & Prices</label>
                    <button type="button" onClick={addSizeRow} className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded">
                        + Add Size
                    </button>
                </div>

                {product.sizes.map((size, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                        <input 
                            type="text" 
                            placeholder="Size (e.g. Regular)" 
                            value={size.size}
                            onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                            className="flex-1 border border-gray-300 p-2 rounded-lg text-sm"
                        />
                        <input 
                            type="number" 
                            placeholder="Price" 
                            value={size.price}
                            onChange={(e) => handleSizeChange(index, 'price', e.target.value)}
                            className="w-24 border border-gray-300 p-2 rounded-lg text-sm"
                        />
                        {product.sizes.length > 1 && (
                            <button 
                                type="button" 
                                onClick={() => removeSizeRow(index)}
                                className="text-red-500 hover:text-red-700 px-2"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Submit Button */}
            <button 
                disabled={loading} 
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-amber-200 transition-all active:scale-95 disabled:opacity-50"
            >
                {loading ? 'Saving Product...' : (product.id ? 'Update Product' : 'Create Product')}
            </button>
        </form>
    );
}