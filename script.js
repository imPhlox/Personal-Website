/* ══════════════════════════════════════════════════════════
   PROFILE MODAL (unchanged from before)
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
   CALENDAR — DATA & STATE
   "State" means the current condition of the app.
   These variables keep track of what week we're on,
   what day was selected, and what events have been saved.
══════════════════════════════════════════════════════════ */

// weekOffset tracks how many weeks away from today we are.
// 0 = current week, -1 = last week, 1 = next week, etc.
let weekOffset = 0;

// selectedDate stores whichever day the user clicked on,
// so we know which day to save the new event to.
let selectedDate = null;

// events is our "database" — a plain JavaScript object.
// Keys are date strings like "2025-05-13", values are arrays of event names.
// Example: { "2025-05-13": ["Meeting", "Gym"], "2025-05-14": ["Dentist"] }
let events = {};


/* ══════════════════════════════════════════════════════════
   CALENDAR — HELPER FUNCTIONS
   Small reusable tools used by the bigger functions below.
══════════════════════════════════════════════════════════ */

// formatDate(date) converts a Date object into a "YYYY-MM-DD" string.
// We use this format as the key in our events object because it's
// consistent and easy to compare.
// Example: formatDate(new Date(2025, 4, 13)) → "2025-05-13"
function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so we add 1
    const d = String(date.getDate()).padStart(2, '0');       // padStart ensures "5" becomes "05"
    return `${y}-${m}-${d}`;
}

// getMonday(date) finds the Monday of whichever week the given date falls in.
// The calendar always starts on Monday, so this is our anchor point.
function getMonday(date) {
    const d = new Date(date);           // Copy the date so we don't modify the original
    const day = d.getDay();             // getDay() returns 0=Sun, 1=Mon, 2=Tue ... 6=Sat
    const diff = (day === 0) ? -6 : 1 - day;
    // If today is Sunday (0), go back 6 days to reach Monday.
    // Otherwise, subtract however many days past Monday we are.
    d.setDate(d.getDate() + diff);      // Moves the date back to Monday
    return d;
}


/* ══════════════════════════════════════════════════════════
   CALENDAR — RENDER FUNCTION
   renderCalendar() builds and displays the calendar on screen.
   It runs once on page load, and again every time the week changes.
══════════════════════════════════════════════════════════ */

function renderCalendar() {

    // Step 1: Figure out which Monday to start from.
    // We start from today and apply the weekOffset.
    const today = new Date();
    const baseMonday = getMonday(today);
    baseMonday.setDate(baseMonday.getDate() + weekOffset * 7);
    // weekOffset * 7 shifts us by full weeks (7 days per week)

    // Step 2: Build the array of 7 dates for this week (Mon to Sun).
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(baseMonday);
        d.setDate(baseMonday.getDate() + i); // Add 0, 1, 2... 6 days to Monday
        weekDates.push(d);
    }

    // Step 3: Update the week label (e.g. "May 12 – May 18, 2025")
    const options = { month: 'short', day: 'numeric' }; // Format: "May 12"
    const start = weekDates[0].toLocaleDateString('en-US', options);
    const end   = weekDates[6].toLocaleDateString('en-US', options);
    const year  = weekDates[6].getFullYear();
    document.getElementById('week-label').textContent = `${start} – ${end}, ${year}`;

    // Step 4: Render the day name headers (Mon, Tue, Wed...)
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const headersEl = document.getElementById('calendar-headers');
    headersEl.innerHTML = ''; // Clear any previous headers before redrawing

    weekDates.forEach((date, i) => {
        const header = document.createElement('div');
        // createElement makes a new HTML element in JavaScript
        header.classList.add('day-header');

        // If this date is today, add the "today-header" class for highlighting
        if (formatDate(date) === formatDate(today)) {
            header.classList.add('today-header');
        }

        // Show the day name and the date number, e.g. "Mon 13"
        header.textContent = `${dayNames[i]} ${date.getDate()}`;
        headersEl.appendChild(header); // Attach the header to the page
    });

    // Step 5: Render the 7 clickable day columns
    const daysEl = document.getElementById('calendar-days');
    daysEl.innerHTML = ''; // Clear previous columns before redrawing

    weekDates.forEach((date) => {
        const dateStr = formatDate(date); // e.g. "2025-05-13"

        const col = document.createElement('div');
        col.classList.add('day-column');

        // Highlight today's column with a border
        if (dateStr === formatDate(today)) {
            col.classList.add('today');
        }

        // Clicking the column opens the Add Event modal for that day.
        // We pass the dateStr so the modal knows which day to save to.
        col.onclick = () => openEventModal(dateStr, date);

        // Step 6: If there are events saved for this day, display them
        const dayEvents = events[dateStr] || [];
        // The || [] means "if no events exist for this date, use an empty array"

        dayEvents.forEach((eventName, index) => {
            const chip = document.createElement('div');
            chip.classList.add('event-chip');

            // The event name text
            const nameSpan = document.createElement('span');
            nameSpan.textContent = eventName;

            // The × delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.textContent = '×';
            deleteBtn.title = 'Delete event';

            // Clicking × deletes this specific event.
            // stopPropagation() prevents the click from also triggering
            // the column's onclick (which would open the add-event modal).
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                deleteEvent(dateStr, index);
            };

            chip.appendChild(nameSpan);
            chip.appendChild(deleteBtn);
            col.appendChild(chip);
        });

        daysEl.appendChild(col); // Attach the column to the page
    });
}


