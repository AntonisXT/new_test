import { login, isLoggedIn, logout } from './auth.js';
import {
  fetchExhibitions, fetchLinks,
  addExhibition, updateExhibition, deleteExhibition,
  addLink, updateLink, deleteLink,
  fetchCategories, fetchSubcategories, addCategory, updateCategory, deleteCategory,
  addSubcategory, updateSubcategory, deleteSubcategory,
  getBiography, saveBiography,
  listPaintings, uploadPaintings, deletePainting
} from './fetchData.js';


// --- Quick modal to create a subcategory when none exists ---
function showQuickCreateSubModal(parentCatId, onCreated) {
  // Overlay
  const overlay = document.createElement('div');
  overlay.id = 'quickSubModal';
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.background = 'rgba(0,0,0,0.45)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '9999';

  const box = document.createElement('div');
  box.style.background = '#fff';
  box.style.borderRadius = '12px';
  box.style.width = 'min(520px, 92vw)';
  box.style.boxShadow = '0 10px 35px rgba(0,0,0,0.25)';
  box.style.padding = '20px';

  box.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
      <h3 style="margin:0;font-size:18px">Νέα υποκατηγορία</h3>
      <button id="qsClose" class="secondary" style="border:none;background:transparent;font-size:18px;cursor:pointer">✕</button>
    </div>
    <p style="margin:0 0 12px 0;color:#555">Δεν υπάρχουν υποκατηγορίες. Δημιούργησε μία για να συνεχίσεις.</p>
    <div style="display:flex;gap:10px">
      <input id="qsName" class="control" placeholder="Όνομα υποκατηγορίας" style="flex:1"/>
      <button id="qsCreate" class="button">Δημιουργία</button>
    </div>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  const input = box.querySelector('#qsName');
  const btnCreate = box.querySelector('#qsCreate');
  const btnClose = box.querySelector('#qsClose');
  input.focus();

  function destroy(){ overlay.remove(); }
  btnClose.addEventListener('click', destroy);
  overlay.addEventListener('click', (e)=>{ if(e.target===overlay) destroy(); });

  btnCreate.addEventListener('click', async ()=>{
    const name = (input.value||'').trim();
    if (!name) { input.focus(); return; }
    if (typeof isLoggedIn === 'function' && !isLoggedIn()) { alert('Απαιτείται σύνδεση για τη δημιουργία υποκατηγορίας.'); return; }
    try{
      const created = await addSubcategory(parentCatId, { name });
      destroy();
      if (typeof onCreated === 'function') onCreated(created);
      try { await loadAsideMenus(); } catch(_) {}
    }catch(err){
      alert('Αποτυχία δημιουργίας υποκατηγορίας.');
      console.error(err);
    }
  });
}



const API_URL = "";

