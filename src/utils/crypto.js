// Password hashing using Web Crypto API (SHA-256)
// Uses email as salt to prevent rainbow table attacks

export async function hashPassword(email, password) {
  const salted = `uc30:${email.toLowerCase()}:${password}`;
  const encoded = new TextEncoder().encode(salted);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
