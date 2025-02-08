
import axios from './baseURL';  


export const getProduct = async () => {
    try {
        const response = await axios.get('products');  
        console.log('List of Products:', response.data);
        return response.data;  
    } catch (error) {
        console.error('Error fetching product list:', error);
    }
};


export const searchProduct = async (searchTerm) => {
    try {
        const response = await axios.get(`products/search?q=${searchTerm}`);
        console.log(response.data);
        return response.data;  
    } catch (error) {
        console.error('Error searching for products:', error);
        throw new Error(error.message);  
    }
};


export const addProduct = async (productData) => {
    try {
        const response = await axios.post('products/add', productData);
        console.log('Product added:', response.data);
        return response.data;  
    } catch (error) {
        console.error('Error adding product:', error);
        throw new Error(error.message);  
    }
};


export const deleteProduct = async (productId) => {
    try {
        const response = await axios.delete(`products/${productId}`);
        console.log('Product deleted:', response.data);
        return response.data;  
    } catch (error) {
        console.error('Error deleting product:', error);
        throw new Error(error.message);  
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