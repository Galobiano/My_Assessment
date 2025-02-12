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
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage, setProductsPerPage] = useState(5);


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

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    const handleProductsPerPageChange = (e) => {
        setProductsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };
    



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
        setShowAddProductForm(true);  
    };

    const handleAddProductSubmit = async (event) => {
        event.preventDefault();
        try {
            if (newProduct.id) {
               
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
                
                    
                    if (searchTerm.trim()) {
                        return updatedList.filter((product) =>
                            product.title.toLowerCase().includes(searchTerm.toLowerCase())
                        );
                    }
                
                    return updatedList;
                });
                
            } 
            else {
                
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
            id: product.id, 
            title: product.title,
            price: product.price,
            description: product.description,
            images: product.images,
        });
    
        setShowAddProductForm(true); 
    };
    
    

    

    if (loading) return <div className="text-center">Loading.....</div>;
    if (error) return <div className="text-center text-red-500">Error: {error}</div>;

    return (
        <div className="p-5">
        {/* Add Product Button */}
        <div className="flex justify-end">
          <button
            onClick={handleAddProductClick}
            className="bg-blue-500 text-white py-1 px-2 rounded text-sm"
          >
            Add
          </button>
        </div>
      
        {/* Add Product Form (Pop-up) */}
        {showAddProductForm && (
          <div className="fixed inset-0 bg-black/35 bg-opacity-50 flex justify-center items-center z-50">
            <div className="relative bg-white p-6 rounded-lg max-w-lg w-full mx-4">
              <span
                onClick={() => setShowAddProductForm(false)}
                className="absolute top-2 right-4 text-xl font-bold cursor-pointer"
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
                  className="bg-green-500 text-white py-1 px-3 rounded-md shadow-md hover:bg-green-600 transition duration-300"
                >
                  {newProduct.id ? 'Update Product' : 'Add Product'}
                </button>
                </div>
              </form>
            </div>
          </div>
        )}
      
        {/* Product Table with Search Bar */}
        <div className="p-4 md:p-10 rounded-lg shadow-md bg-white max-w-full md:max-w-4xl mx-auto mt-6 border border-gray-200">
          {/* Search Bar Inside Product Table */}
          <div className="relative mb-4">
            <h1 className="text-[20px] text-center font-bold mb-4 bg-blue-600 w-full text-white p-2 md:p-[9px] rounded-[10px]">
              Product List
            </h1>
            <input
              type="text"
              placeholder="Search products"
              value={searchTerm}
              onChange={handleSearchChange}
              className="p-2 border border-gray-300 rounded-md w-full pr-10"
              disabled={showAddProductForm}
            />
            {searchTerm && (
              <span
                onClick={clearSearch}
                className="absolute top-2 right-2 md:top-[80px] md:right-[20px] md:-translate-y-1/2 text-[25px] text-gray-500 cursor-pointer"
              >
                &times;
              </span>
            )}
      
            {searchTerm && showDropdown && (
              <div className="absolute bg-white shadow-lg rounded-lg w-full mt-2 max-h-60 overflow-y-auto z-50">
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
      
          {/* Wrap the table in a scrollable container for mobile */}
          <div className="overflow-x-auto">
            <table className="w-full shadow-md bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3 text-left">Thumbnail</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Description</th>
                  <th className="p-3 text-left">Price</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>
      
              <tbody>
                {currentProducts.map((product) => (
                  <tr
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className="border border-gray-200 hover:bg-gray-100 cursor-pointer transition duration-300"
                  >
                    {/* Product Image */}
                    <td className="p-3">
                    <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-16 h-16 sm:w-24 sm:h-24 object-contain rounded-lg shadow-sm border"
                    />
                    </td>
                        
                    {/* Product Info Section */}
                    <td className="p-3 text-gray-800 font-semibold">
                      {product.title}
                    </td>
                    <td className="p-3 text-gray-600 text-sm">
                      {product.description}
                    </td>
                    <td className="p-3 text-blue-600 font-semibold">
                      ₱{product.price}
                      <div className="bg-blue-600 text-white text-xs rounded-xl px-2 py-1 mt-1 inline-block">
                        {Math.ceil(product.discountPercentage)}% Off
                      </div>
                    </td>
      
                    {/* Delete & Update Buttons */}
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
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
      
          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between p-3 mt-5">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-gray-600 cursor-pointer"
            >
              ❮
            </button>
      
            {/* Page Number Dropdown */}
            <select
              onChange={(e) => handlePageChange(Number(e.target.value))}
              value={currentPage}
              className="border rounded px-2 py-1 mx-2"
            >
              {Array.from({ length: totalPages }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </select>
      
            {/* Page Info */}
            <span className="text-gray-600 text-sm">
              of {totalPages} pages ({filteredProducts.length} items)
            </span>
      
            {/* Per Page Selection */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 text-sm">Per page</span>
              <select
                onChange={handleProductsPerPageChange}
                value={productsPerPage}
                className="border rounded px-2 py-1"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </select>
            </div>
      
            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-gray-600 cursor-pointer"
            >
              ❯
            </button>
          </div>
        </div>
      
        {/* Modal to show selected product images */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/35 flex justify-center items-center z-50">
            <div className="relative bg-white p-6 rounded-lg max-w-full sm:max-w-2xl w-full mx-4">
              {/* Close Button */}
              <span
                onClick={closeModal}
                className="absolute top-4 right-4 text-2xl font-bold cursor-pointer text-gray-600 hover:text-gray-800"
              >
                &times;
              </span>
      
              {/* Category & Product Name */}
              <p className="text-sm text-gray-500 uppercase tracking-wide">
                SMARTPHONES
              </p>
              <h2 className="text-2xl font-semibold mb-4">
                {selectedProduct.title}
              </h2>
      
              {/* Product Image & Carousel */}
              <div className="flex flex-col items-center">
                <div className="relative w-full flex justify-center">
                  <img
                    src={selectedProduct.images[currentImageIndex]}
                    alt={selectedProduct.title}
                    className="w-32 sm:w-48 h-auto object-cover"
                  />
      
                  {/* Navigation Arrows */}
                  <div
                    onClick={() => handleImageSlide("prev")}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-600 cursor-pointer text-2xl sm:text-3xl"
                  >
                    ❮
                  </div>
                  <div
                    onClick={() => handleImageSlide("next")}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-600 cursor-pointer text-2xl sm:text-3xl"
                  >
                    ❯
                  </div>
                </div>
      
                {/* Thumbnail Images */}
                <div className="flex space-x-2 mt-3">
                  {selectedProduct.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={selectedProduct.title}
                      className={`w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md cursor-pointer border ${
                        currentImageIndex === index
                          ? "border-blue-500"
                          : "border-gray-300"
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              </div>
      
              {/* Price & Discount */}
              <p className="text-xl text-blue-600 font-semibold mt-4">
                ₱ {selectedProduct.price}
              </p>
              <p>Discount:</p>
              <p className="bg-red-500 text-white text-xs font-medium rounded-xl px-2 py-1 mt-1 inline-block">
                {Math.ceil(selectedProduct.discountPercentage)}% Off
              </p>
      
              {/* Description */}
              <p>Description:</p>
              <p className="text-gray-700 mt-3">{selectedProduct.description}</p>
      
              {/* Product Details */}
              <div className="mt-4 text-gray-600 space-y-2">
                <p>
                  <strong>Brand:</strong> {selectedProduct.brand}
                </p>
                <p>
                  <strong>Category:</strong> {selectedProduct.category}
                </p>
                <p>
                  <strong>Stock:</strong> {selectedProduct.stock} units
                </p>
                <p>
                  <strong>Rating:</strong> {selectedProduct.rating} / 5
                </p>
              </div>
      
              {/* Close Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeModal}
                  className="text-blue-500 font-medium hover:underline"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
);


};

export default ProductTable;
