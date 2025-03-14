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

// Afficher/masquer le formulaire de pénalité
function togglePenaltyForm(team) {
    if (!gameState.gameStarted) return;
    
    const penaltyForm = document.getElementById(`penaltyInput${team}`);
    if (penaltyForm.style.display === 'block') {
        penaltyForm.style.display = 'none';
    } else {
        // Cacher l'autre formulaire si ouvert
        document.getElementById(`penaltyInput${team === 1 ? 2 : 1}`).style.display = 'none';
        
        // Réinitialiser et afficher le formulaire
        document.getElementById(`playerNumber${team}`).value = '';
        document.getElementById(`penaltyTime${team}`).value = '2';
        penaltyForm.style.display = 'block';
        
        // Focus sur le premier champ pour l'accessibilité
        document.getElementById(`playerNumber${team}`).focus();
    }
}

// Confirmer l'ajout d'une pénalité
function confirmPenalty(team) {
    const playerNumber = document.getElementById(`playerNumber${team}`).value;
    const penaltyTime = parseInt(document.getElementById(`penaltyTime${team}`).value);

    if (!playerNumber || !penaltyTime) return;

    const penalty = {
        player: playerNumber,
        timeLeft: penaltyTime * 60,
        originalTime: penaltyTime * 60,
        id: Date.now()
    };

    if (team === 1) {
        gameState.team1.penalties.push(penalty);
    } else {
        gameState.team2.penalties.push(penalty);
    }

    // Cacher le formulaire
    document.getElementById(`penaltyInput${team}`).style.display = 'none';
    
    updateUI();
    saveGameState();
}

// Mise à jour de l'affichage des pénalités
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
                <button type="button" class="adjust-penalty" aria-label="Ajuster la pénalité">⚙️</button>
                <button type="button" class="remove-penalty" aria-label="Supprimer la pénalité">❌</button>
            `;
            
            // Ajouter les gestionnaires d'événements directement
            const adjustButton = div.querySelector('.adjust-penalty');
            const removeButton = div.querySelector('.remove-penalty');
            
            adjustButton.addEventListener('click', function() {
                togglePenaltyAdjustForm(1, penalty.id);
            });
            
            removeButton.addEventListener('click', function() {
                removePenalty(1, penalty.id);
            });
            
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
                <button type="button" class="adjust-penalty" aria-label="Ajuster la pénalité">⚙️</button>
                <button type="button" class="remove-penalty" aria-label="Supprimer la pénalité">❌</button>
            `;
            
            // Ajouter les gestionnaires d'événements directement
            const adjustButton = div.querySelector('.adjust-penalty');
            const removeButton = div.querySelector('.remove-penalty');
            
            adjustButton.addEventListener('click', function() {
                togglePenaltyAdjustForm(2, penalty.id);
            });
            
            removeButton.addEventListener('click', function() {
                removePenalty(2, penalty.id);
            });
            
            penalties2.appendChild(div);
        }
    });
}

// Supprimer une pénalité
function removePenalty(team, penaltyId) {
    // Fermer tous les formulaires ouverts
    document.querySelectorAll('.penalty-input, .penalty-adjust-modal, .time-adjust-modal').forEach(form => {
        form.style.display = 'none';
    });
    
    // Supprimer la pénalité
    if (team === 1) {
        gameState.team1.penalties = gameState.team1.penalties.filter(p => p.id !== penaltyId);
    } else {
        gameState.team2.penalties = gameState.team2.penalties.filter(p => p.id !== penaltyId);
    }
    
    // Mettre à jour l'interface et sauvegarder
    updateUI();
    saveGameState();
}

// Gestion du temps
function toggleTimeAdjustForm() {
    const timeForm = document.getElementById('timeAdjustForm');
    if (timeForm.style.display === 'block') {
        timeForm.style.display = 'none';
    } else {
        // Cacher tous les autres formulaires
        document.querySelectorAll('.penalty-input, .penalty-adjust-modal').forEach(form => {
            form.style.display = 'none';
        });
        
        // Remplir et afficher le formulaire
        document.getElementById('adjustMinutes').value = gameState.timer.minutes;
        document.getElementById('adjustSeconds').value = gameState.timer.seconds;
        timeForm.style.display = 'block';
        
        // Focus sur le premier champ pour l'accessibilité
        document.getElementById('adjustMinutes').focus();
    }
}

// Ajuster les pénalités en fonction du changement de temps
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

// Confirmer l'ajustement du temps
function confirmTimeAdjust() {
    const minutes = parseInt(document.getElementById('adjustMinutes').value);
    const seconds = parseInt(document.getElementById('adjustSeconds').value);
    
    if (!isNaN(minutes) && !isNaN(seconds) && minutes >= 0 && seconds >= 0 && seconds < 60) {
        adjustPenaltiesTime(
            gameState.timer.minutes,
            gameState.timer.seconds,
            minutes,
            seconds
        );
        
        gameState.timer.minutes = minutes;
        gameState.timer.seconds = seconds;
        
        document.getElementById('timeAdjustForm').style.display = 'none';
        updateUI();
        saveGameState();
    }
}

// Variables pour la gestion de l'ajustement des pénalités
let currentPenaltyToAdjust = {
    team: null,
    id: null
};

