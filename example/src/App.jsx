import React, {useState, useEffect} from 'react';
import {Products, Navbar, Cart} from './components';
import {commerce} from './lib/commerce';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});

  const fetchProducts = async () => {
    const {data} = await commerce.products.list();
    setProducts(data);
  }


  const fetchCart= async () => {
    setCart(await commerce.cart.retrieve());
  }

  const handleAddToCart = async ( productId, quantity) => {
      const item = await commerce.cart.add(productId, quantity);
      setCart(item.cart);
  }

  const handleUpdateCartQty = async ( productId, quantity) => {
    const item = await commerce.cart.update(productId, {quantity});
    setCart(item.cart);
}


const handleRemoveFromCart = async ( productId) => {
  const item = await commerce.cart.remove(productId);
  setCart(item.cart);
}

const handleEmptyCart = async ( ) => {
  const item = await commerce.cart.empty();
  setCart(item.cart);
}



  useEffect(() => {
    fetchProducts();
    fetchCart();
  },[]);




  return (
    <div>
     
      <Navbar totalItems={cart.total_items}/>
      <Routes>
      <Route  path='/' element={<Products products={products} onAddToCart={handleAddToCart}/>}/>
      <Route path='/cart' element={
      <Cart
       cart={cart}
        handleUpdateCartQty ={handleUpdateCartQty}
        handleRemoveFromCart ={handleRemoveFromCart}
        handleEmptyCart={handleEmptyCart}
      />}/>
      </Routes>
    </div>
  );
};

export default App
