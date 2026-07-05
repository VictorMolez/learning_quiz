let verbs = [];
let importedFiles = [];
let currentFileIndex = -1;

// Fonction pour lire le fichier de mémoire
function readMemoryFile() {
    const data = localStorage.getItem('importedFiles');
    return data ? JSON.parse(data) : { imported_files: [] };
}

// Fonction pour écrire dans le fichier de mémoire
function writeMemoryFile(data) {
    localStorage.setItem('importedFiles', JSON.stringify(data));
}

// Fonction pour mettre à jour la liste des fichiers importés
function updateFileList() {
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = '';
    importedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        if (index === currentFileIndex) {
            fileItem.classList.add('selected');
        }

        const fileName = document.createElement('span');
        fileName.textContent = file.name;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Supprimer';
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            importedFiles.splice(index, 1);
            writeMemoryFile({ imported_files: importedFiles });
            updateFileList();
            if (currentFileIndex === index) {
                verbs = [];
                document.getElementById('card-container').innerHTML = '';
                document.getElementById('checkbox-container').innerHTML = '';
                currentFileIndex = -1;
            } else if (currentFileIndex > index) {
                currentFileIndex--;
            }
        });

        fileItem.appendChild(fileName);
        fileItem.appendChild(deleteButton);
        fileItem.addEventListener('click', () => {
            document.querySelectorAll('.file-item').forEach(item => {
                item.classList.remove('selected');
            });
            fileItem.classList.add('selected');
            currentFileIndex = index;
            verbs = file.content;
            updateVerbIds();
            createCards();
            createCheckboxes();
        });

        fileList.appendChild(fileItem);
    });
}

// Fonction pour mettre à jour les noms de fichiers en mode quiz
function updateFileNamesInQuiz() {
    const fileNamesContainer = document.getElementById('file-names-container');
    fileNamesContainer.innerHTML = '';
    importedFiles.forEach((file, index) => {
        const fileNameItem = document.createElement('span');
        fileNameItem.className = 'file-name-item';
        if (index === currentFileIndex) {
            fileNameItem.classList.add('selected');
        }
        fileNameItem.textContent = file.name;
        fileNameItem.addEventListener('click', () => {
            document.querySelectorAll('.file-name-item').forEach(item => {
                item.classList.remove('selected');
            });
            fileNameItem.classList.add('selected');
            currentFileIndex = index;
            verbs = file.content;
            updateVerbIds();
            createCheckboxes();
        });
        fileNamesContainer.appendChild(fileNameItem);
    });
}

// Ajouter une ID unique à chaque mot
function updateVerbIds() {
    verbs = verbs.map((verb, index) => ({
        id: index,
        kanji: verb.kanji,
        hiragana: verb.hiragana,
        translation: verb.translation
    }));
}

function createCards() {
    const container = document.getElementById('card-container');
    container.innerHTML = '';
    verbs.forEach(verb => {
        const card = document.createElement('div');
        card.className = 'card';

        const cardInner = document.createElement('div');
        cardInner.className = 'card-inner';

        const cardFront = document.createElement('div');
        cardFront.className = 'card-front';
        cardFront.innerHTML = `<div>${verb.kanji}</div><div class="pronunciation">${verb.hiragana}</div>`;

        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        cardBack.textContent = verb.translation;

        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        card.appendChild(cardInner);

        card.addEventListener('click', () => {
            if (cardInner.style.transform === 'rotateY(180deg)') {
                cardInner.style.transform = 'rotateY(0deg)';
            } else {
                cardInner.style.transform = 'rotateY(180deg)';
            }
        });

        container.appendChild(card);
    });
}

function createCheckboxes() {
    const container = document.getElementById('checkbox-container');
    container.innerHTML = '';
    verbs.forEach((verb, index) => {
        const checkboxItem = document.createElement('div');
        checkboxItem.className = 'checkbox-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `verb-${index}`;
        checkbox.value = index;

        const label = document.createElement('label');
        label.htmlFor = `verb-${index}`;
        label.textContent = `${verb.kanji} (${verb.hiragana}) - ${verb.translation}`;

        checkboxItem.appendChild(checkbox);
        checkboxItem.appendChild(label);
        container.appendChild(checkboxItem);
    });
}

document.getElementById('free-mode').addEventListener('click', () => {
    document.getElementById('card-container').style.display = 'flex';
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('file-list').style.display = 'flex';
});