/* ══════════════════════════════════════════════════════════
   WEEK NAVIGATION
══════════════════════════════════════════════════════════ */

// changeWeek() is called by the ← and → arrow buttons.
// direction is either -1 (go back) or +1 (go forward).
function changeWeek(direction) {
    weekOffset += direction; // Move one week backward or forward
    renderCalendar();        // Redraw the calendar for the new week
}


/* ══════════════════════════════════════════════════════════
   ADD EVENT MODAL
══════════════════════════════════════════════════════════ */

// openEventModal() is triggered when the user clicks a day column.
// dateStr is the "YYYY-MM-DD" key, dateObj is the full Date for display.
function openEventModal(dateStr, dateObj) {
    selectedDate = dateStr; // Remember which day was clicked

    // Show a friendly date in the modal, e.g. "Monday, May 13, 2025"
    const label = dateObj.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    document.getElementById('event-date-label').textContent = label;

    // Clear the input field from any previous text
    document.getElementById('event-input').value = '';

    // Show the modal by adding the "active" class
    document.getElementById('event-modal-overlay').classList.add('active');

    // Automatically focus the input so the user can start typing right away
    document.getElementById('event-input').focus();
}

// closeEventModal() hides the add-event popup
function closeEventModal() {
    document.getElementById('event-modal-overlay').classList.remove('active');
    selectedDate = null; // Clear the selected day
}

// saveEvent() reads the input, saves the event, then redraws the calendar
function saveEvent() {
    const input = document.getElementById('event-input');
    const eventName = input.value.trim();
    // .trim() removes any accidental spaces from the beginning or end

    // Don't save if the user left the field empty
    if (!eventName) return;

    // If no events exist for this date yet, create an empty array first
    if (!events[selectedDate]) {
        events[selectedDate] = [];
    }

    // Push the new event name into that day's array
    events[selectedDate].push(eventName);

    closeEventModal(); // Hide the modal
    renderCalendar();  // Redraw so the new event chip appears on the calendar
}

// deleteEvent() removes one event from a specific day by its index
function deleteEvent(dateStr, index) {
    // splice(index, 1) removes 1 item at the given position in the array
    events[dateStr].splice(index, 1);

    // If no events remain for that day, remove the date key entirely (cleanup)
    if (events[dateStr].length === 0) {
        delete events[dateStr];
    }

    renderCalendar(); // Redraw to reflect the deletion
}

// Allow pressing Enter in the input field to save the event (quality of life)
document.getElementById('event-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') saveEvent();
    // If the key pressed is Enter, call saveEvent() automatically
});

// Close the event modal if the user clicks the dark background behind it
document.getElementById('event-modal-overlay').addEventListener('click', function(e) {
    if (e.target === this) closeEventModal();
});


/* ══════════════════════════════════════════════════════════
   INITIALISE
   Runs renderCalendar() once when the page first loads
   so the calendar is displayed immediately.
══════════════════════════════════════════════════════════ */
renderCalendar();