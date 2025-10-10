const API_URL = "";
import { fetchWithAuth } from './auth.js';

/* ===================== Exhibitions ===================== */
export async function fetchExhibitions(subcategoryId, page, limit) {
  try {
    const qs = new URLSearchParams();
    if (subcategoryId) qs.set('subcategory', subcategoryId);
    if (page !== undefined) qs.set('page', page);
    if (limit !== undefined) qs.set('limit', limit);
    const res = await fetch(`/api/exhibitions${qs.toString() ? `?${qs}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch exhibitions');
    const data = await res.json();
    return Array.isArray(data) ? { items: data, total: data.length, page: 0, pages: 1, hasMore: false } : data;
  } catch (e) {
    console.error('Error fetching exhibitions:', e);
    throw e;
  }
}

export async function addExhibition(payload) {
  const res = await fetchWithAuth('/api/exhibitions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentHtml })
  });
  if (!res.ok) throw new Error('Failed to add exhibition');
  return await res.json();
}

export async function updateExhibition(id, payload) {
  const res = await fetchWithAuth(`/api/exhibitions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentHtml })
  });
  if (!res.ok) throw new Error('Failed to update exhibition');
  return await res.json();
}

export async function deleteExhibition(id) {
  const res = await fetchWithAuth(`/api/exhibitions/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete exhibition');
  return await res.json();
}

/* ===================== Links ===================== */
export async function fetchLinks(subcategoryId, page, limit) {
  try {
    const qs = new URLSearchParams();
    if (subcategoryId) qs.set('subcategory', subcategoryId);
    if (page !== undefined) qs.set('page', page);
    if (limit !== undefined) qs.set('limit', limit);
    const res = await fetch(`/api/links${qs.toString() ? `?${qs}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch links');
    const data = await res.json();
    return Array.isArray(data) ? { items: data, total: data.length, page: 0, pages: 1, hasMore: false } : data;
  } catch (e) {
    console.error('Error fetching links:', e);
    throw e;
  }
}

export async function addLink(payload) {
  const res = await fetchWithAuth('/api/links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentHtml })
  });
  if (!res.ok) throw new Error('Failed to add link');
  return await res.json();
}

export async function updateLink(id, payload) {
  const res = await fetchWithAuth(`/api/links/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentHtml })
  });
  if (!res.ok) throw new Error('Failed to update link');
  return await res.json();
}

export async function deleteLink(id) {
  const res = await fetchWithAuth(`/api/links/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete link');
  return await res.json();
}

/* ===================== Categories ===================== */
export async function fetchCategories() {
  const res = await fetch('/api/categories');
  if (!res.ok) throw new Error('Failed to fetch categories');
  return await res.json();
}

export async function addCategory(payload) {
  const res = await fetchWithAuth('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentHtml })
  });
  if (!res.ok) throw new Error('Failed to add category');
  return await res.json();
}

export async function updateCategory(id, payload) {
  const res = await fetchWithAuth(`/api/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentHtml })
  });
  if (!res.ok) throw new Error('Failed to update category');
  return await res.json();
}

export async function deleteCategory(id) {
  const res = await fetchWithAuth(`/api/categories/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete category');
  return await res.json();
}

/* ===================== Subcategories ===================== */
export async function fetchSubcategories(categoryId) {
  if (!categoryId) return [];
  const res = await fetch(`/api/categories/${categoryId}/subcategories`);
  if (!res.ok) throw new Error('Failed to fetch subcategories');
  return await res.json();
}

export async function addSubcategory(categoryId, payload) {
  const res = await fetchWithAuth(`/api/categories/${categoryId}/subcategories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentHtml })
  });
  if (!res.ok) throw new Error('Failed to add subcategory');
  return await res.json();
}

export async function updateSubcategory(id, payload) {
  const res = await fetchWithAuth(`/api/categories/subcategories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentHtml })
  });
  if (!res.ok) throw new Error('Failed to update subcategory');
  return await res.json();
}

export async function deleteSubcategory(id) {
  const res = await fetchWithAuth(`/api/categories/subcategories/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete subcategory');
  return await res.json();
}

/* ===================== Biography ===================== */
export async function getBiography(subcategoryId) {
  const res = await fetch(`/api/biography/${subcategoryId}`);
  if (!res.ok) throw new Error('Failed to fetch biography');
  return await res.json();
}

export async function saveBiography(subcategoryId, contentHtml) {
  const res = await fetchWithAuth(`/api/biography/${subcategoryId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentHtml })
  });
  if (!res.ok) throw new Error('Failed to save biography');
  return await res.json();
}

/* ===================== Paintings ===================== */
export async function listPaintings(subcategoryId, page, limit) {
  const qs = new URLSearchParams();
  if (page !== undefined) qs.set('page', page);
  if (limit !== undefined) qs.set('limit', limit);
  const url = `/api/paintings/${subcategoryId}${qs.toString() ? `?${qs}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch paintings');
  const data = await res.json();
  return Array.isArray(data) ? { items: data, total: data.length, page: 0, pages: 1, hasMore: false } : data;
}

export async function uploadPaintings(subcategoryId, files) {
  const form = new FormData();
  for (const f of files) form.append('images', f);
  const res = await fetchWithAuth(`/api/paintings/upload/${subcategoryId}`, {
    method: 'POST',
    body: form
  });
  if (!res.ok) throw new Error('Failed to upload paintings');
  return await res.json();
}

export async function deletePainting(id) {
  const res = await fetchWithAuth(`/api/paintings/item/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete painting');
  return await res.json();
}
