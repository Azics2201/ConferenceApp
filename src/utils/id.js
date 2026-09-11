// A small, dependency-free ID generator — good enough for a client-only
// prototype. For a real backend, replace with a server-issued ID (e.g. a
// database primary key or a proper UUID generated server-side).
export function generateId(prefix = 'id') {
  const random = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${prefix}_${time}${random}`;
}
