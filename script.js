// Variables globales pour gérer l'état du jeu
let timer;                  // Timer pour le décompte du temps
let timeInSeconds;         // Temps restant en secondes
let isRunning = false;    // État du chronomètre (en marche ou en pause)
let currentPeriod = 1;    // Période actuelle (1 = première mi-temps, 2 = deuxième mi-temps)
let selectedTeam = null;  // Équipe sélectionnée pour une action (pénalité)
let selectedPenaltyIndex = null; // Index de la pénalité sélectionnée pour modification
let penalties = {         // Stockage des pénalités par équipe
    team1: [],
    team2: []
};

// Gestion des raccourcis clavier
document.addEventListener('keydown', handleKeyPress);

/**
 * Gère les événements clavier, notamment la barre d'espace pour le chronomètre
 * et les flèches pour les buts
 * @param {KeyboardEvent} event - L'événement clavier
 */
function handleKeyPress(event) {
    // Vérifier si une modale est ouverte
    const penaltyModal = document.getElementById('penaltyInput');
    const timeAdjustModal = document.getElementById('timeAdjustModal');
    const penaltyAdjustModal = document.getElementById('penaltyAdjustModal');
    
    // Vérifier si une modale est ouverte
    const isModalOpen = penaltyModal.style.display.includes('flex') || 
                       timeAdjustModal.style.display.includes('flex') || 
                       penaltyAdjustModal.style.display.includes('flex');
    
    // Ne pas réagir aux touches si une modale est ouverte ou si on est dans un champ de saisie
    if (!isModalOpen && event.target.tagName !== 'INPUT') {
        switch (event.code) {
            case 'Space':
                event.preventDefault(); // Empêcher le défilement de la page
                toggleTimer();
                break;
            case 'ArrowLeft':
                event.preventDefault();
                addGoal(1); // Ajouter un but à l'équipe 1 (gauche)
                break;
            case 'ArrowRight':
                event.preventDefault();
                addGoal(2); // Ajouter un but à l'équipe 2 (droite)
                break;
        }
    }
}

/**
 * Initialise le match avec les paramètres configurés
 */
function startGame() {
    const team1Name = document.getElementById('team1').value || 'Équipe 1';
    const team2Name = document.getElementById('team2').value || 'Équipe 2';
    const halfTimeMinutes = parseInt(document.getElementById('halfTime').value) || 45;

    // Mise à jour des noms d'équipe
    document.getElementById('team1Name').textContent = team1Name;
    document.getElementById('team2Name').textContent = team2Name;
    
    // Initialisation du temps
    timeInSeconds = halfTimeMinutes * 60;
    updateTimerDisplay();
    
    // Masquer la configuration
    document.querySelector('.configuration').style.display = 'none';
}

/**
 * Démarre ou met en pause le chronomètre
 */
function toggleTimer() {
    const button = document.getElementById('toggleTimer');
    if (!isRunning) {
        // Démarrage du chronomètre
        timer = setInterval(() => {
            updateTimer();
            updatePenaltiesTime();
        }, 1000);
        button.textContent = 'Pause';
        isRunning = true;
        
        // Activation des pénalités en attente
        ['team1', 'team2'].forEach(team => {
            penalties[team].forEach(penalty => {
                if (!penalty.active) {
                    penalty.active = true;
                }
            });
        });
    } else {
        // Mise en pause
        clearInterval(timer);
        button.textContent = 'Reprendre';
        isRunning = false;
    }
}

/**
 * Met à jour le chronomètre et gère les changements de période
 */
