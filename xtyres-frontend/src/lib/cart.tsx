import { ReactNode, createContext, useContext, useState } from 'react';
import { Product } from './products';
export interface CartItem {
  product: Product;
  quantity: number;
}
interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}
const CartContext = createContext<CartContextType | undefined>(undefined);
export function CartProvider({ children }: {children: ReactNode;}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const addToCart = (product: Product, quantity: number = 1) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.product.id === product.id
      );
      if (existingItem) {
        return currentItems.map((item) =>
        item.product.id === product.id ?
        {
          ...item,
          quantity: item.quantity + quantity
        } :
        item
        );
      }
      return [
      ...currentItems,
      {
        product,
        quantity
      }];

    });
  };
  const removeFromCart = (productId: number) => {
    setItems((currentItems) =>
    currentItems.filter((item) => item.product.id !== productId)
    );
  };
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((currentItems) =>
    currentItems.map((item) =>
    item.product.id === productId ?
    {
      ...item,
      quantity
    } :
    item
    )
    );
  };
  const clearCart = () => {
    setItems([]);
  };
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice
      }}>
      
      {children}
    </CartContext.Provider>);

}
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
