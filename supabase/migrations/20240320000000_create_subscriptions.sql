-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan VARCHAR(20) NOT NULL DEFAULT 'free',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    mercadopago_subscription_id VARCHAR(255),
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_period_end TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 year'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
    ON subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
    ON subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

-- Create function to check subscription limits
CREATE OR REPLACE FUNCTION check_subscription_limits()
RETURNS TRIGGER AS $$
DECLARE
    current_plan VARCHAR(20);
    current_limits JSONB;
BEGIN
    -- Get current plan
    SELECT plan INTO current_plan
    FROM subscriptions
    WHERE user_id = NEW.user_id
    AND status = 'active'
    ORDER BY created_at DESC
    LIMIT 1;

    -- Set limits based on plan
    current_limits := CASE current_plan
        WHEN 'free' THEN '{"appointments": 10, "services": 3, "team_members": 1}'::JSONB
        WHEN 'premium' THEN '{"appointments": null, "services": 999999, "team_members": 999999}'::JSONB
        ELSE '{"appointments": 10, "services": 3, "team_members": 1}'::JSONB
    END;

    -- Check appointments limit
    IF current_plan = 'free' AND (
        SELECT COUNT(*) 
        FROM appointments 
        WHERE user_id = NEW.user_id 
        AND status IN ('pending', 'confirmed')
    ) >= current_limits->>'appointments' THEN
        RAISE EXCEPTION 'Límite de turnos alcanzado para el plan gratuito';
    END IF;

    -- Check services limit
    IF current_plan = 'free' AND (
        SELECT COUNT(*) 
        FROM services 
        WHERE user_id = NEW.user_id
    ) >= current_limits->>'services' THEN
        RAISE EXCEPTION 'Límite de servicios alcanzado para el plan gratuito';
    END IF;

    -- Check team members limit
    IF current_plan = 'free' AND (
        SELECT COUNT(*) 
        FROM team_members 
        WHERE user_id = NEW.user_id
    ) >= current_limits->>'team_members' THEN
        RAISE EXCEPTION 'Límite de miembros del equipo alcanzado para el plan gratuito';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for checking limits
CREATE TRIGGER check_appointment_limits
    BEFORE INSERT ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION check_subscription_limits();

CREATE TRIGGER check_service_limits
    BEFORE INSERT ON services
    FOR EACH ROW
    EXECUTE FUNCTION check_subscription_limits();

CREATE TRIGGER check_team_member_limits
    BEFORE INSERT ON team_members
    FOR EACH ROW
    EXECUTE FUNCTION check_subscription_limits(); 