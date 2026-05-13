let ALL_WORDS = []; // This will hold your full dictionary
let SOLUTION = "";
let currentGuess = "";
let currentRow = 0;
let gameOver = false;
let letterStates = {}; // Track state of each letter: 'correct', 'present', 'absent'

// 1. LOAD THE WORDS FROM YOUR FILE
// Make sure your file is named 'words.txt' and is in the same folder
fetch('wordle.txt')
    .then(response => response.text())
    .then(text => {
        // Split by new line, remove empty spaces, and convert to uppercase
        ALL_WORDS = text.split('\n').map(word => word.trim().toUpperCase()).filter(word => word.length === 5);
        
        if (ALL_WORDS.length === 0) {
            console.error("Word list is empty! Check your words.txt file.");
            return;
        }

        // 2. INITIALIZE GAME ONCE WORDS ARE LOADED
        initGame();
    });

function initGame() {
    // Reset game state
    currentGuess = "";
    currentRow = 0;
    gameOver = false;
    letterStates = {}; // Reset letter states for new game

    // Pick a random word from your file
    SOLUTION = ALL_WORDS[Math.floor(Math.random() * ALL_WORDS.length)];

    // Optional: If you want topics, you'd need a JSON file.
    // Since we're using a text file, let's just say "Find the Word"
    document.getElementById('topic-display').innerText = "Topic: General";

    // Clear the board and recreate it
    const board = document.getElementById('board');
    board.innerHTML = '';

    // Reset keyboard colors
    document.querySelectorAll('.key').forEach(key => {
        key.classList.remove('correct', 'present', 'absent');
    });

    // Hide reset button
    document.getElementById('reset-btn').style.display = 'none';

    // Clear message
    document.getElementById('message').innerText = '';

    // Initialize the board
    initBoard();

    // Add event listeners
    initEventListeners();
}

function initBoard() {
    const board = document.getElementById('board');

    for (let i = 0; i < 6; i++) {
        const row = document.createElement('div');
        row.className = 'row';

        for (let j = 0; j < 5; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.id = `tile-${i}-${j}`;
            row.appendChild(tile);
        }

        board.appendChild(row);
    }
}

function initEventListeners() {
    // Keyboard click events
    document.querySelectorAll('.key').forEach(key => {
        key.addEventListener('click', () => {
            const keyValue = key.getAttribute('data-key');
            handleKeyPress(keyValue);
        });
    });

    // Physical keyboard events
    document.addEventListener('keydown', (e) => {
        if (gameOver) return;

        const key = e.key.toUpperCase();

        if (key === 'ENTER') {
            handleKeyPress('ENTER');
        } else if (key === 'BACKSPACE') {
            handleKeyPress('BACKSPACE');
        } else if (key.match(/^[A-Z]$/)) {
            handleKeyPress(key);
        }
    });
}

function handleKeyPress(key) {
    if (gameOver) return;

    if (key === 'ENTER') {
        if (currentGuess.length === 5) {
            submitGuess();
        }
    } else if (key === 'BACKSPACE') {
        if (currentGuess.length > 0) {
            currentGuess = currentGuess.slice(0, -1);
            updateBoard();
        }
    } else if (currentGuess.length < 5 && key.match(/^[A-Z]$/)) {
        currentGuess += key;
        updateBoard();
    }
}

function updateBoard() {
    // Clear all tiles in current row
    for (let i = 0; i < 5; i++) {
        const tile = document.getElementById(`tile-${currentRow}-${i}`);
        tile.textContent = '';
        tile.classList.remove('active');
    }

    // Fill tiles with current guess
    for (let i = 0; i < currentGuess.length; i++) {
        const tile = document.getElementById(`tile-${currentRow}-${i}`);
        tile.textContent = currentGuess[i];
        if (i === currentGuess.length - 1) {
            tile.classList.add('active');
        }
    }
}

function updateKeyboardColors() {
    // Reset all keys to default state first
    document.querySelectorAll('.key').forEach(key => {
        const letter = key.getAttribute('data-key');
        if (letter && letter.match(/^[A-Z]$/)) {
            key.classList.remove('correct', 'present', 'absent');
            // Apply the state if it exists
            if (letterStates[letter]) {
                key.classList.add(letterStates[letter]);
            }
        }
    });
}

// ... (Keep your existing Board Initialization and Keydown Event Listeners here) ...

function submitGuess() {
    const resultMsg = document.getElementById('message');

    // --- THE BLOCKER ---
    // If the guessed word isn't in our ALL_WORDS list, block it!
    if (!ALL_WORDS.includes(currentGuess)) {
        resultMsg.innerText = "NOT IN WORD LIST 🚫";
        resultMsg.style.color = "#ff4500";

        // Add a shake effect if you have CSS for it
        const row = document.getElementsByClassName('row')[currentRow];
        row.classList.add('shake');
        setTimeout(() => row.classList.remove('shake'), 500);

        return; // Stop here!
    }
    // -------------------

    const rowTiles = [];
    for (let i = 0; i < 5; i++) {
        rowTiles.push(document.getElementById(`tile-${currentRow}-${i}`));
    }

    const guessArray = currentGuess.split("");
    const solutionArray = SOLUTION.split("");

    // Reset message color in case they had an error before
    resultMsg.innerText = "";

    // Check letters and apply colors, also track letter states for keyboard
    guessArray.forEach((letter, i) => {
        let tileClass = 'absent';
        let letterState = 'absent';

        if (letter === solutionArray[i]) {
            tileClass = 'correct';
            letterState = 'correct';
        } else if (solutionArray.includes(letter)) {
            tileClass = 'present';
            letterState = 'present';
        }

        rowTiles[i].classList.add(tileClass);

        // Update letter state for keyboard (don't downgrade: correct > present > absent)
        if (!letterStates[letter] || letterState === 'correct' ||
            (letterState === 'present' && letterStates[letter] !== 'correct')) {
            letterStates[letter] = letterState;
        }
    });

    // Update keyboard colors
    updateKeyboardColors();

    if (currentGuess === SOLUTION) {
        resultMsg.innerText = "EXCELLENT! 🎉";
        resultMsg.style.color = "#6aaa64";
        endGame();
    } else if (currentRow === 5) {
        resultMsg.innerText = "GAME OVER. Word was: " + SOLUTION;
        resultMsg.style.color = "#ff4500";
        endGame();
    } else {
        currentRow++;
        currentGuess = "";
    }
}