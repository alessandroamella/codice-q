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
    QRQ: "Debbo trasmettere più velocemente?",
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

const PREFIXES = {
    I0: "LAZIO - UMBRIA",
    IS0: "SARDEGNA",
    I1: "LIGURIA - PIEMONTE",
    IX1: "VALLE D’AOSTA",
    I2: "LOMBARDIA",
    I3: "VENETO",
    IN3: "TRENTINO ALTO ADIGE",
    IV3: "FRIULI VENEZIA GIULIA",
    I4: "EMILIA ROMAGNA",
    I5: "TOSCANA",
    I6: "MARCHE - ABRUZZO",
    I7: "PUGLIA - MATERA",
    I8: "BASILICATA - MOLISE - CAMPANIA - CALABRIA",
    IT9: "SICILIA"
};

const state = {
    question: null,
    answer: null,
    isChecking: false,
    isHard: false,
    last10Questions: []
};

/** @returns {[index: number, string, string]} */
function getRandomTuple(obj) {
    const n = Math.floor(Math.random() * Object.keys(obj).length);
    return Object.entries(obj)[n];
}

function objectFlip(obj) {
    const ret = {};
    Object.keys(obj).forEach(key => {
        ret[obj[key]] = key;
    });
    return ret;
}

function getSelectedQuestionType() {
    const val = document.querySelector('input[name="type"]:checked').value;
    const inverted = invertedElem.checked;
    const obj =
        val === "abbr" ? ABBREVIATIONS : val === "q" ? Q_CODES : PREFIXES;
    return inverted ? objectFlip(obj) : obj;
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

    delete newAbbr[q3[0]];
    const q4 = getRandomTuple(newAbbr);

    const answersElem = document.getElementById("answers");
    answersElem.innerHTML = "";

    document.getElementById("question").textContent = q[0];

    if (hardElem.checked) {
        const input = document.createElement("input");
        input.classList.add("input");
        input.id = "hard-input";
        input.type = "text";
        input.placeholder = q2[1] + "...";
        input.required = true;
        input.autocomplete = "off";

        answersElem.appendChild(input);
    } else {
        const shuffled = [q, q2, q3, q4].sort(() => 0.5 - Math.random());

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
    }

    state.isHard = hardElem.checked;
    setCookie("inverted", invertedElem.checked);
    setCookie("hard", hardElem.checked);

    state.question = q[0];
    state.answer = q[1];

    if (hardElem.checked) {
        document.getElementById("hard-input").focus();
    }
}

const checkBtn = document.getElementById("check");
function check() {
    const ansElem = state.isHard
        ? document.getElementById("hard-input")
        : document.querySelector('input[name="answer"]:checked');
    const ans = state.isHard
        ? ansElem.value
        : ansElem.parentElement.childNodes[1].textContent;
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

        state.last10Questions.push(state.question);
        if (state.last10Questions.length > 10) {
            state.last10Questions.shift();
        }

        while (state.last10Questions.includes(state.question.toString())) {
            console.log(
                "skippo",
                state.question.toString(),
                "!! contenuto in",
                state.last10Questions
            );
            ask(getSelectedQuestionType());
        }

        checkBtn.classList.add("is-link");
    } else {
        checkBtn.classList.remove("is-link");
        if (ans.toLowerCase() === state.answer.toLowerCase()) {
            checkBtn.classList.add("is-success");
            checkBtn.innerHTML = "Corretto! &raquo;";

            if (state.isHard) {
                document.getElementById("hard-input").style.backgroundColor =
                    "#ccffcc";
            }
        } else {
            checkBtn.classList.add("is-danger");
            if (!state.isHard) {
                document
                    .querySelector(`input[value="${ansVal}"]`)
                    .classList.add("wrong");
            } else {
                document.getElementById("hard-input").style.backgroundColor =
                    "#ffcccc";
            }
            checkBtn.innerHTML = "Sbagliato! &raquo;";
        }
        if (!state.isHard) {
            document
                .querySelector(`input[value="${state.question}"]`)
                .classList.add("correct");
        }
        state.isChecking = true;
    }

    if (state.isHard && state.isChecking) {
        const span = document.createElement("span");
        span.textContent = state.answer;
        span.classList.add("has-text-weight-bold");
        span.classList.add("is-underlined");
        span.classList.add("p-1");
        span.style.backgroundColor = "#ccffcc";
        span.style.borderRadius = "7px";

        document.getElementById("question").textContent += " ";
        document.getElementById("question").appendChild(span);
    }

    if (!state.isChecking) {
        document.getElementById("answers").style.border = hardElem.checked
            ? "hidden"
            : "1px solid #1E90FF";
    }
}

function start() {
    const type = getCookie("type") || "q";
    const inverted = getCookie("inverted") === "true";
    const hard = getCookie("hard") === "true";

    document.querySelector(`input[value="${type}"]`).checked = true;
    invertedElem.checked = inverted;
    hardElem.checked = hard;

    if (inverted) {
        hardElem.removeAttribute("disabled");
    }
    if (hard) {
        document.getElementById("answers").style.border = "hidden";
    }

    ask(getSelectedQuestionType());
}

document.getElementById("main-form").addEventListener("submit", e => {
    e.preventDefault();
    check();
    return false;
});

const hardElem = document.getElementById("hard");
const invertedElem = document.getElementById("inverted");
invertedElem.addEventListener("change", e => {
    if (e.target.checked) {
        hardElem.removeAttribute("disabled");
    } else {
        hardElem.checked = false;
        hardElem.setAttribute("disabled", true);
    }
});

start();
