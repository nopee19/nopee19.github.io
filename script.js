// DOM Elements
const welcomeSection = document.getElementById('welcome-section');
const formSection = document.getElementById('form-section');
const resultSection = document.getElementById('result-section');

// Navigation
function showForm() {
    welcomeSection.classList.remove('active-section');
    resultSection.classList.remove('active-section');

    // Tiny delay for animation effect
    setTimeout(() => {
        formSection.classList.add('active-section');
    }, 300);
}

function showResult() {
    formSection.classList.remove('active-section');
    setTimeout(() => {
        resultSection.classList.add('active-section');
    }, 300);
}

function returnToMain() {
    resultSection.classList.remove('active-section');
    setTimeout(() => {
        welcomeSection.classList.add('active-section');
    }, 300);
}

// Reset/Update Logic
function resetForm() {
    document.getElementById('biodataForm').reset();
    deletePhoto(); // Also clear photo
    document.getElementById('biodataForm').scrollIntoView({ behavior: 'smooth' });
}

// --- PHOTO LOGIC (NEW) ---

function triggerFileInput() {
    document.getElementById('photo-input').click();
}

// Image Preview from File Input
function previewImage(event) {
    const reader = new FileReader();
    const imageField = document.getElementById('profile-img');
    const placeholder = document.getElementById('upload-placeholder');

    reader.onload = function () {
        if (reader.readyState == 2) {
            imageField.src = reader.result;
            imageField.classList.remove('hidden');
            if (placeholder) placeholder.classList.add('hidden');
        }
    }

    if (event.target.files[0]) {
        reader.readAsDataURL(event.target.files[0]);
    }
}

// Camera Logic
let videoStream = null;

async function openCamera() {
    const modal = document.getElementById('camera-modal');
    const video = document.getElementById('video');

    try {
        videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = videoStream;
        modal.classList.remove('hidden');
    } catch (err) {
        console.error("Error accessing camera: ", err);
        alert("Tidak dapat mengakses kamera. Pastikan izin diberikan.");
    }
}

function closeCamera() {
    const modal = document.getElementById('camera-modal');
    const video = document.getElementById('video');

    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
    video.srcObject = null;
    modal.classList.add('hidden');
}

function capturePhoto() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const imageField = document.getElementById('profile-img');
    const placeholder = document.getElementById('upload-placeholder');

    if (videoStream) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/png');
        imageField.src = dataUrl;
        imageField.classList.remove('hidden');
        if (placeholder) placeholder.classList.add('hidden');

        closeCamera();
    }
}

function deletePhoto() {
    const imageField = document.getElementById('profile-img');
    const placeholder = document.getElementById('upload-placeholder');
    const fileInput = document.getElementById('photo-input');

    imageField.src = "";
    imageField.classList.add('hidden');
    if (placeholder) placeholder.classList.remove('hidden');
    fileInput.value = ""; // Clear file input
}

// --- END PHOTO LOGIC ---

function calculateAge() {
    const dobInput = document.getElementById('dob').value;
    const umurInput = document.getElementById('umur');

    if (dobInput) {
        const dob = new Date(dobInput);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        umurInput.value = age;
    }
}

function checkOtherReligion() {
    const agamaSelect = document.getElementById('agama');
    const otherInput = document.getElementById('agama-lain');

    if (agamaSelect.value === 'Lainnya') {
        otherInput.classList.remove('hidden');
        otherInput.required = true;
    } else {
        otherInput.classList.add('hidden');
        otherInput.required = false;
    }
}

// --- HISTORY LOGIC ---
const HISTORY_KEY = 'biodata_history';

function getHistory() {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
}

function addToHistory(data) {
    const history = getHistory();
    // Add timestamp to data
    data.timestamp = new Date().toISOString();
    history.unshift(data); // Add to beginning
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    renderHistory();
}

function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
}

function toggleHistory() {
    const historySection = document.getElementById('history-section');
    if (historySection.classList.contains('hidden')) {
        historySection.classList.remove('hidden');
        renderHistory();
    } else {
        historySection.classList.add('hidden');
    }
}

function renderHistory() {
    const list = document.getElementById('history-list');
    const history = getHistory();
    list.innerHTML = '';

    if (history.length === 0) {
        list.innerHTML = '<li style="text-align:center;color:#999;font-style:italic;padding:10px;">Belum ada riwayat pengisian.</li>';
        return;
    }

    history.forEach(item => {
        const li = document.createElement('li');
        li.className = 'history-item';

        const date = new Date(item.timestamp).toLocaleDateString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        const imgSrc = item.profileImg || 'https://via.placeholder.com/150';

        li.innerHTML = `
            <img src="${imgSrc}" class="history-avatar" alt="Avatar">
            <div class="history-info">
                <h4>${item.nama}</h4>
                <p>${item.univ} - ${item.prodi}</p>
                <p style="font-size:0.7rem;color:#aaa;">${date}</p>
            </div>
        `;
        list.appendChild(li);
    });
}
// ----------------------

// Submit Data
function submitData() {
    // Basic Validation
    const form = document.getElementById('biodataForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Capture Values
    const nama = document.getElementById('nama').value;
    const email = document.getElementById('email').value;

    const prov = document.getElementById('provinsi').value;
    const kab = document.getElementById('kabupaten').value;
    const kec = document.getElementById('kecamatan').value;

    const dob = document.getElementById('dob').value;
    const umur = document.getElementById('umur').value;

    let agama = document.getElementById('agama').value;
    if (agama === 'Lainnya') {
        agama = document.getElementById('agama-lain').value;
    }

    const genderEl = document.querySelector('input[name="gender"]:checked');
    const gender = genderEl ? genderEl.value : '-';

    const univ = document.getElementById('univ').value;
    const fak = document.getElementById('fakultas').value;
    const prodi = document.getElementById('prodi').value;
    const nim = document.getElementById('nim').value;

    // Profile Pic
    const profileImgSrc = document.getElementById('profile-img').src;
    const isProfileHidden = document.getElementById('profile-img').classList.contains('hidden');

    // Set Result Values
    document.getElementById('result-nama').textContent = nama;
    document.getElementById('result-email').textContent = email;
    document.getElementById('result-alamat').textContent = `${kec}, ${kab}, ${prov}`;
    document.getElementById('result-ttl').textContent = `${dob} (${umur} Tahun)`;
    document.getElementById('result-agama').textContent = agama;
    document.getElementById('result-gender').textContent = gender;

    document.getElementById('result-univ').textContent = univ;
    document.getElementById('result-fakultas').textContent = fak;
    document.getElementById('result-prodi').textContent = prodi;
    document.getElementById('result-nim').textContent = nim;

    // Set Result Image
    if (profileImgSrc && !isProfileHidden) {
        document.getElementById('result-img').src = profileImgSrc;
    } else {
        // Default placeholder if none
        document.getElementById('result-img').src = 'https://via.placeholder.com/150';
    }

    // --- SAVE TO HISTORY ---
    const dataToSave = {
        nama,
        email,
        alamat: `${kec}, ${kab}, ${prov}`,
        ttl: `${dob} (${umur} Tahun)`,
        agama,
        gender,
        univ,
        fakultas: fak,
        prodi,
        nim,
        profileImg: (!isProfileHidden) ? profileImgSrc : 'https://via.placeholder.com/150'
    };
    addToHistory(dataToSave);
    // -----------------------

    showResult();
}
