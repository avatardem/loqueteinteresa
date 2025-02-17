document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.toggle-btn');

    function showSidebar() {
        sidebar.classList.add('active');
    }

    function hideSidebar() {
        if (window.innerWidth > 200) {
            sidebar.classList.remove('active');
        }
    }

    toggleBtn.addEventListener("mouseover", showSidebar);
    sidebar.addEventListener("mouseleave", hideSidebar);
});
