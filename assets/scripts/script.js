// État global du jeu
let gameState = {
    team1: {
        name: '',
        score: 0,
        penalties: []
    },
    team2: {
        name: '',
        score: 0,
        penalties: []
    },
    timer: {
        minutes: 45,
        seconds: 0,
        isRunning: false,
        halfTime: 45,
        period: 1
    },
    gameStarted: false
};

// Fonction de réinitialisation
function resetGame() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.')) {
        // Arrêter le timer s'il est en cours
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        // Réinitialiser l'état du jeu
        gameState = {
            team1: {
                name: '',
                score: 0,
                penalties: []
            },
            team2: {
                name: '',
                score: 0,
                penalties: []
            },
            timer: {
                minutes: 45,
                seconds: 0,
                isRunning: false,
                halfTime: 45,
                period: 1
            },
            gameStarted: false
        };

        // Effacer le localStorage
        localStorage.removeItem('scoreboardState');

        // Réinitialiser les champs de saisie
        document.getElementById('team1').value = '';
        document.getElementById('team2').value = '';
        document.getElementById('halfTime').value = '45';

        // Mettre à jour l'interface
        updateUI();
    }
}

// Chargement initial de l'état
function loadGameState() {
    const savedState = localStorage.getItem('scoreboardState');
    if (savedState) {
        gameState = JSON.parse(savedState);
        updateUI();
    }
}

// Sauvegarde de l'état
function saveGameState() {
    localStorage.setItem('scoreboardState', JSON.stringify(gameState));
}

// Mise à jour de l'interface utilisateur
function updateUI() {
    // Mise à jour des noms d'équipe
    document.getElementById('team1Name').textContent = gameState.team1.name || 'Équipe 1';
    document.getElementById('team2Name').textContent = gameState.team2.name || 'Équipe 2';
    document.getElementById('team1').value = gameState.team1.name;
    document.getElementById('team2').value = gameState.team2.name;

    // Mise à jour des scores
    document.getElementById('score1').textContent = gameState.team1.score;
    document.getElementById('score2').textContent = gameState.team2.score;

    // Mise à jour du timer
    const formattedTime = `${String(gameState.timer.minutes).padStart(2, '0')}:${String(gameState.timer.seconds).padStart(2, '0')}`;
    document.getElementById('timer').textContent = formattedTime;
    document.getElementById('period').textContent = gameState.timer.period === 1 ? '1ère Mi-temps' : '2ème Mi-temps';
    
    // Mise à jour du bouton timer
    document.getElementById('toggleTimer').textContent = gameState.timer.isRunning ? 'Pause' : 'Démarrer';

    // Mise à jour des pénalités
    updatePenaltiesDisplay();
}

// Gestion du timer
let timerInterval;

function startTimer() {
    if (!timerInterval) {
        timerInterval = setInterval(() => {
            if (gameState.timer.seconds === 0) {
                if (gameState.timer.minutes === 0) {
                    clearInterval(timerInterval);
                    timerInterval = null;
                    gameState.timer.isRunning = false;
                    if (gameState.timer.period === 1) {
                        startSecondHalf();
                    } else {
                        endGame();
                    }
                } else {
                    gameState.timer.minutes--;
                    gameState.timer.seconds = 59;
                }
            } else {
                gameState.timer.seconds--;
            }
            updateUI();
            saveGameState();
        }, 1000);
    }
}

function toggleTimer() {
    if (!gameState.gameStarted) return;
    
    gameState.timer.isRunning = !gameState.timer.isRunning;
    if (gameState.timer.isRunning) {
        startTimer();
    } else {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    updateUI();
    saveGameState();
}

// Gestion des buts
function addGoal(team) {
    if (!gameState.gameStarted) return;
    
    if (team === 1) {
        gameState.team1.score++;
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { x: 0.3 }
        });
    } else {
        gameState.team2.score++;
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { x: 0.7 }
        });
    }
    updateUI();
    saveGameState();
}

function removeGoal(team) {
    if (!gameState.gameStarted) return;
    
    if (team === 1 && gameState.team1.score > 0) {
        gameState.team1.score--;
    } else if (team === 2 && gameState.team2.score > 0) {
        gameState.team2.score--;
    }
    updateUI();
    saveGameState();
}

// Gestion des pénalités
let currentPenaltyTeam = null;

function addPenalty(team) {
    if (!gameState.gameStarted) return;
    
    currentPenaltyTeam = team;
    document.getElementById('penaltyInput').style.display = 'flex';
    document.getElementById('playerNumber').value = '';
    document.getElementById('penaltyTime').value = '2';
}

