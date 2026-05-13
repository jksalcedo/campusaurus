    function toggleModal(show) {
        document.getElementById('nestModal').style.display = show ? 'flex' : 'none';
    }

    function addNewNest() {
        const name = document.getElementById('nestName').value;
        const desc = document.getElementById('nestDesc').value;

        if (name && desc) {
            const container = document.getElementById('nest-container');
            const newCard = `
                <a href="../index/" class="nest-card">
                    <div class="nest-info">
                        <h3>${name.startsWith('n/') ? name : 'n/' + name}</h3>
                        <p>${desc}</p>
                    </div>
                    <div class="visit-btn">Visit Nest</div>
                </a>
            `;
            container.innerHTML = newCard + container.innerHTML; // Adds new nest to the top
            toggleModal(false);
            
            // Clear inputs
            document.getElementById('nestName').value = "";
            document.getElementById('nestDesc').value = "";
        } else {
            alert("Fill in both the name and description!");
        }
    }
