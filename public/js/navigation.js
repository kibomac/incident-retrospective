document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.navigate-button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const url = button.getAttribute('data-url');
            if (url) {
                window.location.href = url;
            }
        });
    });
});