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
        setInterval(alert('hello'), 1000);
    }
}

/***************************************************
 * Pause
 */

function pause() {

    // 1=pause, 0= game going on
    var pause;

    // get pause value
    if (localStorage.getItem("pause")) {
        // if yes, we get the stored score
        pause = localStorage.getItem('pause');
    } else {
        // if note we set it
        pause = 1;
        localStorage.setItem('pause', JSON.stringify(pause));
    }

    alert('pause is : ' + pause);

    // event listener
    document.getElementById('pause').onclick = function () {
        if (pause == 0) {
            localStorage.setItem('pause', 1);
        } else {
            localStorage.setItem('pause', 0);
        }
        init();
    }

    // texte depending of stats
    if (pause == 0) {
        document.getElementById('pause').innerHTML = 'restart timer';
    } else {
        document.getElementById('pause').innerHTML = 'make a pause';
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
    var gameTime = 500;
    localStorage.setItem('gameTime', JSON.stringify(gameTime));

    setInterval(alert('hello'), 1000);

    pause();

    timer('gameTime');


    getScore();

    // resetAll
    document.getElementById('resetAll').onclick = function () {
        resetAll();
    };

    //countdown();

}

window.onload = init;
timer ();