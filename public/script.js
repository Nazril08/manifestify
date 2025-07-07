// File ini sengaja dikosongkan.
// Fungsionalitas unduhan sekarang ditangani oleh pengiriman form HTML standar.
// Kita bisa menambahkan JavaScript di sini di masa depan untuk validasi input atau fitur lainnya. 

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('download-form');
    const button = document.getElementById('download-btn');
    const notification = document.getElementById('notification');

    const showNotification = (message) => {
        notification.textContent = message;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000); // Sembunyikan setelah 3 detik
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (button.classList.contains('loading')) {
            return;
        }

        const appId = document.getElementById('appId').value;
        if (!appId) {
            showNotification('AppID tidak boleh kosong.');
            return;
        }

        button.classList.add('loading');
        button.disabled = true;

        try {
            const response = await fetch(`/api/download?appId=${appId}`);

            if (response.ok) {
                const contentDisposition = response.headers.get('content-disposition');
                let filename = 'download.zip'; // Default filename
                if (contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename="(.+?)"/);
                    if (filenameMatch.length > 1) {
                        filename = filenameMatch[1];
                    }
                }
                
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

            } else {
                const errorData = await response.json();
                showNotification(errorData.message || 'Terjadi kesalahan.');
            }
        } catch (error) {
            showNotification('Gagal menghubungi server.');
        } finally {
            button.classList.remove('loading');
            button.disabled = false;
        }
    });
}); 