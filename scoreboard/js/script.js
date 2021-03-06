/***************************************************
 * Score Management
 */

function getScore () {
    var homeScore;
    var awayScore;

    // check if homeScore allready exist
    if (localStorage.getItem("homeScore")) {
        // if yes, we get the stored score
        homeScore = localStorage.getItem('homeScore');
    } else {
        // if note we set it to 0
        homeScore = 0;
        localStorage.setItem('homeScore', homeScore);
    }

    // check if awayScore allready exist
    if (localStorage.getItem("awayScore")) {
        // if yes, we get the stored score
        awayScore = localStorage.getItem('awayScore');
    } else {
        // if note we set it to 0
        awayScore = 0;
        localStorage.setItem('awayScore', awayScore);
    }

    // write scores
    writeScore('home', homeScore);
    writeScore('away', awayScore);

    // event listener
    document.getElementById('home_scorePlus').onclick = function () {
        var score = JSON.parse(localStorage.getItem('homeScore'));
        score++;
        localStorage.setItem('homeScore', JSON.stringify(score));
        writeScore('home', score);
    };
    document.getElementById('home_scoreMinus').onclick = function () {
        var score = JSON.parse(localStorage.getItem('homeScore'));
        if (score > 0) {
            score--;
        }
        localStorage.setItem('homeScore', JSON.stringify(score));
        writeScore('home', score);
    };
    document.getElementById('away_scorePlus').onclick = function () {
        var score = JSON.parse(localStorage.getItem('awayScore'));
        score++;
        localStorage.setItem('awayScore', JSON.stringify(score));
        writeScore('away', score);
    };
    document.getElementById('away_scoreMinus').onclick = function () {
        var score = JSON.parse(localStorage.getItem('awayScore'));
        if (score > 0) {
            score--;
        }
        localStorage.setItem('awayScore', JSON.stringify(score));
        writeScore('away', score);
    };
}

function writeScore(team, score) {
    if ('home' == team) {
        document.getElementById('home_score').innerHTML = score;
    }
    if ('away' == team) {
        document.getElementById('away_score').innerHTML = score;
    }
}

/***************************************************
 * Timer
 */

function timer(timerName) {

    var time;
    localStorage.setItem(timerName, time);

    // if the games is going on the countdown is updated
    if (localStorage.getItem('pause') == 0) {
        //setInterval(alert('hello'), 1000);
    }
}

/***************************************************
 * Pause
 */

function pause() {

    var pauseStatus;

    // set pause status if don't exist
    if (!localStorage.getItem('pauseStatus')) {
        // if note we set it
        localStorage.setItem('pauseStatus', JSON.stringify('1'));
        alert('Le statut de la pasue n est pas enregistré');
    }

    alert ('Statut de la pause est à : ' + JSON.parse(localStorage.getItem('pauseStatus')));

    // write the status
    pauseText();


    // event listener
    document.getElementById('pause').onclick = function () {
        if (JSON.parse(localStorage.getItem('pauseStatus')) == 0) {
            localStorage.setItem('pauseStatus', 1);
            pauseText();
        } else {
            localStorage.setItem('pauseStatus', 0);
            pauseText();
        }

    }

}

function pauseText () {
    if (JSON.parse(localStorage.getItem('pauseStatus')) == 1) {
        document.getElementById('pause').innerHTML = 'Start game';
    } else {
        document.getElementById('pause').innerHTML = 'Pause game';
    }
}

/***************************************************
 * Reset
 */

function resetAll (){

    // set scores to 0
    localStorage.setItem('homeScore', 0);
    localStorage.setItem('awayScore', 0);

    // set time to gameTime
    localStorage.setItem('time', localStorage.getItem('gameTime'));

    /* allready ready ...
    localStorage.removeItem('homeP1');
    localStorage.removeItem('homeP2');
    localStorage.removeItem('homeP3');
    localStorage.removeItem('awayP1');
    localStorage.removeItem('awayP2');
    localStorage.removeItem('awayP3');
    */
}


/***************************************************
 * Init
 */

function init() {

    // initialisation

    // variables
    // 1=pause, 0= game going on
    pause();

    var gameTime = 500;
    localStorage.setItem('gameTime', JSON.stringify(gameTime));


    timer('gameTime');


    getScore();

    // resetAll
    document.getElementById('resetAll').onclick = function () {
        resetAll();
    };

    //countdown();

}

window.onload = init;