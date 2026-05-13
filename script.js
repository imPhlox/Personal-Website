// ── openModal() ──────────────────────────────────────────────
// This function runs when the user clicks the profile div.
// It finds the overlay element by its id and adds the CSS class "active",
// which switches it from display:none to display:flex — making it visible.
function openModal() {
    document.getElementById('modal-overlay').classList.add('active')
    // document            → refers to the entire HTML page
    // .getElementById()   → finds the element with id="modal-overlay"
    // .classList          → accesses the list of CSS classes on that element
    // .add('active')      → adds "active" to that list, triggering the CSS rule
}

// ── closeModal() ─────────────────────────────────────────────
// This function runs when the user clicks the Close button.
// It does the opposite — removes the "active" class, hiding the overlay again.
function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active')
    // .remove('active') → takes "active" off the class list,
    //                     switching the element back to display:none
}

// ── Click-outside-to-close ───────────────────────────────────
// This makes the modal close when the user clicks the dark backdrop
// (the overlay itself), but NOT when they click inside the white box.
document.getElementById('modal-overlay').addEventListener('click', function(e) {
    // .addEventListener('click', ...)  → listens for any click on the overlay
    // function(e)                      → runs this function when a click happens.
    //                                   "e" is the click event, which contains
    //                                   info about what was clicked.

    if (e.target === this) closeModal();
    // e.target → the exact element the user clicked on
    // this     → the overlay div itself (#modal-overlay)
    // If they match, the user clicked the dark background (not the white box),
    // so we close the modal. If they clicked inside the box, e.target would be
    // something inside it (like the h2 or button), so this check would be false
    // and the modal would stay open.
});