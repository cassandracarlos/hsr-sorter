let characters = [];
let comparisons = [];
let scores = {};
let current = 0;
let history = [];

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const resultsDiv = document.getElementById("results");
const refreshBtn = document.getElementById("refreshBtn");
const undoBtn = document.getElementById("undoBtn");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const progressContainer = document.getElementById("progressContainer");

// Load character data
fetch('characters.json')
.then(res => res.json())
.then(data => {
    characters = data;
    renderFilter();
});

// Start sorting
startSortBtn.onclick = () => {
    selectedCharacters = Array.from(checked).map(cb => characters[cb.value]);

    // Initialize sorter
    current = 0;
    history = [];
    initScores();
    generateComparisons();
    showNext();
};

// Init scores for selected characters
function initScores() {
    scores = {};
    selectedCharacters.forEach(char => scores[char.name] = 0);
}

// Generate pairwise comparisons
function generateComparisons() {
    comparisons = [];
    for (let i = 0; i < selectedCharacters.length; i++) {
        for (let j = i + 1; j < selectedCharacters.length; j++) {
            comparisons.push([selectedCharacters[i], selectedCharacters[j]]);
        }
    }
    shuffle(comparisons);
}

// Shuffle array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Show next comparison
function showNext() {
    updateProgress();

    if (current >= comparisons.length) {
        showResults();
        return;
    }

    const [left, right] = comparisons[current];
    leftBtn.textContent = left.name;
    rightBtn.textContent = right.name;

    undoBtn.style.display = history.length > 0 ? "inline-block" : "none";
}

// Handle vote
function vote(winner) {
    const currentPair = comparisons[current];
    history.push({ pair: currentPair, winner });
    scores[winner.name]++;
    current++;
    showNext();
}

// Undo vote
function undoLast() {
    if (history.length === 0 || current === 0) return;
    current--;
    const last = history.pop();
    scores[last.winner.name]--;
    showNext();
}

// Show results
function showResults() {
    const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([name], index) => `${index + 1}. ${name}`);

    resultsDiv.innerHTML = "<h2>Results</h2><p>" + sorted.join("<br>") + "</p>";
    refreshBtn.style.display = "inline-block";
    undoBtn.style.display = "none";
}

// Restart sorter
refreshBtn.onclick = () => {
    progressContainer.style.display = "none";
    document.getElementById("comparison").style.display = "none";
    document.getElementById("undoContainer").style.display = "none";
    refreshBtn.style.display = "none";
    resultsDiv.innerHTML = "";
    history = [];
    current = 0;
};

// Update progress bar
function updateProgress() {
    const total = comparisons.length;
    const percent = Math.round((current / total) * 100);
    const percentText = `${percent}%`;
    const countText = `${current} / ${total}`;

    progressBar.style.width = percent + "%";
    progressText.textContent = percentText;

    progressContainer.onmouseenter = () => {
        progressText.textContent = countText;
    };
    progressContainer.onmouseleave = () => {
        progressText.textContent = percentText;
    };
}

// Button listeners
leftBtn.onclick = () => vote(comparisons[current][0]);
rightBtn.onclick = () => vote(comparisons[current][1]);
undoBtn.onclick = undoLast;

// Keyboard support
document.addEventListener("keydown", function (event) {

    const key = event.key.toLowerCase();
        if (key === "arrowleft" || key === "a") {
            vote(comparisons[current][0]);
        } else if (key === "arrowright" || key === "d") {
            vote(comparisons[current][1]);
        } else if (key === "r" || event.key === "enter") {
            current = 0;
            history = [];
            initScores();
            generateComparisons();
            showNext();
        } else if (key === "backspace") {
            event.preventDefault();
            undoLast();
        }
});