function updateTimer() {
    if (timeInSeconds > 0) {
        timeInSeconds--;
        updateTimerDisplay();
    } else {
        if (currentPeriod === 1) {
            // Passage à la mi-temps
            clearInterval(timer);
            isRunning = false;
            currentPeriod = 2;
            timeInSeconds = parseInt(document.getElementById('halfTime').value) * 60;
            document.getElementById('period').textContent = '2ème Mi-temps';
            document.getElementById('toggleTimer').textContent = 'Démarrer';
        } else {
            // Fin du match
            clearInterval(timer);
            isRunning = false;
            document.getElementById('period').textContent = 'Match Terminé';
            document.getElementById('toggleTimer').style.display = 'none';
            // Lancer les confettis
            celebrerFinMatch();
        }
    }
}

/**
 * Met à jour l'affichage du chronomètre
 */
function updateTimerDisplay() {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    const timer = document.getElementById('timer');
    timer.textContent = timeString;
    timer.setAttribute('aria-label', `Temps restant : ${minutes} minutes et ${seconds} secondes`);
}

/**
 * Affiche la modale d'ajustement du temps
 */
function showTimeAdjust() {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    document.getElementById('adjustMinutes').value = minutes;
    document.getElementById('adjustSeconds').value = seconds;
    document.getElementById('timeAdjustModal').style.display = 'flex';
}

/**
 * Confirme l'ajustement du temps de match
 */
function confirmTimeAdjust() {
    const minutes = parseInt(document.getElementById('adjustMinutes').value) || 0;
    const seconds = parseInt(document.getElementById('adjustSeconds').value) || 0;
    const newTimeInSeconds = (minutes * 60) + seconds;
    
    if (newTimeInSeconds >= 0) {
        const timeDiff = newTimeInSeconds - timeInSeconds;
        timeInSeconds = newTimeInSeconds;
        updateTimerDisplay();
        // Ajuster les temps des pénalités actives
        adjustPenaltiesTime(timeDiff);
    }
    
    cancelTimeAdjust();
}

/**
 * Ferme la modale d'ajustement du temps
 */
function cancelTimeAdjust() {
    document.getElementById('timeAdjustModal').style.display = 'none';
    document.getElementById('adjustMinutes').value = '';
    document.getElementById('adjustSeconds').value = '';
}

/**
 * Ajuste le temps des pénalités actives
 * @param {number} timeDiff - Différence de temps en secondes
 */
function adjustPenaltiesTime(timeDiff) {
    ['team1', 'team2'].forEach(team => {
        penalties[team].forEach(penalty => {
            // Ajuster seulement les pénalités actives
            if (penalty.active) {
                penalty.timeRemaining = Math.max(0, penalty.timeRemaining + timeDiff);
            }
        });
        updatePenaltiesDisplay(team.slice(-1));
    });
}

/**
 * Ajoute un but à l'équipe spécifiée
 * @param {number} team - Numéro de l'équipe (1 ou 2)
 */
function addGoal(team) {
    const scoreElement = document.getElementById(`score${team}`);
    const currentScore = parseInt(scoreElement.textContent);
    scoreElement.textContent = currentScore + 1;
}

/**
 * Retire un but à l'équipe spécifiée
 * @param {number} team - Numéro de l'équipe (1 ou 2)
 */
function removeGoal(team) {
    const scoreElement = document.getElementById(`score${team}`);
    const currentScore = parseInt(scoreElement.textContent);
    if (currentScore > 0) {
        scoreElement.textContent = currentScore - 1;
    }
}

/**
 * Affiche la modale d'ajout de pénalité
 * @param {number} team - Numéro de l'équipe (1 ou 2)
 */
function addPenalty(team) {
    selectedTeam = team;
    document.getElementById('penaltyInput').style.display = 'flex';
}

/**
 * Confirme l'ajout d'une nouvelle pénalité
 */
