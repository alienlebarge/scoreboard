// Presets de sports
const SPORT_PRESETS = {
    football: {
        periods: 2,
        periodDuration: 45,
        periodName: 'Mi-temps',
        scoreName: 'But',
        scoreIncrements: [1],
        penaltiesEnabled: false,
        defaultPenaltyDuration: 2,
        timerDirection: 'down'
    },
    hockey: {
        periods: 3,
        periodDuration: 20,
        periodName: 'Tiers',
        scoreName: 'But',
        scoreIncrements: [1],
        penaltiesEnabled: true,
        defaultPenaltyDuration: 2,
        timerDirection: 'down'
    },
    basketball: {
        periods: 4,
        periodDuration: 10,
        periodName: 'Quart',
        scoreName: 'Panier',
        scoreIncrements: [1, 2, 3],
        penaltiesEnabled: false,
        defaultPenaltyDuration: 2,
        timerDirection: 'down'
    },
    handball: {
        periods: 2,
        periodDuration: 30,
        periodName: 'Mi-temps',
        scoreName: 'But',
        scoreIncrements: [1],
        penaltiesEnabled: true,
        defaultPenaltyDuration: 2,
        timerDirection: 'down'
    },
    custom: {
        periods: 2,
        periodDuration: 20,
        periodName: 'Période',
        scoreName: 'Point',
        scoreIncrements: [1],
        penaltiesEnabled: true,
        defaultPenaltyDuration: 2,
        timerDirection: 'down'
    }
};

const DEFAULT_CONFIG = { ...SPORT_PRESETS.hockey };

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
        minutes: 20,
        seconds: 0,
        isRunning: false,
        halfTime: 20,
        period: 1
    },
    config: { ...DEFAULT_CONFIG },
    gameStarted: false
};

// Compteur pour générer des IDs uniques de pénalités
let penaltyIdCounter = 0;

function generatePenaltyId() {
    return Date.now() + '-' + (penaltyIdCounter++);
}

// Helper pour accéder aux pénalités d'une équipe
function getTeamPenalties(team) {
    return team === 1 ? gameState.team1.penalties : gameState.team2.penalties;
}

function setTeamPenalties(team, penalties) {
    if (team === 1) {
        gameState.team1.penalties = penalties;
    } else {
        gameState.team2.penalties = penalties;
    }
}

// Nettoyage des pénalités expirées
function cleanExpiredPenalties() {
    gameState.team1.penalties = gameState.team1.penalties.filter(p => p.timeLeft > 0);
    gameState.team2.penalties = gameState.team2.penalties.filter(p => p.timeLeft > 0);
}

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
                minutes: 20,
                seconds: 0,
                isRunning: false,
                halfTime: 20,
                period: 1
            },
            config: { ...DEFAULT_CONFIG },
            gameStarted: false
        };

        // Effacer le localStorage
        localStorage.removeItem('scoreboardState');

        // Réinitialiser les champs de saisie
        document.getElementById('team1').value = '';
        document.getElementById('team2').value = '';

        // Réinitialiser le dropdown et les champs config
        const presetSelect = document.getElementById('sportPreset');
        if (presetSelect) {
            presetSelect.value = 'hockey';
            populateConfigFields(SPORT_PRESETS.hockey);
        }

        // Reconstruire les contrôles par défaut
        buildScoreControls();
        applyPenaltyVisibility();

        // Mettre à jour l'interface
        updateUI();
    }
}

// Chargement initial de l'état
function loadGameState() {
    const savedState = localStorage.getItem('scoreboardState');
    if (savedState) {
        try {
            const parsed = JSON.parse(savedState);
            // Vérifier que la structure est valide
            if (parsed && parsed.team1 && parsed.team2 && parsed.timer) {
                // Migration : ajouter config si absente
                if (!parsed.config) {
                    parsed.config = { ...DEFAULT_CONFIG };
                    // Inférer periodDuration depuis halfTime
                    if (parsed.timer.halfTime) {
                        parsed.config.periodDuration = parsed.timer.halfTime;
                    }
                } else {
                    // Compléter les clés manquantes depuis DEFAULT_CONFIG
                    for (const key of Object.keys(DEFAULT_CONFIG)) {
                        if (parsed.config[key] === undefined) {
                            parsed.config[key] = DEFAULT_CONFIG[key];
                        }
                    }
                }
                gameState = parsed;

                // Si le match est en cours, reconstruire les contrôles
                if (gameState.gameStarted) {
                    buildScoreControls();
                    applyPenaltyVisibility();
                }
            }
        } catch (e) {
            localStorage.removeItem('scoreboardState');
        }
        updateUI();
    }
}

