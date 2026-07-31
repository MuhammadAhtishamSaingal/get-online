import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  sku: string;
  variantName?: string;
  variantColor?: string;
  quantity: number;
  maxStock: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string, variantName?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantName?: string) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getCartTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (newItem) => {
        const items = get().items;
        const qtyToAdd = newItem.quantity ?? 1;
        const existingIdx = items.findIndex(
          (item) =>
            item.productId === newItem.productId &&
            item.variantName === newItem.variantName
        );

        if (existingIdx !== -1) {
          const updatedItems = [...items];
          const newQty = updatedItems[existingIdx].quantity + qtyToAdd;
          updatedItems[existingIdx].quantity = Math.min(newQty, newItem.maxStock);
          set({ items: updatedItems });
        } else {
          set({
            items: [
              ...items,
              {
                ...newItem,
                quantity: Math.min(qtyToAdd, newItem.maxStock),
              } as CartItem,
            ],
          });
        }
      },

      removeItem: (productId, variantName) => {
        set({
          items: get().items.filter(
            (item) =>
              !(item.productId === productId && item.variantName === variantName)
          ),
        });
      },

      updateQuantity: (productId, quantity, variantName) => {
        const items = get().items;
        const existingIdx = items.findIndex(
          (item) =>
            item.productId === productId && item.variantName === variantName
        );

        if (existingIdx !== -1) {
          const updatedItems = [...items];
          const maxStock = updatedItems[existingIdx].maxStock;
          updatedItems[existingIdx].quantity = Math.min(
            Math.max(1, quantity),
            maxStock
          );
          set({ items: updatedItems });
        }
      },

      clearCart: () => set({ items: [] }),
      
      getCartCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      
      getCartTotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    {
      name: "gizmogrid-cart-store",
    }
  )
);
