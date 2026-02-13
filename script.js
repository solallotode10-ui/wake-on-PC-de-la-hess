let currentInput = "";
let isPowerOn = true;
const noSleep = new NoSleep();

function saveESP32IP() {
    const val = document.getElementById('esp32-ip-input').value;
    if(val) { localStorage.setItem('esp32_ip', val); alert("IP configurée : " + val); }
}

function handlePowerClick() {
    const btn = document.getElementById('main-power-btn');
    const ip = localStorage.getItem('esp32_ip') || "192.168.1.50";
    isPowerOn = !isPowerOn;
    
    if (isPowerOn) {
        btn.textContent = "ON"; btn.className = "power-btn-circle on";
    } else {
        btn.textContent = "OFF"; btn.className = "power-btn-circle off";
        fetch(`http://${ip}/allumer`).catch(() => console.log("ESP32 injoignable en local"));
    }
    if (navigator.vibrate) navigator.vibrate(40);
}

function showStep(id) {
    document.querySelectorAll('.glass-card').forEach(c => c.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    currentInput = ""; updateDots(id);
}

function updateDots(stepId) {
    const dots = document.querySelectorAll(`#${stepId} .pin-dot`);
    dots.forEach((dot, i) => dot.classList.toggle('filled', i < currentInput.length));
}

document.querySelectorAll('.key').forEach(btn => {
    btn.addEventListener('click', () => {
        const stepId = btn.closest('.glass-card').id;
        const val = btn.getAttribute('data-val');
        if (val === "del") currentInput = currentInput.slice(0, -1);
        else if (currentInput.length < 4) currentInput += val;
        updateDots(stepId);
        if (currentInput.length === 4 && stepId === "step-login") checkPin();
    });
});

function registerAccount() {
    const name = document.getElementById('reg-first-name').value;
    if (name && currentInput.length === 4) {
        localStorage.setItem('wake_data', JSON.stringify({user: name, pin: currentInput}));
        showStep('step-login');
    }
}

function checkPin() {
    const data = JSON.parse(localStorage.getItem('wake_data'));
    if (data && currentInput === data.pin) {
        document.getElementById('user-welcome').textContent = "Salut " + data.user;
        showStep('step-app');
    } else {
        currentInput = ""; updateDots('step-login');
    }
}

function setupUpload(inputId, storageKey, elementIds) {
    const input = document.getElementById(inputId);
    input.addEventListener('change', (e) => {
        const reader = new FileReader();
        reader.onload = () => {
            const url = `url(${reader.result})`;
            elementIds.forEach(id => document.getElementById(id).style.backgroundImage = url);
            localStorage.setItem(storageKey, reader.result);
        };
        reader.readAsDataURL(e.target.files[0]);
    });
}

setupUpload('bg-input', 'user_bg', ['bg-overlay']);
setupUpload('pfp-input', 'user_pfp', ['pfp-display', 'pfp-main']);

function toggleNoSleep() {
    document.getElementById('nosleep-toggle').checked ? noSleep.enable() : noSleep.disable();
}

function logout() { if(confirm("Réinitialiser ?")) { localStorage.clear(); location.reload(); } }

window.onload = () => {
    const data = JSON.parse(localStorage.getItem('wake_data'));
    const bg = localStorage.getItem('user_bg');
    const pfp = localStorage.getItem('user_pfp');
    if (bg) document.getElementById('bg-overlay').style.backgroundImage = `url(${bg})`;
    if (pfp) {
        document.getElementById('pfp-display').style.backgroundImage = `url(${pfp})`;
        document.getElementById('pfp-main').style.backgroundImage = `url(${pfp})`;
    }
    data ? showStep('step-login') : showStep('step-register');
};