// Sauvegarde de l'état
function saveGameState() {
    localStorage.setItem('scoreboardState', JSON.stringify(gameState));
}

// Générer le label de période
function getPeriodLabel(periodNumber, config) {
    const name = config.periodName;
    if (periodNumber === 1) {
        return '1ère ' + name;
    }
    return periodNumber + 'ème ' + name;
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
    document.getElementById('period').textContent = getPeriodLabel(gameState.timer.period, gameState.config);

    // Mise à jour du bouton timer
    document.getElementById('toggleTimer').textContent = gameState.timer.isRunning ? 'Pause' : 'Démarrer';

    // Mise à jour des pénalités
    updatePenaltiesDisplay();
}

// Gestion du timer unique (chronomètre + pénalités)
let timerInterval;

function startTimer() {
    if (!timerInterval) {
        timerInterval = setInterval(() => {
            const config = gameState.config;

            if (config.timerDirection === 'down') {
                // Décompte
                if (gameState.timer.seconds === 0) {
                    if (gameState.timer.minutes === 0) {
                        clearInterval(timerInterval);
                        timerInterval = null;
                        gameState.timer.isRunning = false;
                        if (gameState.timer.period < config.periods) {
                            startNextPeriod();
                        } else {
                            endGame();
                        }
                        updateUI();
                        saveGameState();
                        return;
                    } else {
                        gameState.timer.minutes--;
                        gameState.timer.seconds = 59;
                    }
                } else {
                    gameState.timer.seconds--;
                }
            } else {
                // Count-up
                gameState.timer.seconds++;
                if (gameState.timer.seconds >= 60) {
                    gameState.timer.seconds = 0;
                    gameState.timer.minutes++;
                }
                // Vérifier si la durée de période est atteinte
                if (gameState.timer.minutes >= config.periodDuration && gameState.timer.seconds === 0) {
                    clearInterval(timerInterval);
                    timerInterval = null;
                    gameState.timer.isRunning = false;
                    if (gameState.timer.period < config.periods) {
                        startNextPeriod();
                    } else {
                        endGame();
                    }
                    updateUI();
                    saveGameState();
                    return;
                }
            }

            // Décompte des pénalités (toujours vers le bas)
            [gameState.team1.penalties, gameState.team2.penalties].forEach(penalties => {
                penalties.forEach(penalty => {
                    if (penalty.timeLeft > 0) {
                        penalty.timeLeft--;
                    }
                });
            });

            // Nettoyer les pénalités expirées
            cleanExpiredPenalties();

            updateUI();
            saveGameState();
        }, 1000);
    }
}