// Afficher/masquer le formulaire d'ajustement de pénalité
function togglePenaltyAdjustForm(team, penaltyId) {
    const penaltyAdjustForm = document.getElementById(`penaltyAdjustForm${team}`);
    
    if (penaltyAdjustForm.style.display === 'block' && currentPenaltyToAdjust.id === penaltyId) {
        // Si le même formulaire est déjà ouvert pour la même pénalité, le fermer
        penaltyAdjustForm.style.display = 'none';
        currentPenaltyToAdjust = { team: null, id: null };
    } else {
        // Cacher tous les autres formulaires
        document.querySelectorAll('.penalty-input, .penalty-adjust-modal, .time-adjust-modal').forEach(form => {
            form.style.display = 'none';
        });
        
        // Stocker la pénalité en cours d'ajustement
        currentPenaltyToAdjust.team = team;
        currentPenaltyToAdjust.id = penaltyId;

        // Trouver la pénalité
        const penalty = team === 1 
            ? gameState.team1.penalties.find(p => p.id === penaltyId)
            : gameState.team2.penalties.find(p => p.id === penaltyId);

        if (penalty) {
            // Remplir les champs avec les valeurs actuelles
            document.getElementById(`adjustPenaltyMinutes${team}`).value = Math.floor(penalty.timeLeft / 60);
            document.getElementById(`adjustPenaltySeconds${team}`).value = penalty.timeLeft % 60;
            
            // Afficher le formulaire
            penaltyAdjustForm.style.display = 'block';
            
            // Focus sur le premier champ pour l'accessibilité
            document.getElementById(`adjustPenaltyMinutes${team}`).focus();
        }
    }
}

// Confirmer l'ajustement du temps de pénalité
function confirmPenaltyTimeAdjust(team) {
    const minutes = parseInt(document.getElementById(`adjustPenaltyMinutes${team}`).value);
    const seconds = parseInt(document.getElementById(`adjustPenaltySeconds${team}`).value);
    
    if (!isNaN(minutes) && !isNaN(seconds) && minutes >= 0 && seconds >= 0 && seconds < 60) {
        const newTimeLeft = (minutes * 60) + seconds;
        
        if (team === 1) {
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
        
        document.getElementById(`penaltyAdjustForm${team}`).style.display = 'none';
        currentPenaltyToAdjust = { team: null, id: null };
        updateUI();
        saveGameState();
    }
}

// Gestion du match
function startGame() {
    const team1Name = document.getElementById('team1').value.trim();
    const team2Name = document.getElementById('team2').value.trim();
    const halfTime = parseInt(document.getElementById('halfTime').value);

    if (isNaN(halfTime) || halfTime <= 0) {
        alert('Veuillez entrer une durée de mi-temps valide');
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

// Initialisation des formulaires au chargement
document.addEventListener('DOMContentLoaded', function() {
    // Charger l'état du jeu
    loadGameState();
    
    // Cacher tous les formulaires au démarrage
    document.querySelectorAll('.penalty-input, .penalty-adjust-modal, .time-adjust-modal').forEach(form => {
        form.style.display = 'none';
    });
    
    // Ajouter des gestionnaires d'événements pour les touches clavier
    document.addEventListener('keydown', function(event) {
        // Si un formulaire est ouvert ou si un champ de saisie est actif, ne pas intercepter les touches
        if (document.activeElement.tagName === 'INPUT' || 
            document.activeElement.tagName === 'TEXTAREA' ||
            document.activeElement.tagName === 'SELECT') {
            return;
        }
        
        // Gestion des touches
        switch (event.key) {
            case 'Escape':
                // Fermer tous les formulaires ouverts
                document.querySelectorAll('.penalty-input, .penalty-adjust-modal, .time-adjust-modal').forEach(form => {
                    form.style.display = 'none';
                });
                currentPenaltyToAdjust = { team: null, id: null };
                break;
                
            case ' ': // Barre d'espace
                // Démarrer/arrêter le temps
                if (gameState.gameStarted) {
                    event.preventDefault(); // Empêcher le défilement de la page
                    toggleTimer();
                }
                break;
                
            case 'ArrowLeft':
                // Ajouter un but à l'équipe de gauche (équipe 1)
                if (gameState.gameStarted) {
                    event.preventDefault();
                    addGoal(1);
                }
                break;
                
            case 'ArrowRight':
                // Ajouter un but à l'équipe de droite (équipe 2)
                if (gameState.gameStarted) {
                    event.preventDefault();
                    addGoal(2);
                }
                break;
        }
    });
    
    // Améliorer la réactivité des boutons sur mobile
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function(event) {
            // Ajouter un effet visuel au toucher
            this.style.opacity = '0.7';
        });

        button.addEventListener('touchend', function(event) {
            // Restaurer l'apparence normale
            this.style.opacity = '1';
        });
    });
    
    // Ajouter une indication visuelle des raccourcis clavier
    const timerButton = document.getElementById('toggleTimer');
    if (timerButton) {
        timerButton.setAttribute('title', 'Raccourci: Barre d\'espace');
    }
    
    const addGoalButtons = document.querySelectorAll('.add-goal');
    addGoalButtons.forEach((button, index) => {
        const direction = index === 0 ? 'gauche' : 'droite';
        button.setAttribute('title', `Raccourci: Flèche ${direction}`);
    });
}); 