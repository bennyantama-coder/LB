// Inisialisasi Data dari LocalStorage
let appData = JSON.parse(localStorage.getItem('jasaDrBenny')) || {
    patients: {}, // Format: {"12345": "Budi"}
    procedures: { "Konsul Poli": 100000, "EKG": 50000 },
    records: []
};

// Set Tanggal Hari Ini
document.getElementById('tanggal').valueAsDate = new Date();

// Render Dropdown & Datalist
function renderUI() {
    // Render MR Datalist
    const mrList = document.getElementById('mrList');
    mrList.innerHTML = '';
    Object.keys(appData.patients).forEach(mr => {
        let option = document.createElement('option');
        option.value = mr;
        mrList.appendChild(option);
    });

    // Render Tindakan Dropdown
    const tindakanSelect = document.getElementById('tindakanSelect');
    tindakanSelect.innerHTML = '<option value="">-- Pilih Tindakan --</option>';
    Object.keys(appData.procedures).forEach(t => {
        let option = document.createElement('option');
        option.value = t;
        option.textContent = t;
        tindakanSelect.appendChild(option);
    });

    // Render List Pengaturan
    const listTindakan = document.getElementById('listTindakan');
    listTindakan.innerHTML = '';
    Object.entries(appData.procedures).forEach(([name, fee]) => {
        listTindakan.innerHTML += `<li>${name} - Rp ${fee.toLocaleString('id-ID')} <button class="danger" style="padding: 5px; width: auto; font-size: 12px; margin-left: 10px;" onclick="hapusTindakan('${name}')">Hapus</button></li>`;
    });

    renderTable();
}

// Auto-fill Nama Pasien jika MR sudah pernah ada
document.getElementById('noMr').addEventListener('input', function(e) {
    const mr = e.target.value;
    if (appData.patients[mr]) {
        document.getElementById('namaPasien').value = appData.patients[mr];
    }
});

// Auto-fill Tarif saat Tindakan dipilih
document.getElementById('tindakanSelect').addEventListener('change', function(e) {
    const tindakan = e.target.value;
    if (appData.procedures[tindakan]) {
        document.getElementById('jasaBersih').value = appData.procedures[tindakan];
    }
});

// Simpan Data Tindakan
document.getElementById('recordForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const date = document.getElementById('tanggal').value;
    const rs = document.getElementById('rs').value;
    const ruangan = document.getElementById('ruangan').value;
    const mr = document.getElementById('noMr').value;
    const nama = document.getElementById('namaPasien').value;
    const tindakan = document.getElementById('tindakanSelect').value;
    const jasa = document.getElementById('jasaBersih').value;

    // Simpan relasi MR -> Nama untuk prediktif ke depannya
    appData.patients[mr] = nama;

    appData.records.push({ date, rs, ruangan, mr, nama, tindakan, jasa });
    saveData();
    alert('Data berhasil disimpan!');
    
    // Reset Form Sebagian
    document.getElementById('noMr').value = '';
    document.getElementById('namaPasien').value = '';
    document.getElementById('tindakanSelect').value = '';
    document.getElementById('jasaBersih').value = '';
    renderUI();
});

// Pengaturan: Tambah Tindakan
function tambahTindakan() {
    const nama = document.getElementById('newTindakan').value;
    const tarif = document.getElementById('newTarif').value;
    if (nama && tarif) {
        appData.procedures[nama] = parseInt(tarif);
        saveData();
        document.getElementById('newTindakan').value = '';
        document.getElementById('newTarif').value = '';
        renderUI();
    }
}

// Pengaturan: Hapus Tindakan
function hapusTindakan(nama) {
    delete appData.procedures[nama];
    saveData();
    renderUI();
}

function saveData() {
    localStorage.setItem('jasaDrBenny', JSON.stringify(appData));
}

function renderTable() {
    const tbody = document.querySelector('#rekapTable tbody');
    tbody.innerHTML = '';
    // Tampilkan dari yang paling baru
    const sortedRecords = [...appData.records].reverse();
    sortedRecords.forEach(r => {
        tbody.innerHTML += `
            <tr>
                <td>${r.date}</td>
                <td>${r.rs}<br><i>${r.ruangan}</i></td>
                <td>${r.nama}<br><small>${r.mr}</small></td>
                <td>${r.tindakan}</td>
                <td>Rp ${parseInt(r.jasa).toLocaleString('id-ID')}</td>
            </tr>
        `;
    });
}

// Ekspor ke CSV
function exportCSV() {
    let csvContent = "data:text/csv;charset=utf-8,Tanggal,Rumah Sakit,Ruangan,No MR,Nama Pasien,Tindakan,Jasa Bersih\n";
    appData.records.forEach(r => {
        let row = `"${r.date}","${r.rs}","${r.ruangan}","${r.mr}","${r.nama}","${r.tindakan}","${r.jasa}"`;
        csvContent += row + "\r\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Rekap_Jasa_dr_Benny.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Navigasi Bawah
function switchPage(pageId, element) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('page-' + pageId).classList.add('active');
    element.classList.add('active');
}

// Inisiasi PWA Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(() => console.log('Service Worker Registered'));
}

renderUI();