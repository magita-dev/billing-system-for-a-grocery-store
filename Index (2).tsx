import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Item, CartItem } from "@/types/database";
import { ProductCard } from "@/components/ProductCard";
import { Cart } from "@/components/Cart";
import { BillReceipt } from "@/components/BillReceipt";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Search, Store } from "lucide-react";

const Index = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentBillNumber, setCurrentBillNumber] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching items:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", ...Array.from(new Set(items.map((item) => item.category)))];

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (item: Item) => {
    const existingItem = cartItems.find((cartItem) => cartItem.id === item.id);
    
    if (existingItem) {
      handleUpdateQuantity(item.id, existingItem.quantity + 1);
    } else {
      const effectivePrice = item.base_price * (1 - item.discount_percentage / 100);
      const discountApplied = item.base_price * (item.discount_percentage / 100);
      
      const newCartItem: CartItem = {
        ...item,
        quantity: 1,
        effective_price: effectivePrice,
        discount_applied: discountApplied,
        subtotal: effectivePrice,
      };
      
      setCartItems([...cartItems, newCartItem]);
      toast.success(`${item.name} added to cart`);
    }
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    setCartItems((items) =>
      items.map((item) => {
        if (item.id === itemId) {
          const discountApplied = item.base_price * (item.discount_percentage / 100) * newQuantity;
          return {
            ...item,
            quantity: newQuantity,
            discount_applied: discountApplied,
            subtotal: item.effective_price * newQuantity,
          };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems((items) => items.filter((item) => item.id !== itemId));
    toast.success("Item removed from cart");
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    try {
      const billNumber = `BILL-${Date.now()}`;
      const totalAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
      const totalDiscount = cartItems.reduce((sum, item) => sum + item.discount_applied, 0);

      // Insert bill
      const { data: billData, error: billError } = await supabase
        .from("bills")
        .insert({
          bill_number: billNumber,
          total_amount: totalAmount,
          total_discount: totalDiscount,
        })
        .select()
        .single();

      if (billError) throw billError;

      // Insert bill items
      const billItemsData = cartItems.map((item) => ({
        bill_id: billData.id,
        item_name: item.name,
        quantity: item.quantity,
        effective_price: item.effective_price,
        discount_applied: item.discount_applied,
        subtotal: item.subtotal,
      }));

      const { error: itemsError } = await supabase
        .from("bill_items")
        .insert(billItemsData);

      if (itemsError) throw itemsError;

      // Also save to transactions table for legacy compatibility
      const transactionsData = cartItems.map((item) => ({
        item_name: item.name,
        quantity: item.quantity,
        effective_price: item.effective_price,
        discount_applied: item.discount_applied,
        subtotal: item.subtotal,
      }));

      await supabase.from("transactions").insert(transactionsData);

      setCurrentBillNumber(billNumber);
      setShowReceipt(true);
      toast.success("Bill generated successfully!");
    } catch (error) {
      console.error("Error generating bill:", error);
      toast.error("Failed to generate bill");
    }
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setCartItems([]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Store className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Grocery Shop</h1>
              <p className="text-sm opacity-90">Point of Sale System</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg border-border"
              />
            </div>

            {/* Category Tabs */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="w-full flex-wrap h-auto bg-muted">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Product Grid */}
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading products...</div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No products found
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Cart Section */}
          <div className="lg:sticky lg:top-24 h-fit">
            <Cart
              items={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && (
        <BillReceipt
          items={cartItems}
          billNumber={currentBillNumber}
          onClose={handleCloseReceipt}
        />
      )}
    </div>
  );
};

export default Index;
