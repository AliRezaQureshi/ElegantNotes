

// -------------------------
// Elements (safe-lookups)
// -------------------------
const noteForm = document.getElementById('noteForm');
const notesContainer = document.getElementById('notesContainer');
const searchInput = document.getElementById('searchNotes'); 
const categorySelect = document.getElementById('select');   
const noteDialog = document.getElementById('noteDialog');
const emptyState = document.getElementById('emptyState');

// optional read-dialog elements (may be added below your add-dialog in HTML)
const readNoteDialog = document.getElementById('readNoteDialog');
const readNoteTitle = document.getElementById('readNoteTitle');
const readNoteContent = document.getElementById('readNoteContent');
const readNoteDate = document.getElementById('readNoteDate');
const readNoteCategory = document.getElementById('readNoteCategory');

// -------------------------
// Data (localStorage)
// -------------------------
let notes = [];
try {
  notes = JSON.parse(localStorage.getItem('notes') || '[]');
} catch (err) {
  notes = [];
}

// -------------------------
// Helpers
// -------------------------
function saveNotes() {
  localStorage.setItem('notes', JSON.stringify(notes));
}
function formatDate(date = new Date()) {
  const d = new Date(date);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

// -------------------------
// Dialog open / close
// -------------------------
function openNoteDialog() {
  if (!noteDialog) {
    console.warn('noteDialog element not found in DOM.');
    return;
  }
  // show dialog (CSS expects flex for layout)
  noteDialog.style.display = 'flex';
  // show backdrop if you have one
  const backdrop = document.querySelector('.backdrop');
  if (backdrop) backdrop.style.display = 'block';
}
function closeNoteDialog() {
  if (!noteDialog) return;
  noteDialog.style.display = 'none';
  const backdrop = document.querySelector('.backdrop');
  if (backdrop) backdrop.style.display = 'none';
  if (noteForm) noteForm.reset();
}

// -------------------------
// Read-note dialog (open/close)
// -------------------------
function openReadDialog(index) {
  const note = notes[index];
  if (!note) return;
  if (!readNoteDialog) {
    // If user doesn't have a read dialog element, fallback to alert (safe)
    alert(`${note.title}\n\n${note.content}\n\n(${note.category} • ${note.date})`);
    return;
  }
  if (readNoteTitle) readNoteTitle.textContent = note.title;
  if (readNoteContent) readNoteContent.textContent = note.content;
  if (readNoteDate) readNoteDate.textContent = note.date;
  if (readNoteCategory) {
    readNoteCategory.textContent = note.category;
    // apply category class so color matches the radio button classes
    readNoteCategory.className = `category ${note.category}`;
  }
  readNoteDialog.style.display = 'flex';
}
function closeReadDialog() {
  if (!readNoteDialog) return;
  readNoteDialog.style.display = 'none';
}

// -------------------------
// Add / Save note (form submit)
// -------------------------
if (noteForm) {
  noteForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const titleEl = document.getElementById('noteTitle');
    const contentEl = document.getElementById('noteContent');
    const checkedCategory = document.querySelector('input[name="category"]:checked');
    const title = titleEl ? titleEl.value.trim() : '';
    const content = contentEl ? contentEl.value.trim() : '';
    const category = checkedCategory ? checkedCategory.value : (categorySelect ? categorySelect.value : '');

    if (title.length === 0 || title.length > 28) {
        alert("Title must be between 1 and 28 characters.");
        return;
    }

    if (content.length === 0 || content.length > 500) {
        alert("Content must be between 1 and 500 characters.");
        return;
    }

    if (!title || !content || !category) {
      alert('Please complete title, content and choose a category.');
      return;
    }



    const date = formatDate();

    notes.unshift({ title, content, category, date });
    saveNotes();
    renderNotes();        // re-render grid
    closeNoteDialog();    // close and reset form
  });
}

// -------------------------
// Delete note
// -------------------------
function deleteNote(index) {
  if (typeof index !== 'number' || index < 0 || index >= notes.length) return;
  // optional confirm
  const ok = confirm('Delete this note?');
  if (!ok) return;
  notes.splice(index, 1);
  saveNotes();
  renderNotes();
  // if read dialog open, close it
  if (readNoteDialog) readNoteDialog.style.display = 'none';
}

// make deleteNote available globally for inline onclick handlers (if used)
window.deleteNote = deleteNote;
window.openNoteDialog = openNoteDialog;
window.closeNoteDialog = closeNoteDialog;
window.openReadDialog = openReadDialog;
window.closeReadDialog = closeReadDialog;

// -------------------------
// Render notes grid
// -------------------------
function renderNotes() {
  if (!notesContainer) return;
  notesContainer.innerHTML = '';

  const searchText = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const selectedCategory = categorySelect ? categorySelect.value : 'all';

  const filtered = notes.filter((n) => {
    const matchesText =
      n.title.toLowerCase().includes(searchText) ||
      n.content.toLowerCase().includes(searchText);
    const matchesCategory = selectedCategory === 'all' || n.category === selectedCategory;
    return matchesText && matchesCategory;
  });

  if (!filtered.length) {
    if (emptyState) emptyState.style.display = 'block';
    return;
  } else {
    if (emptyState) emptyState.style.display = 'none';
  }

  filtered.forEach((note) => {
    const index = notes.indexOf(note); // index in original array (used for deletion)
    const card = document.createElement('div');
    card.className = 'note';

    // title
    const h = document.createElement('h3');
    h.textContent = note.title;
    card.appendChild(h);

    // preview content (short)
    const p = document.createElement('p');
    const preview = note.content.length > 120 ? note.content.substring(0, 120) + '...' : note.content;
    p.textContent = preview;
    card.appendChild(p);

    // footer (category, date, delete)
    const footer = document.createElement('div');
    footer.className = 'note-footer';

    const catSpan = document.createElement('span');
    catSpan.className = `category ${note.category}`; // ensures color class matches radio
    catSpan.textContent = note.category;

    const dateSmall = document.createElement('small');
    dateSmall.textContent = note.date;

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.innerHTML = '<i class="ri-delete-bin-6-line"></i>';
    // prevent card click when pressing delete
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteNote(index);
    });

    footer.appendChild(catSpan);
    footer.appendChild(dateSmall);
    footer.appendChild(delBtn);

    card.appendChild(footer);

    // clicking card opens read dialog (except for clicks inside delete)
    card.addEventListener('click', () => openReadDialog(index));

    notesContainer.appendChild(card);
  });
}

// -------------------------
// Search & category listeners
// -------------------------
if (searchInput) {
  searchInput.addEventListener('input', () => renderNotes());
}
if (categorySelect) {
  categorySelect.addEventListener('change', () => renderNotes());
}

// -------------------------
// Close read dialog if its close button used (if present)
// -------------------------
/* Note: keep these global functions in HTML if you used inline onclick attributes:
   <button onclick="closeReadDialog()">❌</button>
   <button onclick="closeNoteDialog()">Cancel</button>
*/

// -------------------------
// Initial render
// -------------------------
renderNotes();

let year = document.getElementById("year").textContent = new Date().getFullYear();