function confirmPenalty() {
    const playerNumber = document.getElementById('playerNumber').value;
    const penaltyTime = parseInt(document.getElementById('penaltyTime').value);

    if (!playerNumber || !penaltyTime) return;

    const penalty = {
        player: playerNumber,
        timeLeft: penaltyTime * 60,
        originalTime: penaltyTime * 60,
        id: Date.now()
    };

    if (currentPenaltyTeam === 1) {
        gameState.team1.penalties.push(penalty);
    } else {
        gameState.team2.penalties.push(penalty);
    }

    document.getElementById('penaltyInput').style.display = 'none';
    updateUI();
    saveGameState();
}

function cancelPenalty() {
    document.getElementById('penaltyInput').style.display = 'none';
}

function updatePenaltiesDisplay() {
    const penalties1 = document.getElementById('penalties1');
    const penalties2 = document.getElementById('penalties2');
    
    penalties1.innerHTML = '';
    penalties2.innerHTML = '';

    gameState.team1.penalties.forEach(penalty => {
        if (penalty.timeLeft > 0) {
            const minutes = Math.floor(penalty.timeLeft / 60);
            const seconds = penalty.timeLeft % 60;
            const div = document.createElement('div');
            div.className = 'penalty';
            div.innerHTML = `
                <span>#${penalty.player} - ${minutes}:${String(seconds).padStart(2, '0')}</span>
                <button onclick="adjustPenaltyTime(1, ${penalty.id})" class="adjust-penalty">⚙️</button>
                <button onclick="removePenalty(1, ${penalty.id})" class="remove-penalty">❌</button>
            `;
            penalties1.appendChild(div);
        }
    });

    gameState.team2.penalties.forEach(penalty => {
        if (penalty.timeLeft > 0) {
            const minutes = Math.floor(penalty.timeLeft / 60);
            const seconds = penalty.timeLeft % 60;
            const div = document.createElement('div');
            div.className = 'penalty';
            div.innerHTML = `
                <span>#${penalty.player} - ${minutes}:${String(seconds).padStart(2, '0')}</span>
                <button onclick="adjustPenaltyTime(2, ${penalty.id})" class="adjust-penalty">⚙️</button>
                <button onclick="removePenalty(2, ${penalty.id})" class="remove-penalty">❌</button>
            `;
            penalties2.appendChild(div);
        }
    });
}

function removePenalty(team, penaltyId) {
    if (team === 1) {
        gameState.team1.penalties = gameState.team1.penalties.filter(p => p.id !== penaltyId);
    } else {
        gameState.team2.penalties = gameState.team2.penalties.filter(p => p.id !== penaltyId);
    }
    updateUI();
    saveGameState();
}

// Gestion du temps
function showTimeAdjust() {
    document.getElementById('timeAdjustModal').style.display = 'flex';
    document.getElementById('adjustMinutes').value = gameState.timer.minutes;
    document.getElementById('adjustSeconds').value = gameState.timer.seconds;
}

function adjustPenaltiesTime(oldMinutes, oldSeconds, newMinutes, newSeconds) {
    const oldTotalSeconds = oldMinutes * 60 + oldSeconds;
    const newTotalSeconds = newMinutes * 60 + newSeconds;
    const timeDifference = newTotalSeconds - oldTotalSeconds;
    
    // Ajuster les pénalités de l'équipe 1
    gameState.team1.penalties = gameState.team1.penalties.map(penalty => {
        // N'ajuster que si la pénalité est active (temps restant différent du temps original)
        if (penalty.timeLeft !== penalty.originalTime) {
            penalty.timeLeft = Math.max(0, penalty.timeLeft + timeDifference);
        }
        return penalty;
    });
    
    // Ajuster les pénalités de l'équipe 2
    gameState.team2.penalties = gameState.team2.penalties.map(penalty => {
        // N'ajuster que si la pénalité est active (temps restant différent du temps original)
        if (penalty.timeLeft !== penalty.originalTime) {
            penalty.timeLeft = Math.max(0, penalty.timeLeft + timeDifference);
        }
        return penalty;
    });
}

function confirmTimeAdjust() {
    const minutes = parseInt(document.getElementById('adjustMinutes').value);
    const seconds = parseInt(document.getElementById('adjustSeconds').value);
    
    if (!isNaN(minutes) && !isNaN(seconds) && minutes >= 0 && seconds >= 0 && seconds < 60) {
        // Ajuster les pénalités avant de changer le temps
        adjustPenaltiesTime(
            gameState.timer.minutes,
            gameState.timer.seconds,
            minutes,
            seconds
        );
        
        // Mettre à jour le temps
        gameState.timer.minutes = minutes;
        gameState.timer.seconds = seconds;
        
        document.getElementById('timeAdjustModal').style.display = 'none';
        updateUI();
        saveGameState();
    }
}

