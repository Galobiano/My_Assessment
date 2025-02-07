import React, { useEffect, useState } from 'react';
import { getProduct, searchProduct, addProduct, deleteProduct,updateProduct } from '../services/apiService';

const ProductTable = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showAddProductForm, setShowAddProductForm] = useState(false);
    const [newProduct, setNewProduct] = useState({
        title: '',
        price: '',
        description: '',
        images: [],
    });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await getProduct();
                if (response) {
                    const data = response.products;
                    setProducts(data);
                    setFilteredProducts(data);
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleSearchChange = async (event) => {
        const search = event.target.value;
        setSearchTerm(search);

        if (search.trim()) {
            try {
                const response = await searchProduct(search);
                setFilteredProducts(response.products);
                setShowDropdown(true);
            } catch (error) {
                setError(error.message);
            }
        } else {
            setFilteredProducts(products);
            setShowDropdown(false);
        }
    };

    const handleProductClick = (product) => {
        setSelectedProduct(product);
        setShowDropdown(false);
    };

    const closeModal = () => {
        setSelectedProduct(null);
    };

    const handleImageSlide = (direction) => {
        const totalImages = selectedProduct.images.length;
        if (direction === 'next') {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % totalImages);
        } else if (direction === 'prev') {
            setCurrentImageIndex((prevIndex) => (prevIndex - 1 + totalImages) % totalImages);
        }
    };

    const clearSearch = () => {
        setSearchTerm('');
        setFilteredProducts(products);
        setShowDropdown(false);
    };

    const handleAddProductClick = () => {
        setNewProduct({ title: '', price: '', description: '', images: [] });
        setShowAddProductForm(true);  // Show the form
    };

    const handleAddProductSubmit = async (event) => {
        event.preventDefault();
        try {
            if (newProduct.id) {
                // Updating an existing product
                const updatedProduct = await updateProduct(newProduct);
                setProducts((prevProducts) =>
                    prevProducts.map((product) =>
                        product.id === updatedProduct.id ? updatedProduct : product
                    )
                );
                setFilteredProducts((prevProducts) => {
                    const updatedList = prevProducts.map((product) =>
                        product.id === updatedProduct.id ? updatedProduct : product
                    );
                
                    // If the search term is not empty, filter again to reflect updates
                    if (searchTerm.trim()) {
                        return updatedList.filter((product) =>
                            product.title.toLowerCase().includes(searchTerm.toLowerCase())
                        );
                    }
                
                    return updatedList;
                });
                
            } 
            else {
                // Adding a new product
                const addedProduct = await addProduct(newProduct);
                setProducts((prevProducts) => [addedProduct, ...prevProducts]);
                setFilteredProducts((prevProducts) => [addedProduct, ...prevProducts]);
            }
    
            setNewProduct({ id: '', title: '', price: '', description: '', images: [] });
            setShowAddProductForm(false);
        } catch (error) {
            setError(error.message);
        }
    };
    
    

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNewProduct((prevProduct) => ({
            ...prevProduct,
            [name]: value,
        }));
    };

    const handleImageUpload = (event) => {
        const files = event.target.files;
        const fileArray = Array.from(files).map((file) => URL.createObjectURL(file));
        setNewProduct((prevProduct) => ({
            ...prevProduct,
            images: fileArray,
        }));
    };

    const handleDeleteProduct = async (productId) => {
        try {
            console.log(`Attempting to delete product with ID: ${productId}`);
            
            await deleteProduct(productId);
    
            // Remove from state only if it was successful
            setProducts((prevProducts) => prevProducts.filter((product) => product.id !== productId));
            setFilteredProducts((prevProducts) => prevProducts.filter((product) => product.id !== productId));
    
            if (selectedProduct && selectedProduct.id === productId) {
                setSelectedProduct(null);
            }
        } catch (error) {
            console.error('Error deleting product:', error.message);
            setError(error.message);
        }
    };
    

    const handleUpdateProductClick = (product) => {
        setNewProduct({
            id: product.id, // Dapat may ID para ma-detect na update ito
            title: product.title,
            price: product.price,
            description: product.description,
            images: product.images,
        });
    
        setShowAddProductForm(true); // Ipakita ang update form
    };
    

    if (loading) return <div className="text-center">Loading.....</div>;
    if (error) return <div className="text-center text-red-500">Error: {error}</div>;

    return (
        <div className="p-5 bg-[]">
            <h1 className="text-3xl font-bold mb-4 ml-[35%]">Product List</h1>

            {/* Add Product Button */}
            <button
                onClick={handleAddProductClick}
                className="relative left-[20px] bg-blue-500 text-white py-2 px-4 rounded "
            >
                Add Product
            </button>

            {/* Add Product Form (Pop-up) */}
            {showAddProductForm && (
                <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="relative bg-white p-6 rounded-lg max-w-lg mx-auto">
                        <span
                            onClick={() => setShowAddProductForm(false)}
                            className="absolute top-2 right-2 text-xl font-bold cursor-pointer"
                        >
                            &times;
                        </span>
                        <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
                        <form onSubmit={handleAddProductSubmit}>
                            <input
                                type="text"
                                name="title"
                                placeholder="Product Title"
                                value={newProduct.title}
                                onChange={handleInputChange}
                                className="p-2 border border-gray-300 rounded-md mb-2 w-full"
                            />
                            <input
                                type="number"
                                name="price"
                                placeholder="Product Price"
                                value={newProduct.price}
                                onChange={handleInputChange}
                                className="p-2 border border-gray-300 rounded-md mb-2 w-full"
                            />
                            <textarea
                                name="description"
                                placeholder="Product Description"
                                value={newProduct.description}
                                onChange={handleInputChange}
                                className="p-2 border border-gray-300 rounded-md mb-2 w-full"
                            />
                            <input
                                type="file"
                                name="images"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="p-2 border border-gray-300 rounded-md mb-2 w-full"
                            />
                            <div className="flex justify-end mt-4">
    <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded shadow-md transition duration-300"
    >
        Add Product
    </button>
</div>
                        </form>
                    </div>
                </div>
            )}

            {/* Search Bar */}
            <div className="relative mb-4">
    <input
        type="text"
        placeholder="Search products"
        value={searchTerm}
        onChange={handleSearchChange}
        className="p-2 border border-gray-300 rounded-md ml-[16%] w-[50%] pr-10"  // Added pr-10 for padding to accommodate the icon
        disabled={showAddProductForm}  // Disable search when adding product
    />
    {searchTerm && (
        <span
            onClick={clearSearch}
            className="absolute top-4.5 right-148 transform -translate-y-1/2 text-[25px] text-gray-500 cursor-pointer"
        >
            &times;
        </span>
    )}
    {searchTerm && showDropdown && (
        <div className="absolute bg-white shadow-lg rounded-lg w-[50%] ml-[16%] mt-2 max-h-60 overflow-y-auto z-50">
            <ul>
                {filteredProducts.map((product) => (
                    <li
                        key={product.id}
                        onClick={() => handleProductClick(product)}
                        className="p-3 border-b hover:bg-gray-100 cursor-pointer transition duration-300"
                    >
                        {product.title}
                    </li>
                ))}
            </ul>
        </div>
    )}
</div>

{/* Product Table */}
<div className="border p-5 rounded-lg shadow-md bg-white max-w-4xl ml-60 mt-6">
    <table className="w-full border-collapse">
        <thead>
            <tr className="bg-gray-200">
                <th className="p-3 text-left">Image</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Summary</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Action</th>
            </tr>
        </thead>
        <tbody>
            {filteredProducts.map((product) => (
                <tr
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className="border-b hover:bg-gray-100 cursor-pointer transition duration-300"
                >
                    {/* Product Image */}
                    <td className="p-3">
                        <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-12 h-12 object-cover rounded-lg shadow-sm border"
                        />
                    </td>

                    {/* Product Info Section */}
                    <td className="p-3 text-gray-800 font-semibold">{product.title}</td>
                    <td className="p-3 text-gray-600 text-sm">{product.description}</td>
                    <td className="p-3 text-blue-600 font-semibold">${product.price}</td>
{/* Delete & Update Buttons */}
<td className="p-3">
    <div className="flex space-x-2">
        <button
            onClick={(e) => {
                e.stopPropagation();
                handleDeleteProduct(product.id);
            }}
            className="bg-red-500 text-white py-1 px-3 rounded-md shadow-md hover:bg-red-600 transition duration-300"
        >
            Delete
        </button>

        <button
            onClick={(e) => {
                e.stopPropagation();
                handleUpdateProductClick(product);
            }}
            className="bg-yellow-500 text-white py-1 px-3 rounded-md shadow-md hover:bg-yellow-600 transition duration-300"
        >
            Update
        </button>
    </div>
</td>

                                                      
                </tr>
            ))}
        </tbody>
    </table>
</div>

{/* Modal to show selected product images */}
{selectedProduct && (
    <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
        <div className="relative bg-white p-6 rounded-lg max-w-lg mx-auto">
            <span
                onClick={closeModal}
                className="absolute top-2 right-2 text-xl font-bold cursor-pointer"
            >
                &times;
            </span>
            <h2 className="text-xl font-semibold mb-4">{selectedProduct.title}</h2>
            <p className="text-lg text-gray-700 mb-4">{selectedProduct.price}</p>
            <p className="text-sm text-gray-500 mb-4">{selectedProduct.description}</p>
            <div className="relative">
                <img
                    src={selectedProduct.images[currentImageIndex]}
                    alt={selectedProduct.title}
                    className="w-full h-96 object-cover rounded-md"
                />
                <div
                    onClick={() => handleImageSlide('prev')}
                    className="absolute top-1/2 left-2 text-black cursor-pointer text-2xl"
                >
                    ❮
                </div>
                <div
                    onClick={() => handleImageSlide('next')}
                    className="absolute top-1/2 right-2 text-black cursor-pointer text-2xl"
                >
                    ❯
                </div>
            </div>
        </div>
    </div>
)}
            </div>
    );
};

export default ProductTable;
