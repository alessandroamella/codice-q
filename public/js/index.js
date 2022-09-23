const ABBREVIATIONS = {
    AR: "Fine della trasmissione",
    BK: "Segnale utilizzato per interrompere una trasmissione in atto (break)",
    CQ: "Chiamata a tutte le stazioni",
    CW: "Onda continua -Telegrafia",
    DE: "Utilizzato per separare l'indicativo di chiamata della stazione",
    K: "Invito a trasmettere",
    MSG: "Messaggio",
    PSE: "Per favore",
    RST: "Intellegibilità forza del segnale, tonalità",
    R: "Ricevuto",
    RX: "Ricevitore",
    SIG: "Segnale",
    TX: "Trasmettitore",
    UR: "Vostro",
    VA: "Fine dell'interruzione"
};

const Q_CODES = {
    QRK: "Qual è l'intellegibilità del mio segnale?",
    QRM: "Siete disturbati?",
    QRN: "Siete disturbati da rumori atmosferici?",
    QRO: "Debbo aumentare la potenza di emissione?",
    QRP: "Debbo diminuire la potenza di trasmissione?",
    QRS: "Debbo trasmettere più lentamente?",
    QRT: "Debbo cessare la trasmissione?",
    QRZ: "Da chi sono chiamato?",
    QRV: "Siete pronto?",
    QSB: "La forza dei miei segnali è variabile?",
    QSL: "Potete darmi accusa ricezione?",
    QSO: "Potete comunicare direttamente con?",
    QSY: "Debbo cambiare frequenza di trasmissione?",
    QRX: "Quando mi richiamerete?",
    QTH: "Qual è la vostra posizione in latitudine e longitudine?"
};

const state = {
    question: null,
    answer: null,
    isChecking: false
};

/** @returns {[index: number, string, string]} */
function getRandomTuple(obj) {
    const n = Math.floor(Math.random() * Object.keys(obj).length);
    return Object.entries(obj)[n];
}

function getSelectedQuestionType() {
    const val = document.querySelector('input[name="type"]:checked').value;
    return val === "abbr"
        ? ABBREVIATIONS
        : val === "q"
        ? Q_CODES
        : { ...ABBREVIATIONS, ...Q_CODES };
}

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function ask(obj) {
    const q = getRandomTuple(obj);

    const newAbbr = { ...obj };
    delete newAbbr[q[0]];

    const q2 = getRandomTuple(newAbbr);
    delete newAbbr[q2[0]];
    const q3 = getRandomTuple(newAbbr);

    const shuffled = [q, q2, q3].sort(() => 0.5 - Math.random());

    document.getElementById("question").textContent = q[0];
    const answersElem = document.getElementById("answers");
    answersElem.innerHTML = "";

    for (const s of shuffled) {
        const label = document.createElement("label");
        const input = document.createElement("input");
        input.type = "radio";
        input.name = "answer";
        input.value = s[0];
        const span = document.createElement("span");
        span.textContent = s[1];
        label.appendChild(input);
        label.appendChild(span);
        answersElem.appendChild(label);

        // const option = document.createElement("option");
        // option.value = s[0];
        // option.textContent = s[1];
        // answersElem.appendChild(option);
    }

    answersElem.childNodes[0].childNodes[0].setAttribute("checked", true);

    state.question = q[0];
    state.answer = q[1];
}

const checkBtn = document.getElementById("check");
function check() {
    const ansElem = document.querySelector('input[name="answer"]:checked');
    const ans = ansElem.parentElement.childNodes[1].textContent;
    const ansVal = ansElem.value;

    if (state.isChecking) {
        checkBtn.classList.remove("is-success");
        checkBtn.classList.remove("is-danger");
        state.isChecking = false;
        checkBtn.textContent = "Controlla";

        setCookie(
            "type",
            document.querySelector('input[name="type"]:checked').value
        );

        const currentQuestion = state.question;
        while (state.question === currentQuestion) {
            ask(getSelectedQuestionType());
        }
        checkBtn.classList.add("is-info");
    } else {
        checkBtn.classList.remove("is-info");
        if (ans === state.answer) {
            checkBtn.classList.add("is-success");
            checkBtn.innerHTML = "Corretto! &raquo;";
        } else {
            checkBtn.classList.add("is-danger");
            document
                .querySelector(`input[value="${ansVal}"]`)
                .classList.add("wrong");
            checkBtn.innerHTML = "Sbagliato! &raquo;";
        }
        document
            .querySelector(`input[value="${state.question}"]`)
            .classList.add("correct");
        state.isChecking = true;
    }
}

function start() {
    const type = getCookie("type") || "both";
    document.querySelector(`input[value="${type}"]`).checked = true;
    ask(getSelectedQuestionType());
}

document.getElementById("main-form").addEventListener("submit", e => {
    e.preventDefault();
    check();
    return false;
});

start();