function confirmPenalty() {
    const playerNumber = document.getElementById('playerNumber');
    const penaltyTime = document.getElementById('penaltyTime');
    const reason = document.getElementById('penaltyReason').value;

    // Validation avec messages d'erreur accessibles
    let errorMessage = '';
    if (!playerNumber.value) {
        errorMessage = 'Le numéro du joueur est requis';
        playerNumber.setAttribute('aria-invalid', 'true');
    } else {
        playerNumber.removeAttribute('aria-invalid');
    }

    if (!penaltyTime.value || parseInt(penaltyTime.value) <= 0) {
        errorMessage += errorMessage ? ' et la ' : 'La ';
        errorMessage += 'durée de la pénalité doit être supérieure à 0';
        penaltyTime.setAttribute('aria-invalid', 'true');
    } else {
        penaltyTime.removeAttribute('aria-invalid');
    }

    if (errorMessage) {
        showError(errorMessage);
        return;
    }

    const penalty = {
        player: playerNumber.value,
        time: parseInt(penaltyTime.value),
        timeRemaining: parseInt(penaltyTime.value) * 60,
        reason: reason,
        timeStamp: new Date(),
        active: isRunning
    };

    penalties[`team${selectedTeam}`].push(penalty);
    updatePenaltiesDisplay(selectedTeam);
    
    // Annonce pour les lecteurs d'écran
    announceMessage(`Pénalité ajoutée pour le joueur numéro ${penalty.player}, durée : ${penalty.time} minutes`);
    
    cancelPenalty();
}

/**
 * Ferme la modale d'ajout de pénalité
 */
function cancelPenalty() {
    document.getElementById('penaltyInput').style.display = 'none';
    document.getElementById('playerNumber').value = '';
    document.getElementById('penaltyTime').value = '2';
    document.getElementById('penaltyReason').value = '';
    selectedTeam = null;
}

/**
 * Met à jour le temps restant des pénalités actives
 */
function updatePenaltiesTime() {
    let updated = false;
    ['team1', 'team2'].forEach(team => {
        penalties[team] = penalties[team].filter(penalty => {
            if (penalty.timeRemaining > 0) {
                if (penalty.active) {
                    penalty.timeRemaining--;
                }
                updated = true;
                return true;
            }
            return false;
        });
        if (updated) {
            updatePenaltiesDisplay(team.slice(-1));
        }
    });
}

/**
 * Formate un nombre de secondes en chaîne MM:SS
 * @param {number} seconds - Nombre de secondes à formater
 * @returns {string} Temps formaté
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Met à jour l'affichage des pénalités d'une équipe
 * @param {string} team - Numéro de l'équipe (1 ou 2)
 */
function updatePenaltiesDisplay(team) {
    const penaltiesContainer = document.getElementById(`penalties${team}`);
    penaltiesContainer.innerHTML = '';
    
    penalties[`team${team}`].forEach((penalty, index) => {
        const penaltyElement = document.createElement('div');
        penaltyElement.className = 'penalty-item';
        penaltyElement.setAttribute('role', 'listitem');
        const timeRemaining = formatTime(penalty.timeRemaining);
        const statusIcon = penalty.active ? '▶️' : '⏸️';
        const statusText = penalty.active ? 'active' : 'en attente';
        
        // Création du contenu accessible
        const penaltyText = `${statusIcon} Joueur numéro ${penalty.player} - ${timeRemaining} (${penalty.time} minutes) ${penalty.reason ? '- ' + penalty.reason : ''}`;
        penaltyElement.textContent = penaltyText;
        
        // Ajout des attributs d'accessibilité
        penaltyElement.setAttribute('aria-label', 
            `Pénalité ${statusText} pour le joueur numéro ${penalty.player}, temps restant : ${timeRemaining}`);
        
        // Ajouter le bouton d'ajustement
        const adjustButton = document.createElement('button');
        adjustButton.textContent = '⚙️';
        adjustButton.className = 'adjust-penalty-time';
        adjustButton.setAttribute('aria-label', `Ajuster le temps de pénalité du joueur ${penalty.player}`);
        adjustButton.onclick = () => showPenaltyTimeAdjust(team, index);
        penaltyElement.appendChild(adjustButton);

        if (penalty.timeRemaining <= 30) {
            penaltyElement.style.color = '#B71C1C';
            penaltyElement.setAttribute('data-time-critical', 'true');
            penaltyElement.setAttribute('aria-label', 
                `Attention, pénalité ${statusText} pour le joueur numéro ${penalty.player}, temps restant critique : ${timeRemaining}`);
        }
        penaltiesContainer.appendChild(penaltyElement);
    });
}

