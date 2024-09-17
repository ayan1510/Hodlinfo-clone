const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
    } else {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:3000/api/tickers')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const tableBody = document.querySelector('#crypto-table tbody');
            tableBody.innerHTML = ''; // Clear any existing content

            data.forEach(ticker => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${ticker.name}</td>
                    <td>${ticker.last}</td>
                    <td>${ticker.buy}</td>
                    <td>${ticker.sell}</td>
                    <td>${ticker.volume}</td>
                    <td>${ticker.base_unit}</td>
                `;

                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
});
