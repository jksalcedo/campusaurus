        // RANDOM TOPICS AND WORDS
        const gameData = [
            { topic: "Programming", word: "INPUT" },
            { topic: "Programming", word: "LOGIC" },
            { topic: "School", word: "STUDY" },
            { topic: "School", word: "GRADE" },
            { topic: "Technology", word: "CLOUD" },
            { topic: "Technology", word: "CYBER" },
            { topic: "General", word: "FORUM" },
            { topic: "General", word: "SHARE" }
        ];

        // Pick a random entry
        const randomConfig = gameData[Math.floor(Math.random() * gameData.length)];
        const SOLUTION = randomConfig.word;
        document.getElementById('topic-display').innerText = "Topic: " + randomConfig.topic;

        let currentGuess = "";
        let currentRow = 0;
        let gameOver = false;

        // Initialize Board (6 Tries)
        const board = document.getElementById('board');
        for (let i = 0; i < 6; i++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'row';
            for (let j = 0; j < 5; j++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.id = `tile-${i}-${j}`;
                rowDiv.appendChild(tile);
            }
            board.appendChild(rowDiv);
        }

        document.addEventListener('keydown', (e) => {
            if (gameOver) return;
            if (e.key === 'Enter') {
                if (currentGuess.length === 5) submitGuess();
            } else if (e.key === 'Backspace') {
                currentGuess = currentGuess.slice(0, -1);
                updateDisplay();
            } else if (currentGuess.length < 5 && /^[a-zA-Z]$/.test(e.key)) {
                currentGuess += e.key.toUpperCase();
                updateDisplay();
            }
        });

        function updateDisplay() {
            for (let i = 0; i < 5; i++) {
                const tile = document.getElementById(`tile-${currentRow}-${i}`);
                tile.innerText = currentGuess[i] || "";
                tile.classList.toggle('active', !!currentGuess[i]);
            }
        }

        function submitGuess() {
            const rowTiles = [];
            for (let i = 0; i < 5; i++) {
                rowTiles.push(document.getElementById(`tile-${currentRow}-${i}`));
            }

            const guessArray = currentGuess.split("");
            const solutionArray = SOLUTION.split("");
            const resultMsg = document.getElementById('message');

            // Check letters and apply colors
            guessArray.forEach((letter, i) => {
                if (letter === solutionArray[i]) {
                    rowTiles[i].classList.add('correct');
                } else if (solutionArray.includes(letter)) {
                    rowTiles[i].classList.add('present');
                } else {
                    rowTiles[i].classList.add('absent');
                }
            });

            if (currentGuess === SOLUTION) {
                resultMsg.innerText = "EXCELLENT! 🎉";
                resultMsg.style.color = "#538d4e";
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

        function endGame() {
            gameOver = true;
            document.getElementById('reset-btn').style.display = "inline-block";
        }