/**
 * Affiche la modale d'ajustement du temps d'une pénalité
 * @param {string} team - Numéro de l'équipe (1 ou 2)
 * @param {number} index - Index de la pénalité dans le tableau
 */
function showPenaltyTimeAdjust(team, index) {
    const penalty = penalties[`team${team}`][index];
    const minutes = Math.floor(penalty.timeRemaining / 60);
    const seconds = penalty.timeRemaining % 60;
    
    document.getElementById('adjustPenaltyMinutes').value = minutes;
    document.getElementById('adjustPenaltySeconds').value = seconds;
    
    selectedTeam = team;
    selectedPenaltyIndex = index;
    document.getElementById('penaltyAdjustModal').style.display = 'flex';
}

/**
 * Confirme l'ajustement du temps d'une pénalité
 */
function confirmPenaltyTimeAdjust() {
    const minutes = parseInt(document.getElementById('adjustPenaltyMinutes').value) || 0;
    const seconds = parseInt(document.getElementById('adjustPenaltySeconds').value) || 0;
    const newTimeInSeconds = (minutes * 60) + seconds;
    
    if (newTimeInSeconds >= 0) {
        const penalty = penalties[`team${selectedTeam}`][selectedPenaltyIndex];
        penalty.timeRemaining = newTimeInSeconds;
        updatePenaltiesDisplay(selectedTeam);
    }
    
    cancelPenaltyTimeAdjust();
}

/**
 * Ferme la modale d'ajustement du temps d'une pénalité
 */
function cancelPenaltyTimeAdjust() {
    document.getElementById('penaltyAdjustModal').style.display = 'none';
    document.getElementById('adjustPenaltyMinutes').value = '';
    document.getElementById('adjustPenaltySeconds').value = '';
    selectedTeam = null;
    selectedPenaltyIndex = null;
}

/**
 * Affiche un message d'erreur accessible
 * @param {string} message - Message d'erreur à afficher
 */
function showError(message) {
    // Supprime l'ancien message d'erreur s'il existe
    const oldError = document.querySelector('.error-message');
    if (oldError) {
        oldError.remove();
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.setAttribute('role', 'alert');
    errorDiv.textContent = message;
    
    // Ajoute le message d'erreur au formulaire approprié
    const form = document.querySelector('.penalty-form');
    form.insertBefore(errorDiv, form.firstChild);
}

/**
 * Annonce un message aux lecteurs d'écran
 * @param {string} message - Message à annoncer
 */
function announceMessage(message) {
    const announcer = document.createElement('div');
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    announcer.className = 'sr-only';
    announcer.textContent = message;
    document.body.appendChild(announcer);
    
    // Supprime l'élément après l'annonce
    setTimeout(() => {
        announcer.remove();
    }, 3000);
}

/**
 * Lance une animation de confettis
 */
function celebrerFinMatch() {
    // Durée totale de l'animation en millisecondes
    const duree = 3000;
    const fin = Date.now() + duree;

    // Fonction pour créer un canon à confettis
    function lancerConfettis() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#0D47A1', '#1565C0', '#1976D2', '#2196F3', '#64B5F6']
        });
    }

    // Lance les confettis toutes les 250ms
    const interval = setInterval(() => {
        if (Date.now() > fin) {
            clearInterval(interval);
            return;
        }
        lancerConfettis();
    }, 250);

    // Annonce pour les lecteurs d'écran
    announceMessage("Félicitations ! Le match est terminé !");
}

// Initialisation des scores
document.getElementById('score1').textContent = '0';
document.getElementById('score2').textContent = '0'; 