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
        score = JSON.parse(localStorage.getItem('homeScore'));
        score++;
        localStorage.setItem('homeScore', JSON.stringify(score));
        writeScore('home', score);
    };
    document.getElementById('home_scoreMinus').onclick = function () {
        score = JSON.parse(localStorage.getItem('homeScore'));
        score--;
        localStorage.setItem('homeScore', JSON.stringify(score));
        writeScore('home', score);
    };
    document.getElementById('away_scorePlus').onclick = function () {
        score = JSON.parse(localStorage.getItem('awayScore'));
        score++;
        localStorage.setItem('awayScore', JSON.stringify(score));
        writeScore('away', score);
    };
    document.getElementById('away_scoreMinus').onclick = function () {
        score = JSON.parse(localStorage.getItem('awayScore'));
        score--;
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
 * Countdown
 */

function countdown() {
    var time;
    var timepause;

    // check if timepause allready exist
    if (localStorage.getItem("timepause")) {
        // if yes, we get the stored score
        timepause = localStorage.getItem('timepause');
    } else {
        // if note we set it
        timepause = 1;
        localStorage.setItem('timepause', timepause);
    }

    // check if time allready exist
    if (localStorage.getItem("time")) {
        // if yes, we get the stored score
        time = localStorage.getItem('time');
    } else {
        // if note we set it
        time = 60;
        localStorage.setItem('time', time);
    }

    // if the games is going on the countdown is updated
    if (timepause != 1) {
        updateCoundown();
        setInterval(updateCoundown, 1000);
        document.getElementById('time').className = '';
    } else {
        writeCountdown(time);
        document.getElementById('time').className = 'pause';
    }

}

// transforme 'time' in readable format and write it
function writeCountdown (time){
    temps = new Date();
    temps.setTime(time*1000);
    newTemps = ((temps.getHours()-1)+":"+temps.getMinutes()+":"+temps.getSeconds());
    document.getElementById('time').innerHTML = newTemps;
}

function updateCoundown() {
    time = localStorage.getItem('time');
    time--;
    if (time <= 0) {
        alert('time off');
        localStorage.setItem('timepause', 1);
    }
    localStorage.setItem('time', time);
    writeCountdown(time);
}

/*
function timer(timeLeft) {

    if (timeLeft > 0 && timepause != 0) {
        //setInterval(timeLeft--, 1000);
    }

    alert('time left : ' + timeLeft);
    return timeLeft;
}
*/

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

    init();
}


/***************************************************
 * Init
 */

function init() {

    // initialisation

    // variables
    var gameTime = 600
    localStorage.setItem('gameTime', JSON.stringify(gameTime));

    getScore();

    // resetAll
    document.getElementById('resetAll').onclick = function () {
        resetAll();
    };

    countdown();

}

window.onload = init;