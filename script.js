/* ══════════════════════════════════════════════════════════
   PROFILE MODAL (unchanged)
══════════════════════════════════════════════════════════ */

function openModal() {
    document.getElementById('modal-overlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
}

document.getElementById('modal-overlay').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});


/* ══════════════════════════════════════════════════════════
   SECTION SWITCHING
   showSection() is called whenever the user clicks a
   sidebar button (Schedule, Haircare, Skincare).
   It hides all sections first, then reveals only the one
   that matches the button that was clicked.
══════════════════════════════════════════════════════════ */

function showSection(sectionId, clickedBtn) {
    // Step 1: Hide ALL content sections.
    // querySelectorAll('.content-section') finds every element
    // that has the class "content-section" and returns them as a list.
    const allSections = document.querySelectorAll('.content-section');
    allSections.forEach(function(section) {
        section.classList.remove('active-section');
        // Removing "active-section" sets display back to "none",
        // hiding every section at once before we show the right one.
    });

    // Step 2: Show ONLY the section that was clicked.
    // getElementById finds the one section whose id matches sectionId
    // (e.g. "schedule-section", "haircare-section", "skincare-section").
    document.getElementById(sectionId).classList.add('active-section');
    // Adding "active-section" sets display to "block", making it visible.

    // Step 3: Remove the highlight from ALL sidebar buttons.
    const allBtns = document.querySelectorAll('.nav-btn');
    allBtns.forEach(function(btn) {
        btn.classList.remove('active-nav');
        // Removing "active-nav" un-highlights every button first.
    });

    // Step 4: Highlight ONLY the button that was just clicked.
    // "clickedBtn" is the button element passed in via "this" in the HTML.
    clickedBtn.classList.add('active-nav');
}


/* ══════════════════════════════════════════════════════════
   CALENDAR — DATA & STATE (unchanged)
══════════════════════════════════════════════════════════ */

let weekOffset = 0;
let selectedDate = null;
let events = {};


/* ══════════════════════════════════════════════════════════
   CALENDAR — HELPER FUNCTIONS (unchanged)
══════════════════════════════════════════════════════════ */

function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day === 0) ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
}


/* ══════════════════════════════════════════════════════════
   CALENDAR — RENDER FUNCTION (unchanged)
══════════════════════════════════════════════════════════ */

function renderCalendar() {
    const today = new Date();
    const baseMonday = getMonday(today);
    baseMonday.setDate(baseMonday.getDate() + weekOffset * 7);

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(baseMonday);
        d.setDate(baseMonday.getDate() + i);
        weekDates.push(d);
    }

    const options = { month: 'short', day: 'numeric' };
    const start = weekDates[0].toLocaleDateString('en-US', options);
    const end   = weekDates[6].toLocaleDateString('en-US', options);
    const year  = weekDates[6].getFullYear();
    document.getElementById('week-label').textContent = `${start} – ${end}, ${year}`;

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const headersEl = document.getElementById('calendar-headers');
    headersEl.innerHTML = '';

    weekDates.forEach((date, i) => {
        const header = document.createElement('div');
        header.classList.add('day-header');
        if (formatDate(date) === formatDate(today)) {
            header.classList.add('today-header');
        }
        header.textContent = `${dayNames[i]} ${date.getDate()}`;
        headersEl.appendChild(header);
    });

    const daysEl = document.getElementById('calendar-days');
    daysEl.innerHTML = '';

    weekDates.forEach((date) => {
        const dateStr = formatDate(date);
        const col = document.createElement('div');
        col.classList.add('day-column');
        if (dateStr === formatDate(today)) col.classList.add('today');
        col.onclick = () => openEventModal(dateStr, date);

        const dayEvents = events[dateStr] || [];
        dayEvents.forEach((eventName, index) => {
            const chip = document.createElement('div');
            chip.classList.add('event-chip');

            const nameSpan = document.createElement('span');
            nameSpan.textContent = eventName;

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.textContent = '×';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                deleteEvent(dateStr, index);
            };

            chip.appendChild(nameSpan);
            chip.appendChild(deleteBtn);
            col.appendChild(chip);
        });

        daysEl.appendChild(col);
    });
}


/* ══════════════════════════════════════════════════════════
   WEEK NAVIGATION (unchanged)
══════════════════════════════════════════════════════════ */

function changeWeek(direction) {
    weekOffset += direction;
    renderCalendar();
}


/* ══════════════════════════════════════════════════════════
   ADD EVENT MODAL (unchanged)
══════════════════════════════════════════════════════════ */

function openEventModal(dateStr, dateObj) {
    selectedDate = dateStr;
    const label = dateObj.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    document.getElementById('event-date-label').textContent = label;
    document.getElementById('event-input').value = '';
    document.getElementById('event-modal-overlay').classList.add('active');
    document.getElementById('event-input').focus();
}

function closeEventModal() {
    document.getElementById('event-modal-overlay').classList.remove('active');
    selectedDate = null;
}

function saveEvent() {
    const input = document.getElementById('event-input');
    const eventName = input.value.trim();
    if (!eventName) return;
    if (!events[selectedDate]) events[selectedDate] = [];
    events[selectedDate].push(eventName);
    closeEventModal();
    renderCalendar();
}

function deleteEvent(dateStr, index) {
    events[dateStr].splice(index, 1);
    if (events[dateStr].length === 0) delete events[dateStr];
    renderCalendar();
}

document.getElementById('event-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') saveEvent();
});

document.getElementById('event-modal-overlay').addEventListener('click', function(e) {
    if (e.target === this) closeEventModal();
});


/* ══════════════════════════════════════════════════════════
   INITIALISE
   On page load:
   1. Show the Schedule section by default (passing the
      first sidebar button via querySelector).
   2. Render the calendar inside it.
══════════════════════════════════════════════════════════ */

// querySelector('.nav-btn') finds the FIRST element with class "nav-btn",
// which is the Schedule button — so it starts highlighted by default.
showSection('schedule-section', document.querySelector('.nav-btn'));
renderCalendar();