document.addEventListener('DOMContentLoaded', () => {
  const loginFormContainer = document.getElementById('loginFormContainer');
  const loggedInContainer = document.getElementById('loggedInContainer');
  const managementMenu = document.getElementById('managementMenu');
  const manageCategoriesBtn = document.createElement('a');
  manageCategoriesBtn.href = '#';
  manageCategoriesBtn.id = 'manageCategories';
  manageCategoriesBtn.className = 'management-option';
  manageCategoriesBtn.innerHTML = '<div class="management-card"><h3>Κατηγορίες</h3></div>';

  const manageBiographyBtn = document.createElement('a');
  manageBiographyBtn.href = '#';
  manageBiographyBtn.id = 'manageBiography';
  manageBiographyBtn.className = 'management-option';
  manageBiographyBtn.innerHTML = '<div class="management-card"><h3>Βιογραφία</h3></div>';

  const managePaintingsBtn = document.createElement('a');
  managePaintingsBtn.href = '#';
  managePaintingsBtn.id = 'managePaintings';
  managePaintingsBtn.className = 'management-option';
  managePaintingsBtn.innerHTML = '<div class="management-card"><h3>Πίνακες</h3></div>';

  // Prepend new options before existing ones
  const optionsContainer = document.querySelector('.management-options-container');
  optionsContainer.prepend(document.getElementById('manageLinks'));
  optionsContainer.prepend(document.getElementById('manageExhibitions'));
  optionsContainer.prepend(managePaintingsBtn);
  optionsContainer.prepend(manageBiographyBtn);
  optionsContainer.prepend(manageCategoriesBtn);
    

  // Έλεγχος σύνδεσης χρήστη κατά τη φόρτωση
  if (isLoggedIn()) {
    loginFormContainer.classList.add('hidden');
    loggedInContainer.classList.remove('hidden');
    managementMenu.classList.add('visible');
  
      try { localStorage.setItem('activeSection','management'); } catch(_) {}
      const mgmtLink = document.querySelector('nav a[data-section="management"]');
      if (mgmtLink) mgmtLink.click();
} else {
    loginFormContainer.classList.remove('hidden');
    loggedInContainer.classList.add('hidden');
    managementMenu.classList.remove('visible');
  }

  // Διαχείριση υποβολής σύνδεσης
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const success = await login(username, password);
    if (success) {
      loginFormContainer.classList.add('hidden');
      loggedInContainer.classList.remove('hidden');
      managementMenu.classList.add('visible');
    }
  });

  // Διαχείριση αποσύνδεσης
  const logoutButton = document.getElementById('logoutButton');
  logoutButton.addEventListener('click', () => {
    logout();
    try { localStorage.setItem('activeSection','management'); } catch(_) {}
    const mgmtLink = document.querySelector('nav a[data-section="management"]');
    if (mgmtLink) mgmtLink.click();
    loginFormContainer.classList.remove('hidden');
    loggedInContainer.classList.add('hidden');
    managementMenu.classList.remove('visible');
  });

  // Πλοήγηση στο μενού
  const navLinks = document.querySelectorAll('nav a');
  const asideSections = document.querySelectorAll('aside > div');
  const mainContent = document.getElementById('content');

  navLinks.forEach(link => { link.addEventListener('click', event => { event.preventDefault(); const a = event.currentTarget; const section = a.dataset.section; navLinks.forEach(l=>l.classList.remove('active')); a.classList.add('active');
      try { localStorage.setItem('activeSection', section); } catch(_) {}

      // Εμφάνιση του σωστού περιεχομένου στο Aside
      asideSections.forEach(aside => aside.classList.add('hidden'));
      const asideToShow = document.getElementById(`aside-${section}`);
      if (asideToShow) asideToShow.classList.remove('hidden');

      // Ενημέρωση του Main
      switch (section) {
        case 'biography':
          mainContent.innerHTML = '<p>Επιλέξτε κατηγορία βιογραφίας απο το πλευρικό μενού.</p>';
          break;
        case 'paintings':
          mainContent.innerHTML = '<p>Επιλέξτε κατηγορία πίνακα από το πλευρικό μενού.</p>';
          break;
        case 'exhibitions':
          mainContent.innerHTML = '<p>Επιλέξτε κατηγορία εκθέσεων από το πλευρικό μενού.</p>';
          break;
        case 'links':
          mainContent.innerHTML = '<p>Επιλέξτε κατηγορία συνδέσμων από το πλευρικό μενού.</p>';
          break;
        case 'management':
          if (isLoggedIn()) {
            mainContent.innerHTML = '<p>Επιλέξτε ενέργεια από το μενού διαχείρισης.</p>';
          } else {
            mainContent.innerHTML = '<p>Παρακαλώ συνδεθείτε για πρόσβαση στη διαχείριση.</p>';
          }
          break;
        default:
          mainContent.innerHTML = '<p>Καλώς ήρθατε στην εφαρμογή.</p>';
      }
    });
  });

  // Διαχείριση κατηγοριών στο Aside
  const asideLinks = document.querySelectorAll('aside a');
  asideLinks.forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const category = event.target.dataset.category;
      const section = event.target.closest('div').id.replace('aside-', '');

      // Ενημέρωση περιεχομένου με βάση την κατηγορία
      if (section === 'biography') {
        mainContent.innerHTML = biographyContent[category] || '<p>Το περιεχόμενο δεν είναι διαθέσιμο.</p>';
      } else if (section === 'paintings') {
        let content = '';
        switch (category) {
          case 'portraits':
            content = `
              <div class="gallery">
                <img src="js/images/portrait_jeronimo.jpg" alt="Πορτρέτο 1">
                <img src="js/images/portrait_oldman.jpg" alt="Πορτρέτο 2">
                <img src="js/images/portrait_doctor.jpg" alt="Πορτρέτο 3">
                <img src="js/images/portrait_palladio.jpg" alt="Πορτρέτο 4">
                <img src="js/images/portrait_diego.jpg" alt="Πορτρέτο 5">
                <img src="js/images/portrait_female.jpg" alt="Πορτρέτο 6">
                <img src="js/images/portrait_alonso.jpg" alt="Πορτρέτο 7">
                <img src="js/images/portrait_pope.jpg" alt="Πορτρέτο 8">
                <img src="js/images/portrait_fray.jpg" alt="Πορτρέτο 9">
                <img src="js/images/portrait_cardinal.jpg" alt="Πορτρέτο 10">
              </div>`;
            break;
          case 'religious':
            content = `
              <div class="gallery">
                <img src="js/images/religious_stluke.jpg" alt="Θρησκευτικό 1">
                <img src="js/images/religious_baptism.jpg" alt="Θρησκευτικό 2">
                <img src="js/images/religious_dormition.jpg" alt="Θρησκευτικό 3">
                <img src="js/images/religious_mary.jpg" alt="Θρησκευτικό 4">
                <img src="js/images/religious_religion.jpg" alt="Θρησκευτικό 5">
                <img src="js/images/religious_cross.jpg" alt="Θρησκευτικό 6">
                <img src="js/images/religious_virgin.jpg" alt="Θρησκευτικό 7">
                <img src="js/images/religious_family.jpg" alt="Θρησκευτικό 8">
                <img src="js/images/religious_virginmary.jpg" alt="Θρησκευτικό 9">
                <img src="js/images/religious_john.jpg" alt="Θρησκευτικό 10">

              </div>`;
            break;
        }
        mainContent.innerHTML = content;
      }
    });
  });

  document.querySelectorAll('aside a[data-category]').forEach(link => {
    link.addEventListener('click', async (event) => {
      event.preventDefault();
      const category = event.target.dataset.category;
      const section = event.target.closest('div').id.replace('aside-', '');

      if (section === 'exhibitions') {
        await loadExhibitionsByCategory(category);
      } else if (section === 'links') {
        await loadLinksByCategory(category);
      }
    });
  });

  // Διαχείριση εκθέσεων
  const manageExhibitions = document.getElementById('manageExhibitions');
manageExhibitions.addEventListener('click', async (e) => { e.preventDefault(); await renderExhibitionsAdmin(); });
// Διαχείριση συνδέσμων
  const manageLinks = document.getElementById('manageLinks');
manageLinks.addEventListener('click', async (e) => { e.preventDefault(); await renderLinksAdmin(); });
  // --- Startup: load sidebars and select default section ---
  (async () => {
    try { await loadAsideMenus(); } catch (e) { console.error('Failed to load aside menus on startup', e); }
    let target = null;
    try { target = localStorage.getItem('activeSection'); } catch(_) {}
    if (!target) target = isLoggedIn() ? 'management' : 'biography';
    const defaultLink = document.querySelector(`nav a[data-section="${target}"]`);
    if (defaultLink) defaultLink.click();
  })();

});