function toggleTimer() {
    if (!gameState.gameStarted) {
        showNotification('Veuillez démarrer le match d\'abord.');
        return;
    }

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

// Notification non-bloquante
function showNotification(message) {
    // Supprimer une notification existante
    const existing = document.getElementById('gameNotification');
    if (existing) existing.remove();

    const notif = document.createElement('div');
    notif.id = 'gameNotification';
    notif.setAttribute('role', 'alert');
    notif.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#0D47A1;color:white;padding:15px 30px;border-radius:8px;font-size:1.2em;font-weight:bold;z-index:2000;box-shadow:0 4px 12px rgba(0,0,0,0.3);transition:opacity 0.3s;';
    notif.textContent = message;
    document.body.appendChild(notif);

    setTimeout(() => {
        notif.style.opacity = '0';
        setTimeout(() => notif.remove(), 300);
    }, 2500);
}

// Lancer les confettis de manière sécurisée
function fireConfetti(options) {
    if (typeof confetti === 'function') {
        confetti(options);
    }
}

// Gestion des buts avec incrément configurable
function addGoal(team, increment) {
    if (!gameState.gameStarted) {
        showNotification('Veuillez démarrer le match d\'abord.');
        return;
    }

    increment = increment || 1;

    if (team === 1) {
        gameState.team1.score += increment;
        fireConfetti({ particleCount: 100, spread: 70, origin: { x: 0.3 } });
    } else {
        gameState.team2.score += increment;
        fireConfetti({ particleCount: 100, spread: 70, origin: { x: 0.7 } });
    }
    updateUI();
    saveGameState();
}

function removeGoal(team, increment) {
    if (!gameState.gameStarted) {
        showNotification('Veuillez démarrer le match d\'abord.');
        return;
    }

    increment = increment || 1;

    if (team === 1) {
        gameState.team1.score = Math.max(0, gameState.team1.score - increment);
    } else {
        gameState.team2.score = Math.max(0, gameState.team2.score - increment);
    }
    updateUI();
    saveGameState();
}

// Construire dynamiquement les boutons de score
function buildScoreControls() {
    const config = gameState.config;
    const scoreName = config.scoreName;
    const increments = config.scoreIncrements;

    [1, 2].forEach(team => {
        const container = document.querySelector(`.team${team} .controls`);
        if (!container) return;
        container.innerHTML = '';

        // Boutons de retrait
        increments.forEach(inc => {
            const btn = document.createElement('button');
            btn.className = 'remove-goal';
            btn.setAttribute('aria-label', `Retirer ${inc} ${scoreName} à l'équipe ${team}`);
            btn.textContent = `- ${inc} ${scoreName}`;
            btn.addEventListener('click', function() { removeGoal(team, inc); });
            container.appendChild(btn);
        });

        // Boutons d'ajout
        increments.forEach(inc => {
            const btn = document.createElement('button');
            btn.className = 'add-goal';
            btn.setAttribute('aria-label', `Ajouter ${inc} ${scoreName} à l'équipe ${team}`);
            btn.textContent = `+ ${inc} ${scoreName}`;
            btn.addEventListener('click', function() { addGoal(team, inc); });
            container.appendChild(btn);
        });

        // Bouton pénalité (seulement si activé)
        if (config.penaltiesEnabled) {
            const penBtn = document.createElement('button');
            penBtn.setAttribute('aria-label', `Ajouter une pénalité à l'équipe ${team}`);
            penBtn.textContent = '+ Pénalité';
            penBtn.addEventListener('click', function() { togglePenaltyForm(team); });
            container.appendChild(penBtn);
        }
    });
}

// Appliquer la visibilité des pénalités
function applyPenaltyVisibility() {
    const config = gameState.config;
    const penaltyElements = document.querySelectorAll('.penalty-input, .penalties, .penalty-adjust-modal');
    penaltyElements.forEach(el => {
        if (config.penaltiesEnabled) {
            el.classList.remove('penalties-hidden');
        } else {
            el.classList.add('penalties-hidden');
        }
    });
}

// Gestion des pénalités
let currentPenaltyTeam = null;

// Afficher/masquer le formulaire de pénalité
function togglePenaltyForm(team) {
    if (!gameState.gameStarted) {
        showNotification('Veuillez démarrer le match d\'abord.');
        return;
    }

    const penaltyForm = document.getElementById(`penaltyInput${team}`);
    if (penaltyForm.style.display === 'block') {
        penaltyForm.style.display = 'none';
    } else {
        // Cacher l'autre formulaire si ouvert
        document.getElementById(`penaltyInput${team === 1 ? 2 : 1}`).style.display = 'none';

        // Réinitialiser et afficher le formulaire
        document.getElementById(`playerNumber${team}`).value = '';
        document.getElementById(`penaltyTime${team}`).value = gameState.config.defaultPenaltyDuration;
        penaltyForm.style.display = 'block';

        // Focus sur le premier champ pour l'accessibilité
        document.getElementById(`playerNumber${team}`).focus();
    }
}

// Confirmer l'ajout d'une pénalité
function confirmPenalty(team) {
    const playerNumber = document.getElementById(`playerNumber${team}`).value.trim();
    const penaltyTime = parseInt(document.getElementById(`penaltyTime${team}`).value);

    if (!playerNumber) return;
    if (isNaN(penaltyTime) || penaltyTime <= 0) return;

    const penalty = {
        player: playerNumber,
        timeLeft: penaltyTime * 60,
        originalTime: penaltyTime * 60,
        id: generatePenaltyId()
    };

    getTeamPenalties(team).push(penalty);

    // Cacher le formulaire
    document.getElementById(`penaltyInput${team}`).style.display = 'none';

    updateUI();
    saveGameState();
}

// Mise à jour de l'affichage des pénalités (factorisé pour les deux équipes)
function updatePenaltiesDisplay() {
    [1, 2].forEach(team => {
        const container = document.getElementById(`penalties${team}`);
        container.innerHTML = '';

        getTeamPenalties(team).forEach(penalty => {
            const minutes = Math.floor(penalty.timeLeft / 60);
            const seconds = penalty.timeLeft % 60;
            const div = document.createElement('div');
            div.className = 'penalty';
            div.innerHTML = `
                <span>#${penalty.player} - ${minutes}:${String(seconds).padStart(2, '0')}</span>
                <button type="button" class="adjust-penalty" aria-label="Ajuster la pénalité">&#9881;&#65039;</button>
                <button type="button" class="remove-penalty" aria-label="Supprimer la pénalité">&#10060;</button>
            `;

            div.querySelector('.adjust-penalty').addEventListener('click', function() {
                togglePenaltyAdjustForm(team, penalty.id);
            });

            div.querySelector('.remove-penalty').addEventListener('click', function() {
                removePenalty(team, penalty.id);
            });

            container.appendChild(div);
        });
    });
}

// Supprimer une pénalité
function removePenalty(team, penaltyId) {
    // Fermer tous les formulaires ouverts
    document.querySelectorAll('.penalty-input, .penalty-adjust-modal, .time-adjust-modal').forEach(form => {
        form.style.display = 'none';
    });

    setTeamPenalties(team, getTeamPenalties(team).filter(p => p.id !== penaltyId));

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

    [gameState.team1.penalties, gameState.team2.penalties].forEach(penalties => {
        penalties.forEach(penalty => {
            // N'ajuster que si la pénalité est active (temps restant différent du temps original)
            if (penalty.timeLeft !== penalty.originalTime) {
                penalty.timeLeft = Math.max(0, penalty.timeLeft + timeDifference);
            }
        });
    });
}

// Confirmer l'ajustement du temps
function confirmTimeAdjust() {
    const minutes = parseInt(document.getElementById('adjustMinutes').value);
    const seconds = parseInt(document.getElementById('adjustSeconds').value);
    const maxMinutes = gameState.config.periodDuration;

    if (!isNaN(minutes) && !isNaN(seconds) && minutes >= 0 && seconds >= 0 && seconds < 60 && minutes <= maxMinutes) {
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
        const penalty = getTeamPenalties(team).find(p => p.id === penaltyId);

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

        const penalties = getTeamPenalties(team);
        const penaltyIndex = penalties.findIndex(p => p.id === currentPenaltyToAdjust.id);
        if (penaltyIndex !== -1) {
            penalties[penaltyIndex].timeLeft = newTimeLeft;
        }

        document.getElementById(`penaltyAdjustForm${team}`).style.display = 'none';
        currentPenaltyToAdjust = { team: null, id: null };
        updateUI();
        saveGameState();
    }
}

// Remplir les champs de configuration depuis un preset
function populateConfigFields(preset) {
    document.getElementById('configPeriods').value = preset.periods;
    document.getElementById('configDuration').value = preset.periodDuration;
    document.getElementById('configPeriodName').value = preset.periodName;
    document.getElementById('configScoreName').value = preset.scoreName;
    document.getElementById('configIncrements').value = preset.scoreIncrements.join(', ');
    document.getElementById('configTimerDirection').value = preset.timerDirection;
    document.getElementById('configPenalties').checked = preset.penaltiesEnabled;
}

// Lire la configuration depuis le formulaire
function readConfigFromForm() {
    const periods = parseInt(document.getElementById('configPeriods').value) || 2;
    const periodDuration = parseInt(document.getElementById('configDuration').value) || 20;
    const periodName = document.getElementById('configPeriodName').value.trim() || 'Période';
    const scoreName = document.getElementById('configScoreName').value.trim() || 'Point';
    const incrementsStr = document.getElementById('configIncrements').value;
    const scoreIncrements = incrementsStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0);
    const timerDirection = document.getElementById('configTimerDirection').value;
    const penaltiesEnabled = document.getElementById('configPenalties').checked;

    return {
        periods: Math.max(1, periods),
        periodDuration: Math.max(1, periodDuration),
        periodName: periodName,
        scoreName: scoreName,
        scoreIncrements: scoreIncrements.length > 0 ? scoreIncrements : [1],
        penaltiesEnabled: penaltiesEnabled,
        defaultPenaltyDuration: 2,
        timerDirection: timerDirection
    };
}

