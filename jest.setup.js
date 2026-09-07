// Jest setup — keep minimal. Unit tests here target pure logic (validation,
// pricing/formatting, cart math) so they run fast without a device/emulator.
// Integration tests that exercise Supabase RLS run against a live/local
// Supabase instance and are documented in README (not run in CI without env).
