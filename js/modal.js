document.addEventListener("DOMContentLoaded", () => {

const termsModal = document.getElementById("termsModal");
const contractModal = document.getElementById("ContractModal");

    document.getElementById("openTerms").addEventListener("click", (e) => {
        e.stopPropagation();
        termsModal.style.display = "block";
    });

    document.getElementById("ContractTerms").addEventListener("click", (e) => {
        e.stopPropagation();
        contractModal.style.display = "block";
    });

    document.getElementById("closeModal").onclick = () => {
        termsModal.style.display = "none";
    };

    document.getElementById("closeModal1").onclick = () => {
        contractModal.style.display = "none";
    };

    window.addEventListener("click", (e) => {
        if (e.target === termsModal) {
            termsModal.style.display = "none";
        }
        if (e.target === contractModal) {
            contractModal.style.display = "none";
        }
   });  
});
