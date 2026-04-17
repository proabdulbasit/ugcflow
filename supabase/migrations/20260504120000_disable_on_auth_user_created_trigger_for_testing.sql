-- TESTING ONLY
-- If signup keeps failing with:
--   {"code":"unexpected_failure","message":"Database error saving new user"}
-- then some database hook (often on_auth_user_created) is throwing.
--
-- This migration DISABLES the trigger so Auth signups cannot be blocked by it.
-- Use only on a test project or temporarily while diagnosing.
--
-- To re-enable later:
--   ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

BEGIN;

ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

COMMIT;