// Τροποποίηση της loadExhibitions()
async function loadExhibitions() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/exhibitions', {
      headers: {
        'Authorization': token
      }
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const exhibitions = await response.json();
    const list = document.getElementById('exhibitionsList');
    list.innerHTML = exhibitions.map(ex => `
      <div class="item">
        <p>${ex.title} - ${ex.date} (${ex.location}) - ${ex.category}</p>
        <div class="manage-buttons">
          <button class="edit-button" onclick="editExhibition('${ex._id}', '${ex.title}', '${ex.date}', '${ex.location}', '${ex.category}')">
            Επεξεργασία
          </button>
          <button class="delete-button" onclick="deleteExhibition('${ex._id}')">
            Διαγραφή
          </button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading exhibitions:', error);
    document.getElementById('exhibitionsList').innerHTML = 
      '<p>Σφάλμα κατά τη φόρτωση των εκθέσεων. Παρακαλώ προσπαθήστε ξανά.</p>';
  }
}

async function loadLinks() {
  try {
    const response = await fetch('/api/links');
    const links = await response.json();
    const list = document.getElementById('linksList');
    list.innerHTML = links.map(link => `
      <div class="item">
        <p><a href="${link.url}" target="_blank">${link.description}</a> (${link.category})</p>
        <div class="manage-buttons">
          <button class="edit-button" onclick="editLink('${link._id}', '${link.url}', '${link.description}', '${link.category}')">
            Επεξεργασία
          </button>
          <button class="delete-button" onclick="deleteLink('${link._id}')">
            Διαγραφή
          </button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading links:', error);
    document.getElementById('linksList').innerHTML = 
      '<p>Σφάλμα κατά τη φόρτωση των συνδέσμων. Παρακαλώ προσπαθήστε ξανά.</p>';
  }
}

window.editExhibition = function(id, title, date, location, category) {
  document.getElementById('exhibitionId').value = id;
  document.getElementById('title').value = title;
  document.getElementById('date').value = date;
  document.getElementById('location').value = location;
  document.getElementById('category').value = category;
};

window.editLink = function(id, url, description, category) {
  document.getElementById('linkId').value = id;
  document.getElementById('url').value = url;
  document.getElementById('description').value = description;
  document.getElementById('category').value = category;
};

window.deleteExhibition = async function(id) {
  if (confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την έκθεση;')) {
    try {
      await deleteExhibition(id);
      loadExhibitions();
      alert('Η έκθεση διαγράφηκε επιτυχώς!');
    } catch (error) {
      alert('Σφάλμα κατά τη διαγραφή της έκθεσης. Παρακαλώ προσπαθήστε ξανά.');
    }
  }
};

window.deleteLink = async function(id) {
  if (confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το σύνδεσμο;')) {
    try {
      await deleteLink(id);
      await loadLinks();
      alert('Ο σύνδεσμος διαγράφηκε επιτυχώς!');
    } catch (error) {
      console.error('Error:', error);
      alert('Σφάλμα κατά τη διαγραφή του συνδέσμου. Παρακαλώ προσπαθήστε ξανά.');
    }
  }
};

async function loadExhibitionsByCategory(category) {
  try {
    const response = await fetch('/api/exhibitions');
    const exhibitions = await response.json();
    const filteredExhibitions = exhibitions.filter(ex => ex.category === category);
    
    const mainContent = document.getElementById('content');
    mainContent.innerHTML = `
      <h2>${category}</h2>
      <div id="exhibitionsList">
        ${filteredExhibitions.map(ex => `
          <div class="exhibition-item">
            <h3>${ex.title}</h3>
            <p>Ημερομηνία: ${ex.date}</p>
            <p>Τοποθεσία: ${ex.location}</p>
          </div>
        `).join('')}
      </div>
    `;
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('content').innerHTML = 
      '<p>Σφάλμα κατά τη φόρτωση των εκθέσεων.</p>';
  }
}

async function loadLinksByCategory(category) {
  try {
    const response = await fetch('/api/links');
    const links = await response.json();
    const filteredLinks = links.filter(link => link.category === category);
    
    const mainContent = document.getElementById('content');
    mainContent.innerHTML = `
      <h2>${category}</h2>
      <div id="linksList">
        ${filteredLinks.map(link => `
          <div class="link-item">
            <h3>${link.description}</h3>
            <p><a href="${link.url}" target="_blank">${link.url}</a></p>
          </div>
        `).join('')}
      </div>
    `;
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('content').innerHTML = 
      '<p>Σφάλμα κατά τη φόρτωση των συνδέσμων.</p>';
  }
}


// --- Helpers to render admin pages ---



// Hook up buttons when logged in UI shows

// Hook up buttons when logged in UI shows (use closest to capture clicks on inner elements)
document.addEventListener('click', (e) => {
  const catEl = e.target.closest('a#manageCategories');
  if (catEl) { e.preventDefault(); renderCategoriesAdmin(); return; }
  const bioEl = e.target.closest('a#manageBiography');
  if (bioEl) { e.preventDefault(); renderBiographyAdmin(); return; }
  const paintEl = e.target.closest('a#managePaintings');
  if (paintEl) { e.preventDefault(); renderPaintingsAdmin(); return; }
});

















// ΜΟΝΟ Υποκατηγορίες: οι κατηγορίες είναι σταθερές (π.χ. Βιογραφία, Πίνακες)










async function loadAsideMenus() {
  try {
    const cats = await fetchCategories();
    const getByKey = k => cats.find(c => c.key === k);

    const catBio  = getByKey('biography');
    const catPaint= getByKey('paintings');
    const catExh  = getByKey('exhibitions');
    const catLink = getByKey('links');

    const bioList = document.getElementById('bioList');
    if (bioList) {
      if (catBio) {
        const subs = await fetchSubcategories(catBio._id);
        bioList.innerHTML = subs.length
          ? subs.map(s => `<li><a href="#" data-category="${s.key}">${s.name}</a></li>`).join('')
          : '<li><em>Δεν υπάρχουν υποκατηγορίες</em></li>';
      } else { bioList.innerHTML = '<li><em>Δεν υπάρχει κατηγορία Βιογραφία</em></li>'; }
    }

    const paintList = document.getElementById('paintList');
    if (paintList) {
      if (catPaint) {
        const subs = await fetchSubcategories(catPaint._id);
        paintList.innerHTML = subs.length
          ? subs.map(s => `<li><a href="#" data-category="${s.key}">${s.name}</a></li>`).join('')
          : '<li><em>Δεν υπάρχουν υποκατηγορίες</em></li>';
      } else { paintList.innerHTML = '<li><em>Δεν υπάρχει κατηγορία Πίνακες</em></li>'; }
    }

    const exhList = document.getElementById('exhList');
    if (exhList) {
      if (catExh) {
        const subs = await fetchSubcategories(catExh._id);
        exhList.innerHTML = subs.length
          ? subs.map(s => `<li><a href="#" data-category="${s.key||s.name}">${s.name}</a></li>`).join('')
          : '<li><em>Δεν υπάρχουν υποκατηγορίες</em></li>';
      } else { exhList.innerHTML = '<li><em>Δεν υπάρχει κατηγορία Εκθέσεις</em></li>'; }
    }

    const linkList = document.getElementById('linkList');
    if (linkList) {
      if (catLink) {
        const subs = await fetchSubcategories(catLink._id);
        linkList.innerHTML = subs.length
          ? subs.map(s => `<li><a href="#" data-category="${s.key||s.name}">${s.name}</a></li>`).join('')
          : '<li><em>Δεν υπάρχουν υποκατηγορίες</em></li>';
      } else { linkList.innerHTML = '<li><em>Δεν υπάρχει κατηγορία Συνδέσμοι</em></li>'; }
    }
    bindSidebarClicksOnce();
  } catch (err) {
    console.error('loadAsideMenus error', err);
  }
}


