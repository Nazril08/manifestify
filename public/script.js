// File ini sengaja dikosongkan.
// Fungsionalitas unduhan sekarang ditangani oleh pengiriman form HTML standar.
// Kita bisa menambahkan JavaScript di sini di masa depan untuk validasi input atau fitur lainnya. 

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('download-form');
    const button = document.getElementById('download-btn');

    form.addEventListener('submit', (e) => {
        // Mencegah form dari pengiriman standar untuk menambahkan animasi
        e.preventDefault();

        // Cek jika sudah dalam proses loading
        if (button.classList.contains('loading')) {
            return;
        }

        const appId = document.getElementById('appId').value;
        if (!appId) {
            // Mungkin tambahkan validasi atau pesan error di sini jika diperlukan
            return;
        }

        // Tambahkan kelas 'loading' untuk memulai animasi
        button.classList.add('loading');
        button.disabled = true;

        // Memulai unduhan dengan mengarahkan browser ke URL API
        window.location.href = `/api/download?appId=${appId}`;

        // Mengatur timeout untuk mengembalikan tombol ke keadaan semula.
        // Ini memberikan umpan balik visual tanpa harus menunggu unduhan selesai,
        // yang tidak bisa dilacak secara andal oleh browser.
        setTimeout(() => {
            button.classList.remove('loading');
            button.disabled = false;
        }, 3000); // Tombol akan aktif kembali setelah 3 detik
    });
}); 