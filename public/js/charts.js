// Monthly Incidents Chart
fetch('/api/incidents')
    .then(response => response.json())
    .then(data => {
        const labels = data.map(item => item.month);
        const counts = data.map(item => item.count);

        new Chart(document.getElementById('incidentChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Number of Incidents per Month',
                    data: counts,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Monthly Incident Trends'
                    }
                }
            }
        });
    });

// Incidents by Root Cause
fetch('/api/incidents/root-cause')
    .then(response => response.json())
    .then(data => {
        const labels = data.map(item => item.root_cause);
        const counts = data.map(item => item.count);

        new Chart(document.getElementById('rootCauseChart').getContext('2d'), {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Incidents by Root Cause',
                    data: counts,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Incidents by Root Cause'
                    }
                }
            }
        });
    });

// Incidents by Status
fetch('/api/incidents/status')
    .then(response => response.json())
    .then(data => {
        const labels = data.map(item => item.status);
        const counts = data.map(item => item.count);

        new Chart(document.getElementById('statusChart').getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Incidents by Status',
                    data: counts,
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Incidents by Status'
                    }
                }
            }
        });
    });

// Action Items by Assignee
fetch('/api/action-items/assignee')
    .then(response => response.json())
    .then(data => {
        const labels = data.map(item => item.assignee);
        const counts = data.map(item => item.count);

        new Chart(document.getElementById('assigneeChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Action Items by Assignee',
                    data: counts,
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Action Items by Assignee'
                    }
                }
            }
        });
    });