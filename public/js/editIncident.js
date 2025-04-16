document.addEventListener('DOMContentLoaded', () => {
    const rootCauseDropdown = document.getElementById('rootCause');
    const statusDropdown = document.getElementById('status');
    const addActionItemButton = document.getElementById('addActionItemButton');
    const createActionItemForm = document.getElementById('createActionItemForm');

    // Ensure the form is hidden on page load
    createActionItemForm.style.display = 'none';

    // Fetch root causes from the API
    fetch('/api/root-causes')
        .then(response => response.json())
        .then(rootCauses => {
            rootCauses.forEach(cause => {
                const option = document.createElement('option');
                option.value = cause;
                option.textContent = cause;
                if (rootCauseDropdown.dataset.selected === cause) {
                    option.selected = true; // Pre-select the current root cause
                }
                rootCauseDropdown.appendChild(option);
            });
        })
        .catch(() => {
            alert('Failed to load root causes. Please try again later.');
        });

    // Fetch statuses from the API
    fetch('/api/incident-statuses')
        .then(response => response.json())
        .then(statuses => {
            statuses.forEach(status => {
                const option = document.createElement('option');
                option.value = status;
                option.textContent = status;
                if (statusDropdown.dataset.selected === status) {
                    option.selected = true; // Pre-select the current status
                }
                statusDropdown.appendChild(option);
            });
        })
        .catch(() => {
            alert('Failed to load statuses. Please try again later.');
        });

    // Toggle Create Action Item Form
    addActionItemButton.addEventListener('click', () => {
        const isHidden = createActionItemForm.style.display === 'none';
        createActionItemForm.style.display = isHidden ? 'block' : 'none';
        addActionItemButton.setAttribute('aria-expanded', isHidden);
    });
});