function writeScore(team, score) {
    if ('home' == team) {
        document.getElementById('home_score').innerHTML = score;
    }
    if ('away' == team) {
        document.getElementById('away_score').innerHTML = score;
    }

}

function init() {
    // initialisation
    var homeScore = 0;
    var awayScore = 0;


    // event listener
    document.getElementById('home_scorePlus').onclick = function () {
        homeScore++;
        writeScore('home', homeScore);
    };
    document.getElementById('home_scoreMinus').onclick = function () {
        homeScore--;
        writeScore('home', homeScore);
    };
    document.getElementById('away_scorePlus').onclick = function () {
        awayScore++;
        writeScore('away', awayScore);
    };
    document.getElementById('away_scoreMinus').onclick = function () {
        awayScore--;
        writeScore('away', awayScore);
    };
}

window.onload = init;