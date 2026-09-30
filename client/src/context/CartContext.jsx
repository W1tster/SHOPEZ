import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'shopez_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const persistedCart = localStorage.getItem(CART_STORAGE_KEY);
      return persistedCart ? JSON.parse(persistedCart) : [];
    } catch {
      return [];
    }
  });

  // Sync cart mutations to local storage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage quota or privacy mode exception handling
    }
  }, [items]);

  const addToCart = useCallback((product, quantity = 1) => {
    const addQuantity = Math.max(1, Number(quantity) || 1);
    setItems((previousItems) => {
      const existingItemIndex = previousItems.findIndex((i) => i.productId === product._id);

      if (existingItemIndex > -1) {
        return previousItems.map((item, idx) =>
          idx === existingItemIndex
            ? { ...item, quantity: item.quantity + addQuantity }
            : item
        );
      }

      return [
        ...previousItems,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          discountPercent: Number(product.discountPercent) || 0,
          imageUrl: product.imageUrl,
          quantity: addQuantity,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    const targetQuantity = Number(quantity);
    if (targetQuantity < 1) return;

    setItems((previousItems) =>
      previousItems.map((item) =>
        item.productId === productId ? { ...item, quantity: targetQuantity } : item
      )
    );
  }, []);

  const removeFromCart = useCallback((productId) => {
    setItems((previousItems) => previousItems.filter((item) => item.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const subtotal = useMemo(() => {
    return items.reduce((accumulator, item) => {
      const discountPercentage = Number(item.discountPercent) || 0;
      const discountedUnitPrice = item.price - (item.price * discountPercentage) / 100;
      return accumulator + discountedUnitPrice * item.quantity;
    }, 0);
  }, [items]);

  const contextValue = useMemo(
    () => ({
      items,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      subtotal,
    }),
    [items, addToCart, updateQuantity, removeFromCart, clearCart, subtotal]
  );

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be consumed inside a CartProvider subtree');
  }
  return context;
}
