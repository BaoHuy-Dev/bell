let stompClient = null;
let playerName = '';

const setupSection = document.getElementById('setup-section');
const gameSection = document.getElementById('game-section');
const adminSection = document.getElementById('admin-section');
const connectBtn = document.getElementById('connect-btn');
const playerNameInput = document.getElementById('player-name');
const buzzBtn = document.getElementById('buzz-btn');
const resetBtn = document.getElementById('reset-btn');
const winnerDisplay = document.getElementById('winner-display');
const winnerNameSpan = document.getElementById('winner-name');
const displayNameSpan = document.getElementById('display-name');

connectBtn.addEventListener('click', connect);
buzzBtn.addEventListener('click', sendBuzz);
resetBtn.addEventListener('click', sendReset);

playerNameInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        connect();
    }
});

function connect() {
    playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert("Please enter a name");
        return;
    }

    const socket = new SockJS('/buzzer-websocket');
    stompClient = Stomp.over(socket);
    // Disable debug logging to keep console clean
    stompClient.debug = null; 

    stompClient.connect({}, function (frame) {
        setupSection.classList.add('hidden');
        gameSection.classList.remove('hidden');
        adminSection.classList.remove('hidden');
        displayNameSpan.textContent = playerName;

        stompClient.subscribe('/topic/buzzer', function (message) {
            handleStateUpdate(JSON.parse(message.body));
        });

        // Request current state upon connecting
        stompClient.send("/app/state", {}, {});
    }, function(error) {
        alert("Could not connect to WebSocket server. Please try again.");
    });
}

function sendBuzz() {
    if (stompClient && stompClient.connected) {
        stompClient.send("/app/buzz", {}, JSON.stringify({'playerName': playerName}));
    }
}

function sendReset() {
    if (stompClient && stompClient.connected) {
        stompClient.send("/app/reset", {}, {});
    }
}

function handleStateUpdate(state) {
    if (state.winner) {
        // Play sound if someone buzzes (only if it wasn't disabled before to avoid repeated sounds)
        if (!buzzBtn.disabled) {
            playBuzzSound();
        }

        buzzBtn.disabled = true;
        winnerNameSpan.textContent = state.winner;
        winnerDisplay.classList.remove('hidden');
        
        // Visual feedback based on whether this player won
        if (state.winner === playerName) {
            winnerDisplay.style.color = 'var(--success)';
        } else {
            winnerDisplay.style.color = '#f59e0b'; // Amber color for others
        }
    } else {
        // Reset state
        buzzBtn.disabled = false;
        winnerDisplay.classList.add('hidden');
        winnerNameSpan.textContent = '';
    }
}

// Web Audio API to synthesize a buzzer sound without needing external MP3 files
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playBuzzSound() {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    const duration = 1.5; // Longer duration (1.5 seconds)
    const currentTime = audioCtx.currentTime;

    // Create two oscillators for a harsh dissonance/beating effect
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    // Square and Sawtooth combined for a very grating, deafening noise
    osc1.type = 'square';
    osc2.type = 'sawtooth';
    
    // Detuned frequencies (150Hz and 155Hz) to create a nasty buzzing beat
    osc1.frequency.setValueAtTime(150, currentTime);
    osc2.frequency.setValueAtTime(155, currentTime); 
    
    // Max volume (louder: 1.5 gain) and slower fade out
    gainNode.gain.setValueAtTime(1.5, currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + duration);
    
    // Connect everything
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // Play the sound
    osc1.start(currentTime);
    osc2.start(currentTime);
    osc1.stop(currentTime + duration);
    osc2.stop(currentTime + duration);
}