document.getElementById('quiz-mode').addEventListener('click', () => {
    document.getElementById('card-container').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'flex';
    document.getElementById('file-list').style.display = 'none';
    updateFileNamesInQuiz();
});

document.getElementById('import-words').addEventListener('click', () => {
    document.getElementById('file-input').click();
});

document.getElementById('file-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedVerbs = JSON.parse(e.target.result);
                importedFiles.push({ name: file.name, content: importedVerbs });
                writeMemoryFile({ imported_files: importedFiles });
                updateFileList();
                updateFileNamesInQuiz();
                alert("Mots importés avec succès!");
            } catch (error) {
                alert("Erreur lors de l'importation du fichier JSON. Veuillez vérifier le format du fichier.");
            }
        };
        reader.readAsText(file);
    }
});

document.getElementById('start-quiz').addEventListener('click', () => {
    selectedVerbs = [];
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        selectedVerbs.push(verbs[parseInt(checkbox.value)]);
    });

    if (selectedVerbs.length === 0) {
        alert("Veuillez sélectionner au moins un verbe pour le quiz.");
        return;
    }

    startQuiz();
});

let selectedVerbs = [];
let currentQuizVerbs = [];
let currentVerbIndex = 0;
let score = 0;

function startQuiz() {
    document.getElementById('file-names-container').classList.add('hidden');
    document.getElementById('checkbox-container').classList.add('hidden');
    document.getElementById('start-quiz').classList.add('hidden');

    currentQuizVerbs = [...selectedVerbs];
    currentQuizVerbs.sort(() => Math.random() - 0.5);
    currentVerbIndex = 0;
    score = 0;

    showNextQuestion();
}

function showNextQuestion() {
    const quizQuestion = document.getElementById('quiz-question');
    const quizOptions = document.getElementById('quiz-options');
    const submitButton = document.getElementById('submit-answer');
    const quizResult = document.getElementById('quiz-result');

    quizQuestion.innerHTML = '';
    quizOptions.innerHTML = '';
    quizResult.textContent = '';

    if (currentVerbIndex >= currentQuizVerbs.length) {
        quizQuestion.textContent = `Quiz terminé! Votre score: ${score}/${currentQuizVerbs.length}`;
        document.getElementById('file-names-container').classList.remove('hidden');
        document.getElementById('checkbox-container').classList.remove('hidden');
        document.getElementById('start-quiz').classList.remove('hidden');
        return;
    }

    const currentVerb = currentQuizVerbs[currentVerbIndex];
    quizQuestion.textContent = currentVerb.kanji;

    const options = [...selectedVerbs];
    options.sort(() => Math.random() - 0.5);
    const correctOptionIndex = Math.floor(Math.random() * options.length);
    const numOptions = Math.min(5, options.length);

    const uniqueOptions = [];
    uniqueOptions.push(currentVerb);

    while (uniqueOptions.length < numOptions) {
        const randomVerb = selectedVerbs[Math.floor(Math.random() * selectedVerbs.length)];
        if (!uniqueOptions.some(verb => verb.id === randomVerb.id)) {
            uniqueOptions.push(randomVerb);
        }
    }

    uniqueOptions.sort(() => Math.random() - 0.5);

    uniqueOptions.forEach((verb, index) => {
        const option = document.createElement('div');
        option.className = 'quiz-option';
        option.textContent = verb.translation;
        option.addEventListener('click', () => {
            document.querySelectorAll('.quiz-option').forEach(opt => {
                opt.style.backgroundColor = '#fff';
            });
            option.style.backgroundColor = '#f0f0f0';
            submitButton.style.display = 'block';
            submitButton.onclick = () => {
                if (verb.id === currentVerb.id) {
                    quizResult.textContent = 'Correct!';
                    quizResult.style.color = 'green';
                    score++;
                } else {
                    quizResult.textContent = `Faux! La bonne réponse est: ${currentVerb.translation}`;
                    quizResult.style.color = 'red';
                }
                submitButton.style.display = 'none';
                currentVerbIndex++;
                setTimeout(showNextQuestion, 1000);
            };
        });
        quizOptions.appendChild(option);
    });
}

// Initialiser l'application
function init() {
    const memory = readMemoryFile();
    importedFiles = memory.imported_files;
    updateFileList();
}

// Démarrer l'application
init();