async function resolveSubcategory(catKey, token) {
  const cats = await fetchCategories();
  const cat = cats.find(c => c.key === catKey);
  if (!cat) return null;
  const subs = await fetchSubcategories(cat._id);
  // Try key match first, then case-insensitive name match
  let sub = subs.find(s => s.key === token);
  if (!sub) sub = subs.find(s => (s.name || '').toLowerCase() === (token||'').toLowerCase());
  return sub || null;
}


async function renderBiographyPublic(token) {
  const sub = await resolveSubcategory('biography', token);
  const content = document.getElementById('content');
  if (!sub) { content.innerHTML = '<div class="card"><p>Δεν βρέθηκε η ενότητα.</p></div>'; return; }
  const data = await getBiography(sub._id);

  function renderFromPlain(rawText){
    const norm = String(rawText || '').replace(/\r\n/g, '\n');                // normalize CRLF
    // Escape minimal HTML if it's plain text
    const looksLikeHtml = /<\s*(p|br|ul|ol|li|strong|em|h\d)\b/i.test(norm);
    if (looksLikeHtml) return norm;                                              // already HTML, trust it
    const esc = norm.replace(/[&<>]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[s]));
    // Keep empty lines: split on 2+ newlines -> paragraphs; single newline -> <br>
    const paragraphs = esc.split(/\n{2,}/).map(part => part.replace(/\n/g,'<br>'));
    return paragraphs.map(p => `<p>${p}</p>`).join('');
  }

  let inner = '';
  if (data && typeof data.contentHtml === 'string') {
    // If contentHtml doesn't contain tags (i.e., it's plain text), treat it as plain
    const hasTags = /<\s*\w+[^>]*>/.test(data.contentHtml);
    inner = hasTags ? data.contentHtml : renderFromPlain(data.contentHtml);
  } else if (data && (data.content || data.text)) {
    inner = renderFromPlain(data.content || data.text);
  }

  content.innerHTML = inner
    ? `<div class="card bio-card"><div class="headline"><h2>${sub.name}</h2></div><div class="prose">${inner}</div></div>`
    : `<div class="card bio-card"><div class="headline"><h2>${sub.name}</h2></div><p>Δεν υπάρχει περιεχόμενο ακόμη.</p></div>`;
}
async function renderPaintingsPublic(token) {
  const sub = await resolveSubcategory('paintings', token);
  const content = document.getElementById('content');
  if (!sub) { content.innerHTML = '<div class="card"><p>Δεν βρέθηκε η ενότητα.</p></div>'; return; }
  const items = await listPaintings(sub._id);
  content.innerHTML = `<div class="card"><div class="headline"><h2>${sub.name}</h2></div><div id="gallery" class="gallery"></div></div>`;
  const gal = document.getElementById('gallery');
  gal.innerHTML = items.length
    ? items.map(i => `
      <figure>
        <div class="media">
          <img src="${i.dataUrl}" alt="${(i.description||i.title||'').replace(/`/g,'´')}" loading="lazy" />
        </div>
        <figcaption title="${(i.description||i.title||'').replace(/`/g,'´')}">
          ${i.description||i.title||""}
        </figcaption>
      </figure>`).join('')
    : '<p>Δεν υπάρχουν εικόνες ακόμη.</p>';
}


async function renderExhibitionsPublic(token) {
  const sub = await resolveSubcategory('exhibitions', token);
  const content = document.getElementById('content');
  const list = await fetchExhibitions();
  let filtered = list;
  if (sub && sub._id) {
    filtered = list.filter(x => (x.subcategory === sub._id) || (x.subcategoryId === sub._id));
  } else if (token) {
    filtered = list.filter(x => (x.category === token) || (x.subcategoryName === token));
  }
  content.innerHTML = `<div class="card"><div class="headline"><h2>${sub ? sub.name : 'Εκθέσεις'}</h2></div><ul class="exhibitions-list"></ul></div>`;
  const ul = document.querySelector('.exhibitions-list');
  if (!filtered.length) { ul.innerHTML = '<li>Δεν υπάρχουν εγγραφές ακόμη.</li>'; return; }
  const parts = [];
  filtered.forEach(e => {
    const title = (e.title || '').replace(/`/g,'´');
    const date  = e.date ? String(e.date) : '';
    const loc   = e.location ? String(e.location) : '';
    const cat   = e.category ? String(e.category) : '';
    const desc  = e.description ? String(e.description) : '';
    parts.push(
      `<li class="exh-item">
        <div class="exh-header">
          <div class="exh-title">${title}</div>
          ${date ? `<span class="badge">${date}</span>` : ''}
        </div>
        <div class="exh-meta">
          ${loc ? `<span>📍 ${loc}</span>` : ''}
          ${cat ? `<span>🏷️ ${cat}</span>` : ''}
        </div>
        ${desc ? `<p class="exh-desc">${desc}</p>` : ''}
      </li>`
    );
  });
  ul.innerHTML = parts.join('');
}

