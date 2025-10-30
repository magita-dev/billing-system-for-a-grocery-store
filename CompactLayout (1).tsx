import { Search, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
impo

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CompactLayoutProps {
  products: Product[];
  cart: CartItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addToCart: (product: Product) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  subtotal: number;
  tax: number;
  total: number;
  handleCheckout: () => void;
}

export default function CompactLayout({
  products,
  cart,
  searchQuery,
  setSearchQuery,
  addToCart,
  updateQuantity,
  removeFromCart,
  subtotal,
  tax,
  total,
  handleCheckout,
}: CompactLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="space-y-6">
        {/* Products Section */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Products</h2>
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={addToCart} />
            ))}
          </div>
        </Card>

        {/* Cart Section */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Cart ({cart.length})</h2>
          </div>

          <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Your cart is empty</p>
              </div>
            ) : (
              cart.map((item) => (
                <CartItem
                  key={item.id}
                  {...item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))
            )}
          </div>

          <CheckoutPanel
            subtotal={subtotal}
            tax={tax}
            total={total}
            onCheckout={handleCheckout}
            itemCount={cart.length}
          />
        </Card>
      </div>
    </div>
  );
}
