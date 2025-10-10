const API_URL = "";
import { fetchWithAuth } from './auth.js';

export async function fetchExhibitions() {
  try {
    const response = await fetch('/api/exhibitions');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const exhibitions = await response.json();
    return exhibitions;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function addExhibition(exhibition) {
  try {
    const response = await fetchWithAuth(`/api/exhibitions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(exhibition),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || 'Failed to add exhibition');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in addExhibition:', error);
    throw error;
  }
}


export async function updateExhibition(id, exhibition) {
  try {
    const response = await fetchWithAuth(`/api/exhibitions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(exhibition),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || 'Failed to update exhibition');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in updateExhibition:', error);
    throw error;
  }
}

export async function deleteExhibition(id) {
  try {
    const response = await fetchWithAuth(`/api/exhibitions/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || 'Failed to delete exhibition');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in deleteExhibition:', error);
    throw error;
  }
}

// Σύνδεσμοι
export async function fetchLinks() {
  try {
    const response = await fetch('/api/links');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function addLink(link) {
  const response = await fetchWithAuth(`/api/links`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(link),
  });
  return response.json();
}

export async function updateLink(id, link) {
  const response = await fetchWithAuth(`/api/links/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(link),
  });
  return response.json();
}

export async function deleteLink(id) {
  try {
    const response = await fetchWithAuth(`/api/links/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || 'Failed to delete link');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in deleteLink:', error);
    throw error;
  }
}


// --- New API helpers for Categories/Subcategories/Biography/Paintings ---
export async function fetchCategories() {
  const res = await fetch('/api/categories');
  if (!res.ok) throw new Error('Failed to fetch categories');
  return await res.json();
}

export async function seedDefaultCategories() {
  const res = await fetchWithAuth(`/api/categories/seed-defaults`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to seed defaults');
  return await res.json();
}

export async function fetchSubcategories(catId) {
  const res = await fetch(`/api/categories/${encodeURIComponent(catId)}/subcategories`);
  if (!res.ok) throw new Error('Failed to fetch subcategories');
  return await res.json();
}

export async function addSubcategory(catId, payload) {
  const res = await fetchWithAuth(`/api/categories/${encodeURIComponent(catId)}/subcategories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to add subcategory');
  return await res.json();
}

export async function updateSubcategory(subId, payload) {
  const res = await fetchWithAuth(`/api/categories/subcategories/${subId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update subcategory');
  return await res.json();
}

export async function deleteSubcategory(subId) {
  const res = await fetchWithAuth(`/api/categories/subcategories/${subId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete subcategory');
  return await res.json();
}

export async function getBiography(subId) {
  const res = await fetch(`/api/biography/${encodeURIComponent(subId)}`);
  if (!res.ok) throw new Error('Failed to fetch biography');
  return await res.json();
}

export async function saveBiography(subId, contentHtml) {
  const res = await fetchWithAuth(`/api/biography/${encodeURIComponent(subId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentHtml })
  });
  if (!res.ok) throw new Error('Failed to save biography');
  return await res.json();
}

export async function listPaintings(subId) {
  const res = await fetch(`/api/paintings/${encodeURIComponent(subId)}`);
  if (!res.ok) throw new Error('Failed to fetch paintings');
  return await res.json();
}

export async function uploadPaintings(subId, files, descriptions=[]) {
  const form = new FormData();
  for (let i=0;i<files.length;i++){ form.append('images', files[i]); form.append('descriptions', descriptions[i]||''); }
  const res = await fetchWithAuth(`/api/paintings/${encodeURIComponent(subId)}`, {
    method: 'POST',
    body: form
  });
  if (!res.ok) throw new Error('Failed to upload images');
  return await res.json();
}

export async function deletePainting(id) {
  const res = await fetchWithAuth(`/api/paintings/item/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete painting');
  return await res.json();
}


// --- Category CRUD (no seed) ---
export async function addCategory(payload) {
  const res = await fetchWithAuth(`/api/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to add category');
  return await res.json();
}

export async function updateCategory(id, payload) {
  const res = await fetchWithAuth(`/api/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update category');
  return await res.json();
}

export async function deleteCategory(id) {
  const res = await fetchWithAuth(`/api/categories/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete category');
  return await res.json();
}