// Handler du changement de preset
function onPresetChange() {
    const presetKey = document.getElementById('sportPreset').value;
    const preset = SPORT_PRESETS[presetKey];
    if (preset) {
        populateConfigFields(preset);
    }
}

// Gestion du match
function startGame() {
    const team1Name = document.getElementById('team1').value.trim();
    const team2Name = document.getElementById('team2').value.trim();
    const config = readConfigFromForm();

    if (config.periodDuration <= 0) {
        alert('Veuillez entrer une durée de période valide');
        return;
    }

    const timerMinutes = config.timerDirection === 'down' ? config.periodDuration : 0;

    gameState = {
        team1: { name: team1Name, score: 0, penalties: [] },
        team2: { name: team2Name, score: 0, penalties: [] },
        timer: {
            minutes: timerMinutes,
            seconds: 0,
            isRunning: false,
            halfTime: config.periodDuration,
            period: 1
        },
        config: config,
        gameStarted: true
    };

    buildScoreControls();
    applyPenaltyVisibility();
    updateUI();
    saveGameState();
}

function startNextPeriod() {
    const config = gameState.config;
    gameState.timer.period++;
    if (config.timerDirection === 'down') {
        gameState.timer.minutes = config.periodDuration;
        gameState.timer.seconds = 0;
    } else {
        gameState.timer.minutes = 0;
        gameState.timer.seconds = 0;
    }
    gameState.timer.isRunning = false;

    const label = getPeriodLabel(gameState.timer.period, config);
    showNotification('Début : ' + label);

    updateUI();
    saveGameState();
}