async function renderLinksPublic(token) {
  const sub = await resolveSubcategory('links', token);
  const content = document.getElementById('content');
  const list = await fetchLinks();
  let filtered = list;
  if (sub && sub._id) {
    filtered = list.filter(x => (x.subcategory === sub._id) || (x.subcategoryId === sub._id));
  } else if (token) {
    filtered = list.filter(x => (x.category === token) || (x.subcategoryName === token));
  }
  content.innerHTML = `<div class="card"><div class="headline"><h2>${sub ? sub.name : 'Σύνδεσμοι'}</h2></div><ul class="links-list"></ul></div>`;
  const ul = document.querySelector('.links-list');
  if (!filtered.length) { ul.innerHTML = '<li>Δεν υπάρχουν σύνδεσμοι ακόμη.</li>'; return; }
  const parts = [];
  filtered.forEach(l => {
    const url = l.url || '#';
    let host = '';
    try{ host = new URL(url).hostname.replace(/^www\./,''); }catch(e){}
    const title = (l.title || '').trim() || host || 'Σύνδεσμος';
    parts.push(
      `<li class="link-item">
         <div class="link-header">
           <div class="link-title"><a href="${url}" target="_blank" rel="noopener">🔗 ${title}</a></div>
         </div>
         ${host ? `<div class="link-host">🌐 ${host}</div>` : ''}
       </li>`
    );
  });
  ul.innerHTML = parts.join('');
}
function bindSidebarClicksOnce() {
  if (window.__sidebarBound) return;
  window.__sidebarBound = true;
  document.addEventListener('click', async (e) => { const a = e.target.closest('#bioList a, #paintList a, #exhList a, #linkList a'); if (!a) return; e.preventDefault(); document.querySelectorAll('#bioList a, #paintList a, #exhList a, #linkList a').forEach(x=>x.classList.remove('active')); a.classList.add('active');
    const token = a.getAttribute('data-category');
    if (a.closest('#bioList')) return renderBiographyPublic(token);
    if (a.closest('#paintList')) return renderPaintingsPublic(token);
    if (a.closest('#exhList')) return renderExhibitionsPublic(token);
    if (a.closest('#linkList')) return renderLinksPublic(token);
  });
}






























async function renderCategoriesAdmin() {
  const content = document.getElementById('content');
  content.innerHTML = `<div class="card">
    <div class="headline"><h2>Διαχείριση Υποκατηγοριών</h2></div>

    <div class="admin-form">
      <div class="form-grid">
        <div class="form-row wide">
          <label>Κατηγορία</label>
          <select id="catSel" class="control"></select>
        </div>
        <div class="form-row wide">
          <label>Νέα υποκατηγορία:</label>
          <input id="newSubName" class="control" placeholder="Όνομα" />
        </div>
        <div class="form-row wide">
          <button id="saveSubBtn" class="button">Αποθήκευση</button>
        </div>
      </div>
    </div>

    <hr/>

    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Όνομα</th><th style="width:220px">Ενέργειες</th></tr></thead>
        <tbody id="subsTable"><tr><td colspan="2">Φόρτωση...</td></tr></tbody>
      </table>
    </div>
  </div>`;

  const ALL = await fetchCategories();
  const ALLOWED_KEYS = ['biography','paintings','exhibitions','links'];
  const titleMap = { biography:'Βιογραφία', paintings:'Πίνακες', exhibitions:'Εκθέσεις', links:'Σύνδεσμοι' };
  const cats = ALL.filter(c => ALLOWED_KEYS.includes(c.key));
  const catSel = document.getElementById('catSel');
  catSel.innerHTML = cats.map(c => `<option value="${c._id}">${titleMap[c.key]||c.name}</option>`).join('');

  const subsTable = document.getElementById('subsTable');
  const nameInput = document.getElementById('newSubName');
  const saveBtn = document.getElementById('saveSubBtn');
  let editId = null;

  async function loadSubs() {
    const subs = await fetchSubcategories(catSel.value);
    subsTable.innerHTML = subs.length ? subs.map(s => `
      <tr data-id="${s._id}">
        <td>${s.name}</td>
        <td class="actions-cell">
          <button class="edit">Επεξεργασία</button>
          <span class="spacer"></span>
          <button class="danger delete">Διαγραφή</button>
        </td>
      </tr>`).join('') : `<tr><td colspan="2">Δεν υπάρχουν υποκατηγορίες.</td></tr>`;
  }
  catSel.addEventListener('change', async ()=>{ editId=null; nameInput.value=''; await loadSubs(); await loadAsideMenus(); });
  await loadSubs();

  saveBtn.addEventListener('click', async () => { if (typeof isLoggedIn==='function' && !isLoggedIn()) { alert('Απαιτείται σύνδεση.'); return; } if (typeof isLoggedIn==='function' && !isLoggedIn()) { alert('Απαιτείται σύνδεση.'); return; }
    const name = nameInput.value.trim();
    if (!name) return alert('Συμπλήρωσε όνομα.');
    if (editId) { await updateSubcategory(editId, { name }); }
    else { await addSubcategory(catSel.value, { name }); }
    nameInput.value=''; editId=null;
    await loadSubs(); await loadAsideMenus();
  });

  subsTable.addEventListener('click', async (e) => {
    const tr = e.target.closest('tr[data-id]'); if (!tr) return;
    const id = tr.getAttribute('data-id');
    if (e.target.classList.contains('edit')) {
      nameInput.value = tr.children[0].textContent.trim();
      nameInput.focus();
      editId = id;
    }
    if (e.target.classList.contains('delete')) {
      if (!confirm('Διαγραφή;')) return;
      await deleteSubcategory(id);
      if (editId === id){ editId=null; nameInput.value=''; }
      await loadSubs(); await loadAsideMenus();
    }
  });
}

