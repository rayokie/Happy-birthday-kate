/* ========================================== */
/* 1. THE CAKE INTERACTION             */
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
        // Hides the container instead of just the button to prevent layout shift
        startBtn.closest('.button-container').style.display = 'none';
        
        cakeScene.style.display = 'block';
        instructions.innerHTML = "Make a wish...<br>and BLOW the candle! 🎂";

        const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';
        
        if (!isSecure) {
            console.warn("Mic blocked due to non-HTTPS");
            subInstructions.innerHTML = "(Mic needs HTTPS. Tap the flame to blow! 🔥)";
            return; 
        }
        
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

                if (average > 20) {
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
    flame.classList.add('puff-out');

    // Remove candle after animation
    setTimeout(() => {
        const candleContainer = document.querySelector('.candle');
        if(candleContainer) {
            candleContainer.style.opacity = '0';
            setTimeout(() => candleContainer.style.display = 'none', 500);
        }
    }, 600);

    instructions.innerHTML = "Yay! Now swipe down<br>to CUT the cake! 🔪";
    subInstructions.style.display = 'none';
    if(javascriptNode) { javascriptNode.disconnect(); javascriptNode = null; }
    if(microphone) { microphone.disconnect(); microphone = null; }
}

if(flame) {
    flame.addEventListener('click', () => {
        if(candlesLit) blowOutCandles();
    });
}

// Swipe Logic
let startY = 0;
document.addEventListener('touchstart', (e) => startY = e.touches[0].clientY, {passive: false});

document.addEventListener('touchmove', (e) => {
    if (!cakeCut) { e.preventDefault(); }
    if (candlesLit || cakeCut) return;
    let currentY = e.touches[0].clientY;
    if (currentY > startY + 40) cutTheCake();
}, {passive: false});

let isDragging = false;
document.addEventListener('mousedown', (e) => { startY = e.clientY; isDragging = true; });
document.addEventListener('mouseup', () => isDragging = false);
document.addEventListener('mousemove', (e) => {
    if (!isDragging || candlesLit || cakeCut) return;
    if (e.clientY > startY + 40) cutTheCake();
});

function cutTheCake() {
    cakeCut = true;
    const cakeHTML = cake.innerHTML;
    cake.innerHTML = '';
    cake.classList.remove('cake-fancy');
    
    const leftDiv = document.createElement('div');
    leftDiv.className = 'cut-container-left';
    leftDiv.innerHTML = `<div class="cake-fancy inner-cake">${cakeHTML}</div>`;
    
    const rightDiv = document.createElement('div');
    rightDiv.className = 'cut-container-right';
    rightDiv.innerHTML = `<div class="cake-fancy inner-cake">${cakeHTML}</div>`;
    
    cake.appendChild(leftDiv);
    cake.appendChild(rightDiv);

    setTimeout(() => {
        leftDiv.style.transform = "rotate(-10deg) translateX(-30px)";
        rightDiv.style.transform = "rotate(10deg) translateX(30px)";
    }, 50);

    instructions.innerHTML = `<span style="font-family:'Gistesy', cursive; font-size:4rem; color: #e2c290;">Happy Birthday!</span>`;
    
    setTimeout(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 1500);
    }, 2000);
}

/* ========================================== */
/* 2. GALLERY LOGIC                    */
/* ========================================== */
function toggleGallery(galleryId, btnElement) {
    const gallery = document.getElementById(galleryId);
    gallery.classList.toggle('expanded');
    btnElement.classList.toggle('active');
}

document.addEventListener('DOMContentLoaded', () => {
    const galleryImages = document.querySelectorAll('.gallery-item img');
    galleryImages.forEach(img => {
        img.addEventListener('click', function() {
            this.classList.add('revealed');
        });
    });
});

/* ========================================== */
/* 3. PROPOSAL GAME LOGIC (UPDATED)    */
/* ========================================== */
document.addEventListener('DOMContentLoaded', () => {
    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');
    const successMessage = document.getElementById('successMessage');
    const actionButtons = document.querySelector('.action-buttons');

    // YES BUTTON CLICK
    if (yesBtn) {
        yesBtn.addEventListener('click', triggerSuccess);
    }

    // NEW NO BUTTON LOGIC: Change Text -> Transform to YES
    if (noBtn) {
        let clickCount = 0;
        const funnyTexts = [
            "Really? 🥺",
            "Please? 💔",
            "Last chance! ⚠️",
            "Okay fine..."
        ];

        noBtn.addEventListener('click', (e) => {
            // Check if it's already transformed into a YES button
            if (noBtn.classList.contains('transformed-yes')) {
                triggerSuccess();
                return;
            }

            e.preventDefault();
            
            if (clickCount < funnyTexts.length) {
                noBtn.innerText = funnyTexts[clickCount];
                clickCount++;
            } else {
                // TRANSFORM TO YES BUTTON
                noBtn.innerText = "YES! ❤️";
                noBtn.style.background = "linear-gradient(45deg, #4a1c68, #2d1b4e)"; // Match premium btn
                noBtn.style.color = "white";
                noBtn.style.border = "none";
                noBtn.classList.add('transformed-yes'); // Mark it as transformed
            }
        });
    }

    function triggerSuccess() {
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
    }

    function randomInRange(min, max) { return Math.random() * (max - min) + min; }
});