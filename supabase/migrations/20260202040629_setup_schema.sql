BEGIN;

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'creator', 'brand');
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'completed');
CREATE TYPE deliverable_status AS ENUM ('pending', 'approved', 'rejected');

-- Create profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role user_role NOT NULL DEFAULT 'creator',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create creators table
CREATE TABLE creators (
    id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
    portfolio_url TEXT,
    bio TEXT,
    status application_status DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create brands table
CREATE TABLE brands (
    id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
    company_name TEXT,
    website_url TEXT,
    status application_status DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create packages table
CREATE TABLE packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    video_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create campaigns table
CREATE TABLE campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    brief TEXT,
    status campaign_status DEFAULT 'draft' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create campaign_creators junction table
CREATE TABLE campaign_creators (
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
    creator_id UUID REFERENCES creators(id) ON DELETE CASCADE NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (campaign_id, creator_id)
);

-- Create deliverables table
CREATE TABLE deliverables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
    creator_id UUID REFERENCES creators(id) ON DELETE CASCADE NOT NULL,
    file_url TEXT,
    status deliverable_status DEFAULT 'pending' NOT NULL,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create payments table
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    stripe_payment_intent_id TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can read their own profile, admins can read all
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Creators: Creators can view/update own, brands can view approved, admins all
CREATE POLICY "Creators can view own record" ON creators FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Creators can update own record" ON creators FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Brands can view approved creators" ON creators FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'brand')
    AND status = 'approved'
);
CREATE POLICY "Admins can manage creators" ON creators FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Brands: Brands can view/update own, admins all
CREATE POLICY "Brands can view own record" ON brands FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Brands can update own record" ON brands FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage brands" ON brands FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Packages: Everyone can view
CREATE POLICY "Anyone can view packages" ON packages FOR SELECT USING (true);
CREATE POLICY "Admins can manage packages" ON packages FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Campaigns: Brands view own, assigned creators view, admins all
CREATE POLICY "Brands can view own campaigns" ON campaigns FOR SELECT USING (brand_id = auth.uid());
CREATE POLICY "Creators can view assigned campaigns" ON campaigns FOR SELECT USING (
    EXISTS (SELECT 1 FROM campaign_creators WHERE campaign_id = campaigns.id AND creator_id = auth.uid())
);
CREATE POLICY "Admins can manage campaigns" ON campaigns FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Campaign Creators: Brands view for own campaigns, creators view own, admins all
CREATE POLICY "Brands can view campaign assignments" ON campaign_creators FOR SELECT USING (
    EXISTS (SELECT 1 FROM campaigns WHERE id = campaign_id AND brand_id = auth.uid())
);
CREATE POLICY "Creators can view own assignments" ON campaign_creators FOR SELECT USING (creator_id = auth.uid());
CREATE POLICY "Admins can manage assignments" ON campaign_creators FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Deliverables: Brands view for own campaigns, creators view/manage own, admins all
CREATE POLICY "Brands can view deliverables" ON deliverables FOR SELECT USING (
    EXISTS (SELECT 1 FROM campaigns WHERE id = campaign_id AND brand_id = auth.uid())
);
CREATE POLICY "Creators can manage own deliverables" ON deliverables FOR ALL USING (creator_id = auth.uid());
CREATE POLICY "Admins can manage all deliverables" ON deliverables FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Payments: Brands view own, admins all
CREATE POLICY "Brands can view own payments" ON payments FOR SELECT USING (brand_id = auth.uid());
CREATE POLICY "Admins can manage payments" ON payments FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Seed initial packages
INSERT INTO packages (name, description, price, video_count) VALUES
('Starter', '3 UGC Videos, Vetted Creators, 7-Day Delivery', 499, 3),
('Growth', '10 UGC Videos, Dedicated Manager, Custom Briefs', 1299, 10),
('Scale', '25 UGC Videos, Priority Matching, Whitelisting Options', 2499, 25);

COMMIT;
