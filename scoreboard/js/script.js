function writeScore(team, score) {
    if ('home' == team) {
        document.getElementById('home_score').innerHTML = score;
    }
    if ('away' == team) {
        document.getElementById('away_score').innerHTML = score;
    }
}

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
}

function init() {
    // initialisation
    getScore();

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

window.onload = init;