-- Create a test user
INSERT INTO users (email, "passwordHash", name, role, status)
VALUES (
  'test@example.com',
  '$2a$10$6KlPc8JU8DNVYe1H9UUvYO5Z5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q', -- password: test123
  'Test User',
  'user',
  'active'
)
ON CONFLICT (email) DO NOTHING;

-- Create a test subscription for the user
INSERT INTO subscriptions ("userId", "planType", "startDate", "endDate", status, "paymentStatus", amount, "nextBillingDate", "currentUsage", "usageLimit", features, "billingHistory", "usageHistory")
SELECT 
  u.id,
  'monthly',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP + INTERVAL '30 days',
  'active',
  'paid',
  99.99,
  CURRENT_TIMESTAMP + INTERVAL '30 days',
  10.5,
  100,
  '{"maxDevices": 5, "supportLevel": "premium", "additionalServices": ["training", "support"]}'::jsonb,
  '[{"date": "2024-12-28", "amount": 99.99, "status": "paid"}]'::jsonb,
  '[{"date": "2024-12-28", "usage": 10.5, "type": "usage"}]'::jsonb
FROM users u
WHERE u.email = 'test@example.com'
ON CONFLICT DO NOTHING;
