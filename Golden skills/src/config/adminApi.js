/**
 * adminApi — Central fetch wrapper for all Admin Panel API calls.
 *
 * Kya karta hai:
 *  - `credentials: 'include'` automatically attach karta hai taake browser
 *    httpOnly cookie (adminToken) har request ke saath bheje.
 *  - Authorization: Bearer header NAHI lagataa — token ab cookie mein hai,
 *    localStorage mein nahi.
 *  - 401 response pe automatically /login par redirect karta hai.
 *
 * Usage:
 *   import { adminFetch } from '../../../config/adminApi'
 *
 *   // GET
 *   const data = await adminFetch(API_ENDPOINTS.AUTH.USERS)
 *
 *   // POST / PUT / DELETE
 *   const data = await adminFetch(url, {
 *     method: 'POST',
 *     body: JSON.stringify(payload),
 *   })
 *
 *   // File upload (FormData) — Content-Type mat dena, browser khud set karta hai
 *   const data = await adminFetch(url, { method: 'PUT', body: formData })
 */
export const adminFetch = async (url, options = {}) => {
  const { headers: extraHeaders, body, ...rest } = options;

  // Content-Type: agar body FormData hai to browser khud set karta hai (boundary ke saath)
  const isFormData = body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...extraHeaders,
  };

  const response = await fetch(url, {
    ...rest,
    headers,
    body,
    credentials: 'include', // httpOnly cookie automatically attach hogi
  });

  // 401 = cookie missing/expired/blacklisted — login page par bhejo
  if (response.status === 401) {
    window.location.href = '/login';
    return null;
  }

  return response;
};