async function renderBiographyAdmin() {
  const content = document.getElementById('content');
  content.innerHTML = `<div class="card">
    <div class="headline"><h2>Διαχείριση Βιογραφίας</h2></div>

    <div class="admin-form">
      <div class="form-grid">
        <div class="form-row wide">
          <label>Υποκατηγορία</label>
          <select id="bioSubSel" class="control"></select>
        </div>
      </div>
    </div>

    <div class="form-grid">
      <div class="form-row wide">
        <label>Κείμενο</label>
        <textarea id="bioEditor" class="control" placeholder="Γράψε εδώ το κείμενο (HTML επιτρέπεται)"></textarea>
      </div>
      <div class="form-row wide" style="display:flex;justify-content:flex-end;">
        <button id="bioSaveBtn" class="button">Αποθήκευση</button>
      </div>
    </div>
  </div>`;

  const cats = await fetchCategories();
  const cat = cats.find(c => c.key === 'biography');
  const subSel = document.getElementById('bioSubSel');
  if (!cat) { subSel.innerHTML = `<option>Δεν υπάρχει κατηγορία Βιογραφίας</option>`; return; }
  const subs = await fetchSubcategories(cat._id);
  subSel.innerHTML = subs.length ? subs.map(s => `<option value="${s._id}">${s.name}</option>`).join('') : `<option value="" disabled selected>— καμία —</option>`;

  
  
    // If empty, prompt to create a subcategory now
    if (!subs.length) {
      showQuickCreateSubModal(cat._id, async (created) => {
        if (created && created._id) {
          subSel.innerHTML = `<option value="${created._id}">${created.name}</option>`;
          subSel.value = created._id;
          const ev = new Event('change'); subSel.dispatchEvent(ev); if (typeof loadBio==='function') await loadBio();
        }
      });
    }
    const editor = document.getElementById('bioEditor');
  const saveBtn = document.getElementById('bioSaveBtn');
  function setBioEnabled(on){ if(editor) editor.disabled = !on; if(saveBtn) saveBtn.disabled = !on; }
  setBioEnabled(!!subSel.value);

subSel.addEventListener('change', () => { setBioEnabled(!!subSel.value); });
  async function loadBio() {
    if (!subSel || !subSel.value) { editor.value = ''; return; }

    const doc = await getBiography(subSel.value);
    editor.value = (doc && doc.contentHtml) ? doc.contentHtml : '';
  }
  subSel.addEventListener('change', loadBio);
  await loadBio();

  document.getElementById('bioSaveBtn').addEventListener('click', async () => {
    await saveBiography(subSel.value, editor.value);
    alert('Αποθηκεύτηκε.');
  });
}

async function renderPaintingsAdmin() {
  const content = document.getElementById('content');
  content.innerHTML = `<div class="card">
    <div class="headline"><h2>Διαχείριση Πινάκων</h2></div>

    <div class="admin-form">
      <div class="form-grid">
        <div class="form-row wide">
          <label>Υποκατηγορία</label>
          <select id="paintSubSel" class="control"></select>
        </div>
        <div class="form-row wide">
          <label>Νέα εικόνα:</label>
          <input type="file" id="paintFiles" class="control" multiple accept="image/*"/>
        </div>
        <div class="form-row wide" id="paintDescRow" style="display:none">
          <label>Περιγραφή για κάθε εικόνα:</label>
          <div id="paintDescList" class="desc-list"></div>
        </div>
        <div class="form-row wide">
          <button id="paintUploadBtn" class="button">Μεταφόρτωση</button>
        </div>
      </div>
    </div>
    <hr>
    <div class="form-grid">
      <div class="form-row wide">
        <div class="gallery" id="paintGallery"></div>
      </div>
    </div>
  </div>`;

  const cats = await fetchCategories();
  const cat = cats.find(c => c.key === 'paintings');
  const subSel = document.getElementById('paintSubSel');
  if (!cat) { subSel.innerHTML = `<option>Δεν υπάρχει κατηγορία Πίνακες</option>`; return; }
  const subs = await fetchSubcategories(cat._id);
  subSel.innerHTML = subs.length ? subs.map(s => `<option value="${s._id}">${s.name}</option>`).join('') : `<option value="" disabled selected>— καμία —</option>`;

  
    // If empty, prompt to create a subcategory now
    if (!subs.length) {
      showQuickCreateSubModal(cat._id, async (created) => {
        if (created && created._id) {
          subSel.innerHTML = `<option value="${created._id}">${created.name}</option>`;
          subSel.value = created._id;
          const ev = new Event('change'); subSel.dispatchEvent(ev); if (typeof loadGallery==='function') await loadGallery();
        }
      });
    }
    const gal = document.getElementById('paintGallery');
  const filesEl = document.getElementById('paintFiles');
  const uploadBtn = document.getElementById('paintUploadBtn');
  const descList = document.getElementById('paintDescList');
  const descRow = document.getElementById('paintDescRow');
  function renderDescInputs(files){
    if (descRow) descRow.style.display = (files && files.length) ? '' : 'none';
    if(!files || !files.length){ descList.innerHTML = ''; return; }
    const rows = [];
    for(let i=0;i<files.length;i++){
      const f = files[i];
      rows.push(`<div class="desc-row"><label class="desc-label">${f.name}</label><textarea class="control paint-desc" data-idx="${i}" placeholder="Περιγραφή (προαιρετικό)"></textarea></div>`);
    }
    descList.innerHTML = rows.join('');
  }
  if (filesEl) filesEl.addEventListener('change', ()=>{ renderDescInputs(filesEl.files); });

  function setPaintEnabled(on){ if(filesEl) filesEl.disabled = !on; if(uploadBtn) uploadBtn.disabled = !on; }
  setPaintEnabled(!!subSel.value);
subSel.addEventListener('change', () => { setPaintEnabled(!!subSel.value); });
  async function loadGallery(){ if (!subSel || !subSel.value) { gal.innerHTML = '<p>Δεν υπάρχουν υποκατηγορίες.</p>'; return; }
    const items = await listPaintings(subSel.value);
    gal.innerHTML = items.length ? items.map(i => `
      <figure data-id="${i._id}">
        <button class="danger del" title="Διαγραφή">Διαγραφή</button>
        <div class="media">
          <img src="${i.dataUrl}" alt="${i.description||i.title||''}" />
        </div>
        <figcaption title="${i.description||i.title||''}">
          ${i.description||i.title||''}
          <button class="danger del" style="float:right;margin-left:.5rem;">Διαγραφή</button>
        </figcaption>
      </figure>`).join('') : '<p>Δεν υπάρχουν εικόνες.</p>';
  }
  subSel.addEventListener('change', ()=>{ setPaintEnabled(!!subSel.value); loadGallery(); });
  if (subSel.value) await loadGallery();

  const _uploadBtnEl = document.getElementById('paintUploadBtn');
  if (_uploadBtnEl) _uploadBtnEl.addEventListener('click', async () => { if (typeof isLoggedIn==='function' && !isLoggedIn()) { alert('Απαιτείται σύνδεση.'); return; } if (!subSel.value) return alert('Δημιούργησε υποκατηγορία πρώτα.');
    const files = document.getElementById('paintFiles').files;
    if (!files || !files.length) return alert('Επίλεξε εικόνες.');
    const descEls = Array.from(document.querySelectorAll('.paint-desc'));
    const descriptions = descEls.map(el => el.value || '');
    await uploadPaintings(subSel.value, files, descriptions);
    document.getElementById('paintFiles').value = '';
    const _descListEl = document.getElementById('paintDescList'); if (_descListEl) _descListEl.innerHTML = '';
    const _descRowEl = document.getElementById('paintDescRow'); if (_descRowEl) _descRowEl.style.display = 'none';
    await loadGallery();
  });

  if (gal) gal.addEventListener('click', async (e) => {
    const fig = e.target.closest('figure[data-id]');
    if (!fig) return;
    if (e.target.classList.contains('del')) {
      if (!confirm('Διαγραφή εικόνας;')) return;
      await deletePainting(fig.getAttribute('data-id'));
      await loadGallery();
    }
  });
}

