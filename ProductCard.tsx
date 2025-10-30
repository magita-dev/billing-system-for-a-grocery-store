import { Item } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Tag } from "lucide-react";

interface ProductCardProps {
  item: Item;
  onAddToCart: (item: Item) => void;
}

export const ProductCard = ({ item, onAddToCart }: ProductCardProps) => {
  const effectivePrice = item.base_price * (1 - item.discount_percentage / 100);
  const hasDiscount = item.discount_percentage > 0;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/50">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-foreground text-lg">{item.name}</h3>
            <p className="text-sm text-muted-foreground">{item.category}</p>
          </div>
          {hasDiscount && (
            <Badge variant="secondary" className="bg-accent text-accent-foreground flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {item.discount_percentage}% OFF
            </Badge>
          )}
        </div>
        
        <div className="space-y-1">
          {hasDiscount && (
            <p className="text-sm text-muted-foreground line-through">
              ₹{item.base_price.toFixed(2)}
            </p>
          )}
          <p className="text-2xl font-bold text-primary">
            ₹{effectivePrice.toFixed(2)}
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={() => onAddToCart(item)}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          size="sm"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};
