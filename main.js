const mobileMenuButton = document.getElementById('mobileMenuButton');
const mobileMenu = document.getElementById('mobileMenu');

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

document.getElementById('startLearningBtn').addEventListener('click', function() {
    document.getElementById('loginBtn').click();
});
