-- Create items table for product catalog
CREATE TABLE IF NOT EXISTS public.items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    base_price DECIMAL(10,2) NOT NULL CHECK (base_price > 0),
    discount_percentage DECIMAL(5,2) DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table for bill records
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    effective_price DECIMAL(10,2) NOT NULL,
    discount_applied DECIMAL(10,2) DEFAULT 0,
    subtotal DECIMAL(10,2) NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bills table to group transactions
CREATE TABLE IF NOT EXISTS public.bills (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_number TEXT UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    total_discount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bill_items junction table
CREATE TABLE IF NOT EXISTS public.bill_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id uuid REFERENCES public.bills(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    effective_price DECIMAL(10,2) NOT NULL,
    discount_applied DECIMAL(10,2) DEFAULT 0,
    subtotal DECIMAL(10,2) NOT NULL
);

-- Enable RLS but make data public for POS system
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_items ENABLE ROW LEVEL SECURITY;

-- Public access policies (POS system accessible to all)
CREATE POLICY "Public can view items" ON public.items FOR SELECT USING (true);
CREATE POLICY "Public can insert items" ON public.items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update items" ON public.items FOR UPDATE USING (true);

CREATE POLICY "Public can view transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Public can insert transactions" ON public.transactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view bills" ON public.bills FOR SELECT USING (true);
CREATE POLICY "Public can insert bills" ON public.bills FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view bill_items" ON public.bill_items FOR SELECT USING (true);
CREATE POLICY "Public can insert bill_items" ON public.bill_items FOR INSERT WITH CHECK (true);

-- Insert sample grocery items
INSERT INTO public.items (name, category, base_price, discount_percentage) VALUES
-- Fruits
('Apple', 'Fruits', 2.50, 5), ('Banana', 'Fruits', 1.20, 0), ('Orange', 'Fruits', 3.00, 10), 
('Grapes', 'Fruits', 4.50, 0), ('Strawberry', 'Fruits', 5.00, 15), ('Mango', 'Fruits', 6.00, 0), 
('Pineapple', 'Fruits', 4.00, 5), ('Watermelon', 'Fruits', 7.50, 0), ('Kiwi', 'Fruits', 3.50, 10), 
('Pear', 'Fruits', 2.80, 0),
-- Vegetables
('Tomato', 'Vegetables', 2.00, 0), ('Potato', 'Vegetables', 1.50, 5), ('Onion', 'Vegetables', 1.80, 0), 
('Carrot', 'Vegetables', 2.20, 10), ('Broccoli', 'Vegetables', 3.50, 0), ('Spinach', 'Vegetables', 2.50, 5), 
('Lettuce', 'Vegetables', 2.00, 0), ('Cucumber', 'Vegetables', 1.70, 10), ('Bell Pepper', 'Vegetables', 3.00, 0), 
('Eggplant', 'Vegetables', 2.80, 5),
-- Dairy
('Milk', 'Dairy', 3.50, 0), ('Cheese', 'Dairy', 5.00, 10), ('Yogurt', 'Dairy', 2.50, 5), 
('Butter', 'Dairy', 4.00, 0), ('Eggs', 'Dairy', 4.50, 10),
-- Pantry Staples
('Bread', 'Pantry', 2.50, 0), ('Rice', 'Pantry', 3.00, 5), ('Pasta', 'Pantry', 2.20, 0), 
('Flour', 'Pantry', 2.80, 10), ('Sugar', 'Pantry', 2.00, 0), ('Salt', 'Pantry', 1.00, 0), 
('Oil', 'Pantry', 5.50, 5), ('Tea', 'Pantry', 4.00, 0), ('Coffee', 'Pantry', 6.00, 10), 
('Cereal', 'Pantry', 4.50, 0),
-- Meat/Protein
('Chicken', 'Meat', 8.00, 10), ('Beef', 'Meat', 12.00, 5), ('Fish', 'Meat', 10.00, 0), 
('Tofu', 'Meat', 3.50, 10), ('Lentils', 'Meat', 2.50, 0),
-- Snacks
('Chips', 'Snacks', 3.00, 5), ('Chocolate', 'Snacks', 4.00, 0), ('Cookies', 'Snacks', 3.50, 10), 
('Nuts', 'Snacks', 6.00, 0), ('Popcorn', 'Snacks', 2.50, 5),
-- Beverages
('Soda', 'Beverages', 2.00, 0), ('Juice', 'Beverages', 3.50, 10), ('Water Bottle', 'Beverages', 1.00, 0), 
('Beer', 'Beverages', 5.00, 5), ('Wine', 'Beverages', 8.00, 0),
-- Household
('Soap', 'Household', 2.50, 0), ('Detergent', 'Household', 4.00, 10), ('Toilet Paper', 'Household', 3.00, 0), 
('Shampoo', 'Household', 5.00, 5)
ON CONFLICT (name) DO NOTHING;