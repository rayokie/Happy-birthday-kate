/* ========================================== */
/* THE CAKE INTERACTION             */
/* ========================================== */
const overlay = document.getElementById('cake-overlay');
const instructions = document.getElementById('cake-instructions');
const subInstructions = document.getElementById('sub-instructions');
const startBtn = document.getElementById('mic-start-btn');
const cakeScene = document.getElementById('cake-scene');
const flame = document.getElementById('flame');
const cake = document.getElementById('cake');

let audioContext, analyser, microphone, javascriptNode;
let candlesLit = true;
let cakeCut = false;

if(startBtn) {
    startBtn.addEventListener('click', async () => {
        // Hide button, show cake
        startBtn.style.display = 'none';
        cakeScene.style.display = 'block';
        instructions.innerHTML = "Make a wish...<br>and BLOW the candle! 🎂";

        // CHECK: Is the site secure? (Mic needs HTTPS or Localhost)
        const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';
        
        if (!isSecure) {
            console.warn("Mic blocked due to non-HTTPS");
            subInstructions.innerHTML = "(Mic needs HTTPS. Tap the flame to blow! 🔥)";
            return; 
        }
        
        // Setup Mic
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            microphone = audioContext.createMediaStreamSource(stream);
            javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

            analyser.smoothingTimeConstant = 0.8;
            analyser.fftSize = 1024;

            microphone.connect(analyser);
            analyser.connect(javascriptNode);
            javascriptNode.connect(audioContext.destination);

            javascriptNode.onaudioprocess = function() {
                if (!candlesLit) return;
                const array = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(array);
                let values = 0;
                for (let i = 0; i < array.length; i++) values += array[i];
                const average = values / array.length;

                if (average > 30) {
                    blowOutCandles();
                }
            };
        } catch (err) {
            console.log("Mic denied or error:", err);
            subInstructions.innerHTML = "(Tap the flame to blow it out!)";
        }
    });
}

function blowOutCandles() {
    if(!candlesLit) return;
    candlesLit = false;
    
    // Smoke Animation
    flame.classList.add('puff-out');
    
    // Change Text
    instructions.innerHTML = "Yay! Now swipe down<br>to CUT the cake! 🔪";
    subInstructions.style.display = 'none';

    // Stop Mic
    if(javascriptNode) { javascriptNode.disconnect(); javascriptNode = null; }
    if(microphone) { microphone.disconnect(); microphone = null; }
}

// Click Fallback
if(flame) {
    flame.addEventListener('click', () => {
        if(candlesLit) blowOutCandles();
    });
}

// Swipe Logic
let startY = 0;
document.addEventListener('touchstart', (e) => startY = e.touches[0].clientY);
document.addEventListener('touchmove', (e) => {
    if (candlesLit || cakeCut) return;
    let currentY = e.touches[0].clientY;
    if (currentY > startY + 40) cutTheCake();
});

// PC Mouse Swipe
let isDragging = false;
document.addEventListener('mousedown', (e) => { startY = e.clientY; isDragging = true; });
document.addEventListener('mouseup', () => isDragging = false);
document.addEventListener('mousemove', (e) => {
    if (!isDragging || candlesLit || cakeCut) return;
    if (e.clientY > startY + 40) cutTheCake();
});

function cutTheCake() {
    cakeCut = true;
    
    // 1. Get current HTML of the fancy cake
    const cakeHTML = cake.innerHTML;
    
    // 2. Clear main cake and replace with two halves
    cake.innerHTML = '';
    cake.classList.remove('cake-fancy');
    
    // Create Left Half
    const leftDiv = document.createElement('div');
    leftDiv.className = 'cut-container-left';
    leftDiv.innerHTML = `<div class="cake-fancy inner-cake">${cakeHTML}</div>`;
    
    // Create Right Half
    const rightDiv = document.createElement('div');
    rightDiv.className = 'cut-container-right';
    rightDiv.innerHTML = `<div class="cake-fancy inner-cake">${cakeHTML}</div>`;
    
    cake.appendChild(leftDiv);
    cake.appendChild(rightDiv);

    // 3. Animate them apart
    setTimeout(() => {
        leftDiv.style.transform = "rotate(-10deg) translateX(-30px)";
        rightDiv.style.transform = "rotate(10deg) translateX(30px)";
    }, 50);

    // Final Message
    instructions.innerHTML = `<span style="font-family:'Gistesy', cursive; font-size:4rem; color: #e2c290;">Happy Birthday!</span>`;
    
    // Fade Out Overlay
    setTimeout(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 1500);
    }, 2000);
}

/* ========================================== */
/* GALLERY & PROPOSAL               */
/* ========================================== */

// 1. Restored Gallery Toggle
function toggleGallery(galleryId, btnElement) {
    const gallery = document.getElementById(galleryId);
    gallery.classList.toggle('expanded');
    btnElement.classList.toggle('active');
}

// 2. Click to Reveal Photos (So they stay clear on mobile)
document.addEventListener('DOMContentLoaded', () => {
    // Add click listeners to all gallery images
    const galleryImages = document.querySelectorAll('.gallery-item img');
    galleryImages.forEach(img => {
        img.addEventListener('click', function() {
            // This class removes the blur permanently for this session
            this.classList.add('revealed');
        });
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');
    const successMessage = document.getElementById('successMessage');
    const actionButtons = document.querySelector('.action-buttons');

    if (yesBtn) {
        yesBtn.addEventListener('click', () => {
            actionButtons.style.display = 'none';
            successMessage.style.display = 'block';

            var duration = 5 * 1000;
            var animationEnd = Date.now() + duration;
            var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            var interval = setInterval(function() {
                var timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }
                var particleCount = 50 * (timeLeft / duration);
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
            }, 250);
        });
    }

    function randomInRange(min, max) { return Math.random() * (max - min) + min; }
});

function moveButton(x) {
    x.style.position = "absolute";
    x.style.left = Math.random() * 80 + "%";
    x.style.top = Math.random() * 80 + "%";
}