import { CartItem } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
}

export const Cart = ({ items, onUpdateQuantity, onRemoveItem, onCheckout }: CartProps) => {
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalDiscount = items.reduce((sum, item) => sum + item.discount_applied, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card className="h-full flex flex-col shadow-xl border-border">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <ShoppingBag className="h-5 w-5" />
          Shopping Cart
          {totalItems > 0 && (
            <Badge variant="secondary" className="ml-auto bg-primary text-primary-foreground">
              {totalItems} items
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingBag className="h-16 w-16 mx-auto mb-3 opacity-30" />
            <p>Your cart is empty</p>
            <p className="text-sm mt-1">Add items to get started</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-card border border-border rounded-lg p-3 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    ₹{item.effective_price.toFixed(2)} each
                  </p>
                  {item.discount_applied > 0 && (
                    <Badge variant="secondary" className="mt-1 bg-accent/10 text-accent border-accent/20">
                      Saved ₹{item.discount_applied.toFixed(2)}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveItem(item.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <p className="font-bold text-lg text-primary">
                  ₹{item.subtotal.toFixed(2)}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>

      {items.length > 0 && (
        <>
          <Separator />
          <CardFooter className="flex-col gap-3 p-4 bg-muted/20">
            <div className="w-full space-y-2">
              {totalDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Discount:</span>
                  <span className="font-semibold text-accent">
                    -₹{totalDiscount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold">
                <span className="text-foreground">Total:</span>
                <span className="text-primary text-2xl">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
            <Button
              onClick={onCheckout}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-lg"
              size="lg"
            >
              <Receipt className="h-5 w-5 mr-2" />
              Generate Bill
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
};
