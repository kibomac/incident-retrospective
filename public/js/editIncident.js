document.addEventListener('DOMContentLoaded', () => {
    const rootCauseDropdown = document.getElementById('rootCause');
    const statusDropdown = document.getElementById('status');

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
        .catch(error => {
            console.error('Error fetching root causes:', error);
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
        .catch(error => {
            console.error('Error fetching statuses:', error);
            alert('Failed to load statuses. Please try again later.');
        });
});