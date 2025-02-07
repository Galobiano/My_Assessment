// Import the axios instance with base URL and interceptors
import axios from './baseURL';  // Import the axios instance

// Fetch products from the API
export const getProduct = async () => {
    try {
        const response = await axios.get('products');  // No need for BASE_URL, it's already set
        console.log('List of Products:', response.data);
        return response.data;  // Return the product data
    } catch (error) {
        console.error('Error fetching product list:', error);
    }
};

// Search products based on the title
export const searchProduct = async (searchTerm) => {
    try {
        const response = await axios.get(`products/search?q=${searchTerm}`);
        console.log(response.data);
        return response.data;  // Return the matching products
    } catch (error) {
        console.error('Error searching for products:', error);
        throw new Error(error.message);  // Throw an error if the search fails
    }
};

// Add product to the API
export const addProduct = async (productData) => {
    try {
        const response = await axios.post('products/add', productData);
        console.log('Product added:', response.data);
        return response.data;  // Return the newly added product
    } catch (error) {
        console.error('Error adding product:', error);
        throw new Error(error.message);  // Throw an error if the add fails
    }
};

// Delete product from the API
export const deleteProduct = async (productId) => {
    try {
        const response = await axios.delete(`products/${productId}`);
        console.log('Product deleted:', response.data);
        return response.data;  // Return the deleted product response (if any)
    } catch (error) {
        console.error('Error deleting product:', error);
        throw new Error(error.message);  // Throw an error if the delete fails
    }
};

export const updateProduct = async (product) => {
    try {
        const response = await axios.patch(`products/${product.id}`, {
            title: product.title,
            price: product.price,  
            description: product.description,
        });
        console.log('Product updated:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error updating product:', error.response?.data || error.message);
        throw error;
    }
};