function endGame() {
    showNotification('Fin du match !');
    fireConfetti({
        particleCount: 200,
        spread: 160,
        origin: { y: 0.6 }
    });
}

// Initialisation des formulaires au chargement
document.addEventListener('DOMContentLoaded', function() {
    // Charger l'état du jeu
    loadGameState();

    // Remplir les champs de config avec le preset par défaut
    const presetSelect = document.getElementById('sportPreset');
    if (presetSelect) {
        populateConfigFields(SPORT_PRESETS[presetSelect.value] || DEFAULT_CONFIG);
        presetSelect.addEventListener('change', onPresetChange);
    }

    // Cacher tous les formulaires au démarrage
    document.querySelectorAll('.penalty-input, .penalty-adjust-modal, .time-adjust-modal').forEach(form => {
        form.style.display = 'none';
    });

    // Relancer le timer si le jeu était en cours
    if (gameState.timer.isRunning) {
        startTimer();
    }

    // Ajouter des gestionnaires d'événements pour les touches clavier
    document.addEventListener('keydown', function(event) {
        // Si un champ de saisie est actif, ne pas intercepter les touches
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
                event.preventDefault();
                toggleTimer();
                break;

            case 'ArrowLeft':
                event.preventDefault();
                addGoal(1);
                break;

            case 'ArrowRight':
                event.preventDefault();
                addGoal(2);
                break;
        }
    });

    // Améliorer la réactivité des boutons sur mobile
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function(event) {
            this.style.opacity = '0.7';
        });

        button.addEventListener('touchend', function(event) {
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