async function renderExhibitionsAdmin() {
  const content = document.getElementById('content');
  content.innerHTML = `<div class="card">
    <div class="headline"><h2>Διαχείριση Εκθέσεων</h2></div>

    <div class="admin-form">
      <div class="form-grid">
        <div class="form-row wide">
          <label>Υποκατηγορία</label>
          <select id="exhSubSel" class="control"></select>
        </div>
        <div class="form-row wide">
          <label>Τίτλος</label>
          <input id="exhTitle" class="control" placeholder="Τίτλος" />
        </div>
        <div class="form-row wide">
          <label>Ημερομηνία</label>
          <input id="exhDate" class="control" placeholder="π.χ. 2024 ή 05/2024" />
        </div>
        <div class="form-row wide">
          <label>Τοποθεσία</label>
          <input id="exhLocation" class="control" placeholder="Τοποθεσία" />
        </div>
        <div class="form-row wide">
          <button id="exhSaveBtn" class="button">Αποθήκευση</button>
          <button id="exhCancelBtn" class="secondary" style="display:none">Άκυρο</button>
        </div>
      </div>
    </div>

    
    <hr class="soft-divider" />
    <div class="form-grid">
      <div class="form-row wide">
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Τίτλος</th>
                <th>Ημερομηνία</th>
                <th>Τοποθεσία</th>
                <th style="width:220px">Ενέργειες</th>
              </tr>
            </thead>
            <tbody id="exhTableBody">
              <tr><td colspan="4">Φόρτωση...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>`;

  const cats = await fetchCategories();
  const cat = cats.find(c => c.key === 'exhibitions');
  const subSel = document.getElementById('exhSubSel');
  if (!cat) { subSel.innerHTML = `<option>Δεν υπάρχει κατηγορία Εκθέσεις</option>`; return; }
  const subs = await fetchSubcategories(cat._id);
  subSel.innerHTML = subs.length ? subs.map(s => `<option value="${s._id}">${s.name}</option>`).join('') : `<option value="" disabled selected>— καμία —</option>`;

  
    // If empty, prompt to create a subcategory now
    if (!subs.length) {
      showQuickCreateSubModal(cat._id, async (created) => {
        if (created && created._id) {
          subSel.innerHTML = `<option value="${created._id}">${created.name}</option>`;
          subSel.value = created._id;
          const ev = new Event('change'); subSel.dispatchEvent(ev); if (typeof loadExh==='function') await loadExh();
        }
      });
    }
    const tbody = document.getElementById('exhTableBody');
  const titleEl = document.getElementById('exhTitle');
  const dateEl = document.getElementById('exhDate');
  const locEl = document.getElementById('exhLocation');
  const saveBtn = document.getElementById('exhSaveBtn');
  const cancelBtn = document.getElementById('exhCancelBtn');
  let editId = null;
  function setExhEnabled(on){ if(titleEl) titleEl.disabled=!on; if(dateEl) dateEl.disabled=!on; if(locEl) locEl.disabled=!on; if(saveBtn) saveBtn.disabled=!on; }
  setExhEnabled(!!subSel.value);

  async function loadExh(){ if (!subSel || !subSel.value) { tbody.innerHTML = `<tr><td colspan="5">Δεν υπάρχουν υποκατηγορίες.</td></tr>`; return; }
    const all = await fetchExhibitions();
    const subId = subSel.value;
    const list = all.filter(e => (e.subcategory === subId) || (e.subcategoryId === subId));
    if (!list.length) { tbody.innerHTML = `<tr><td colspan="4">Δεν υπάρχουν εκθέσεις σε αυτή την κατηγορία.</td></tr>`; return; }
    tbody.innerHTML = list.map(e => `
      <tr data-id="${e._id}">
        <td>${e.title||''}</td>
        <td>${e.date||''}</td>
        <td>${e.location||''}</td>
        <td class="actions-cell">
          <button class="edit">Επεξεργασία</button>
          <span class="spacer"></span>
          <button class="danger delete">Διαγραφή</button>
        </td>
      </tr>
    `).join('');
  }
  subSel.addEventListener('change', () => { setExhEnabled(!!subSel.value); });
  subSel.addEventListener('change', loadExh);
  await loadExh();

  function clearForm(){ editId=null; titleEl.value=''; dateEl.value=''; locEl.value=''; saveBtn.textContent='Αποθήκευση'; cancelBtn.style.display='none'; }

  saveBtn.addEventListener('click', async () => {
    const payload = { title: titleEl.value.trim(), date: dateEl.value.trim(), location: locEl.value.trim(), subcategory: subSel.value };
    if (!payload.title) return alert('Ο τίτλος είναι υποχρεωτικός.');
    if (editId) await updateExhibition(editId, payload); else await addExhibition(payload);
    clearForm(); await loadExh(); await loadAsideMenus();
  });
  cancelBtn.addEventListener('click', clearForm);

  tbody.addEventListener('click', async (e) => {
    const tr = e.target.closest('tr[data-id]'); if (!tr) return;
    const id = tr.getAttribute('data-id');
    if (e.target.classList.contains('edit')) {
      const tds = tr.querySelectorAll('td');
      titleEl.value = tds[0].textContent;
      dateEl.value = tds[1].textContent;
      locEl.value = tds[2].textContent;
      editId = id; saveBtn.textContent = 'Αποθήκευση'; cancelBtn.style.display='';
    }
    if (e.target.classList.contains('delete')) {
      if (!confirm('Διαγραφή έκθεσης;')) return;
      await deleteExhibition(id);
      if (editId === id) clearForm();
      await loadExh(); await loadAsideMenus();
    }
  });
}