function cancelTimeAdjust() {
    document.getElementById('timeAdjustModal').style.display = 'none';
}

// Gestion du match
function startGame() {
    const team1Name = document.getElementById('team1').value.trim();
    const team2Name = document.getElementById('team2').value.trim();
    const halfTime = parseInt(document.getElementById('halfTime').value);

    if (!team1Name || !team2Name || isNaN(halfTime) || halfTime <= 0) {
        alert('Veuillez remplir tous les champs correctement');
        return;
    }

    gameState = {
        team1: { name: team1Name, score: 0, penalties: [] },
        team2: { name: team2Name, score: 0, penalties: [] },
        timer: {
            minutes: halfTime,
            seconds: 0,
            isRunning: false,
            halfTime: halfTime,
            period: 1
        },
        gameStarted: true
    };

    updateUI();
    saveGameState();
}

function startSecondHalf() {
    gameState.timer.minutes = gameState.timer.halfTime;
    gameState.timer.seconds = 0;
    gameState.timer.period = 2;
    gameState.timer.isRunning = false;
    updateUI();
    saveGameState();
}

function endGame() {
    alert('Fin du match !');
    confetti({
        particleCount: 200,
        spread: 160,
        origin: { y: 0.6 }
    });
}

// Mise à jour des pénalités toutes les secondes
setInterval(() => {
    if (gameState.timer.isRunning) {
        let updated = false;
        [gameState.team1.penalties, gameState.team2.penalties].forEach(penalties => {
            penalties.forEach(penalty => {
                if (penalty.timeLeft > 0) {
                    penalty.timeLeft--;
                    updated = true;
                }
            });
        });
        if (updated) {
            updateUI();
            saveGameState();
        }
    }
}, 1000);

// Variables pour la gestion de l'ajustement des pénalités
let currentPenaltyToAdjust = {
    team: null,
    id: null
};

function adjustPenaltyTime(team, penaltyId) {
    // Stocker la pénalité en cours d'ajustement
    currentPenaltyToAdjust.team = team;
    currentPenaltyToAdjust.id = penaltyId;

    // Trouver la pénalité
    const penalty = team === 1 
        ? gameState.team1.penalties.find(p => p.id === penaltyId)
        : gameState.team2.penalties.find(p => p.id === penaltyId);

    if (penalty) {
        // Remplir les champs avec les valeurs actuelles
        document.getElementById('adjustPenaltyMinutes').value = Math.floor(penalty.timeLeft / 60);
        document.getElementById('adjustPenaltySeconds').value = penalty.timeLeft % 60;
        // Afficher la modale
        document.getElementById('penaltyAdjustModal').style.display = 'flex';
    }
}

function confirmPenaltyTimeAdjust() {
    const minutes = parseInt(document.getElementById('adjustPenaltyMinutes').value);
    const seconds = parseInt(document.getElementById('adjustPenaltySeconds').value);
    
    if (!isNaN(minutes) && !isNaN(seconds) && minutes >= 0 && seconds >= 0 && seconds < 60) {
        const newTimeLeft = (minutes * 60) + seconds;
        
        // Mettre à jour la pénalité
        if (currentPenaltyToAdjust.team === 1) {
            const penaltyIndex = gameState.team1.penalties.findIndex(p => p.id === currentPenaltyToAdjust.id);
            if (penaltyIndex !== -1) {
                gameState.team1.penalties[penaltyIndex].timeLeft = newTimeLeft;
            }
        } else {
            const penaltyIndex = gameState.team2.penalties.findIndex(p => p.id === currentPenaltyToAdjust.id);
            if (penaltyIndex !== -1) {
                gameState.team2.penalties[penaltyIndex].timeLeft = newTimeLeft;
            }
        }
        
        // Fermer la modale et mettre à jour l'interface
        document.getElementById('penaltyAdjustModal').style.display = 'none';
        updateUI();
        saveGameState();
    }
}

function cancelPenaltyTimeAdjust() {
    document.getElementById('penaltyAdjustModal').style.display = 'none';
    currentPenaltyToAdjust = { team: null, id: null };
}

// Chargement initial
document.addEventListener('DOMContentLoaded', loadGameState); 