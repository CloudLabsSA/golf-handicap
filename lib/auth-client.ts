export async function getAuthToken(): Promise<string | null> {
  // In a client component, we can't access cookies directly
  // So we fetch from the /api/me endpoint to verify auth
  try {
    const response = await fetch('/api/me', { credentials: 'include' });
    return response.ok ? 'authenticated' : null;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
}

export async function getCurrentUserEmail(): Promise<string | null> {
  try {
    const response = await fetch('/api/me', { credentials: 'include' });
    if (!response.ok) return null;
    const { email } = await response.json();
    return email;
  } catch {
    return null;
  }
}