async function renderLinksAdmin() {
  const content = document.getElementById('content');
  content.innerHTML = `<div class="card">
    <div class="headline"><h2>Διαχείριση Συνδέσμων</h2></div>

    <div class="admin-form">
      <div class="form-grid">
        <div class="form-row wide">
          <label>Υποκατηγορία</label>
          <select id="linkSubSel" class="control"></select>
        </div>
        <div class="form-row wide">
          <label>Τίτλος</label>
          <input id="linkTitle" class="control" placeholder="Τίτλος (προαιρετικό)" />
        </div>
        <div class="form-row wide">
          <label>URL</label>
          <input id="linkUrl" class="control" placeholder="https://..." />
        </div>
        <div class="form-row wide">
          <button id="linkSaveBtn" class="button">Αποθήκευση</button>
          <button id="linkCancelBtn" class="secondary" style="display:none">Άκυρο</button>
        </div>
      </div>
    </div>

    
    <hr class="soft-divider" />
    <div class="form-grid">
      <div class="form-row wide">
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Τίτλος</th>
                <th>URL</th>
                <th style="width:220px">Ενέργειες</th>
              </tr>
            </thead>
            <tbody id="linkTableBody">
              <tr><td colspan="3">Φόρτωση...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>`;

  const cats = await fetchCategories();
  const cat = cats.find(c => c.key === 'links');
  const subSel = document.getElementById('linkSubSel');
  if (!cat) { subSel.innerHTML = `<option>Δεν υπάρχει κατηγορία Συνδέσμων</option>`; return; }
  const subs = await fetchSubcategories(cat._id);
  subSel.innerHTML = subs.length ? subs.map(s => `<option value="${s._id}">${s.name}</option>`).join('') : `<option value="" disabled selected>— καμία —</option>`;

  
    // If empty, prompt to create a subcategory now
    if (!subs.length) {
      showQuickCreateSubModal(cat._id, async (created) => {
        if (created && created._id) {
          subSel.innerHTML = `<option value="${created._id}">${created.name}</option>`;
          subSel.value = created._id;
          const ev = new Event('change'); subSel.dispatchEvent(ev); if (typeof loadList==='function') await loadList();
        }
      });
    }
    const tbody = document.getElementById('linkTableBody');
  const titleEl = document.getElementById('linkTitle');
  const urlEl = document.getElementById('linkUrl');
  const saveBtn = document.getElementById('linkSaveBtn');
  const cancelBtn = document.getElementById('linkCancelBtn');
  let editId = null;
  function setLinkEnabled(on){ if(titleEl) titleEl.disabled=!on; if(urlEl) urlEl.disabled=!on; if(saveBtn) saveBtn.disabled=!on; }
  setLinkEnabled(!!subSel.value);

  async function loadList(){ if (!subSel || !subSel.value) { tbody.innerHTML = `<tr><td colspan="3">Δεν υπάρχουν υποκατηγορίες.</td></tr>`; return; }
    const all = await fetchLinks();
    const subId = subSel.value;
    const list = all.filter(l => (l.subcategory === subId) || (l.subcategoryId === subId));
    if (!list.length){ tbody.innerHTML = `<tr><td colspan="3">Δεν υπάρχουν σύνδεσμοι σε αυτή την κατηγορία.</td></tr>`; return; }
    tbody.innerHTML = list.map(l => `
      <tr data-id="${l._id}">
        <td>${l.title || ''}</td>
        <td><a href="${l.url}" target="_blank" rel="noopener">${l.url}</a></td>
        <td class="actions-cell">
          <button class="edit">Επεξεργασία</button>
          <span class="spacer"></span>
          <button class="danger delete">Διαγραφή</button>
        </td>
      </tr>
    `).join('');
  }
  subSel.addEventListener('change', () => { setLinkEnabled(!!subSel.value); });
  subSel.addEventListener('change', loadList);
  await loadList();

  function clearForm(){ editId=null; titleEl.value=''; urlEl.value=''; saveBtn.textContent='Αποθήκευση'; cancelBtn.style.display='none'; }

  saveBtn.addEventListener('click', async () => {
    const payload = { title: titleEl.value.trim(), url: urlEl.value.trim(), subcategory: subSel.value };
    if (!payload.url) return alert('Το URL είναι υποχρεωτικό.');
    if (editId) await updateLink(editId, payload); else await addLink(payload);
    clearForm(); await loadList(); await loadAsideMenus();
  });
  cancelBtn.addEventListener('click', clearForm);

  tbody.addEventListener('click', async (e) => {
    const tr = e.target.closest('tr[data-id]'); if (!tr) return;
    const id = tr.getAttribute('data-id');
    if (e.target.classList.contains('edit')) {
      const tds = tr.querySelectorAll('td');
      titleEl.value = tds[0].textContent.trim();
      urlEl.value = tds[1].innerText.trim();
      editId = id; saveBtn.textContent = 'Αποθήκευση'; cancelBtn.style.display='';
    }
    if (e.target.classList.contains('delete')) {
      if (!confirm('Διαγραφή συνδέσμου;')) return;
      await deleteLink(id);
      if (editId === id) clearForm();
      await loadList(); await loadAsideMenus();
    }
  });
}


/*#__activeSidebarDelegation__*/
document.addEventListener('click', (e) => {
  const a = e.target.closest('#bioList a, #paintList a, #exhList a, #linkList a');
  if (!a) return;
  document.querySelectorAll('#bioList a, #paintList a, #exhList a, #linkList a').forEach(x=>x.classList.remove('active'));
  a.classList.add('active');
});