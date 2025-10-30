import { CartItem } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { X, Printer, Download } from "lucide-react";

interface BillReceiptProps {
  items: CartItem[];
  billNumber: string;
  onClose: () => void;
}

export const BillReceipt = ({ items, billNumber, onClose }: BillReceiptProps) => {
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalDiscount = items.reduce((sum, item) => sum + item.discount_applied, 0);
  const subtotalBeforeDiscount = totalAmount + totalDiscount;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <CardHeader className="bg-primary text-primary-foreground print:bg-transparent print:text-foreground">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">Bill Receipt</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-primary-foreground hover:bg-primary-foreground/20 print:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-sm opacity-90">Bill #: {billNumber}</p>
          <p className="text-sm opacity-90">Date: {new Date().toLocaleString()}</p>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Items</h3>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between items-start py-2 border-b border-border">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} × ₹{item.effective_price.toFixed(2)}
                    </p>
                    {item.discount_applied > 0 && (
                      <p className="text-sm text-accent">
                        Discount: -₹{item.discount_applied.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <p className="font-semibold text-foreground">
                    ₹{item.subtotal.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between text-foreground">
              <span>Subtotal:</span>
              <span>₹{subtotalBeforeDiscount.toFixed(2)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-accent font-semibold">
                <span>Total Discount:</span>
                <span>-₹{totalDiscount.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-xl font-bold text-primary">
              <span>Grand Total:</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border">
            <p>Thank you for shopping with us!</p>
            <p className="mt-1">Grocery Shop Billing System</p>
          </div>
        </CardContent>

        <div className="p-4 bg-muted/30 flex gap-2 print:hidden">
          <Button
            onClick={handlePrint}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Receipt
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
};
