document.addEventListener('DOMContentLoaded', () => {
    const rootCauseDropdown = document.getElementById('rootCause');

    // Fetch root causes from the correct API endpoint
    fetch('/api/root-causes') 
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch root causes');
            }
            return response.json();
        })
        .then(rootCauses => {
            rootCauses.forEach(cause => {
                const option = document.createElement('option');
                option.value = cause;
                option.textContent = cause;
                rootCauseDropdown.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching root causes:', error);
            alert('Failed to load root causes. Please try again later.');
        });
});