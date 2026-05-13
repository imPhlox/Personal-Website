function openModal() {
    document.getElementById('modal-overlay').classList.add('active')
    }

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active')
    }

document.getElementById('modal-overlay').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});