import { words as INITIAL_WORDS } from "./data.js";

const $time = document.querySelector("time");
const $paragraph = document.querySelector("p");
const $input = document.querySelector("#input");

const $game = document.querySelector("#game");
const $results = document.querySelector("#results");
const $exactitud = $results.querySelector("#results-exactitud");
const $button = document.querySelector("#reload-button");
const $ppm = document.querySelector("#results-wpm");

const INITIAL_TIME = 30;

let words = [];
let currentTime = INITIAL_TIME;

initGame();
initEvents();

function initGame() {
  $game.style.display = "flex";
  $results.style.display = "none";
  $input.value = "";
  $input.disabled = false;

  words = INITIAL_WORDS.toSorted(() => Math.random() - 0.5);
  currentTime = INITIAL_TIME;

  $time.textContent = currentTime;

  // Insertar palabras en el párrafo
  $paragraph.innerHTML = words
    .map((word, index) => {
      const letters = word.split("");

      return `<word>
                    ${letters
                      .map((letter) => `<letter>${letter}</letter>`)
                      .join("")}
                </word>`;
    })
    .join("");

  //Activar primera palbara y letra
  const $firstWord = $paragraph.querySelector("word");

  $firstWord.classList.add("active");
  $firstWord.querySelector("letter").classList.add("active");

  //Iniciar tiempo
  const intervalId = setInterval(() => {
    currentTime--;
    $time.textContent = currentTime;

    if (currentTime === 0) {
      clearInterval(intervalId);
      gameOver();
    }
  }, 1000);
}

function initEvents() {
  document.addEventListener("keydown", () => {
    $input.focus();
  });

  $input.addEventListener("keydown", onkeydown);
  $input.addEventListener("keyup", onkeyup);
  $button.addEventListener("click", initGame);
}

function onkeydown(event) {
  const $currentWord = $paragraph.querySelector("word.active");
  if (!$currentWord) return;

  const inputText = $input.value;

  const $currentLetter = $currentWord.querySelector("letter.active");

  const { key } = event;
  //Manejar espacios - moverse a la siguiente palabra
  if (key === " ") {
    event.preventDefault();

    const $nextWord = $currentWord.nextElementSibling;
    const $nextLetter = $nextWord.querySelector("letter");
    if (!$nextWord) {
      gameOver();
      return;
    }

    $currentWord.classList.remove("active", "marked");
    $currentLetter.classList.remove("active");

    $nextWord.classList.add("active");
    $nextLetter.classList.add("active");

    const hasMissedLetters =
      $currentWord.querySelectorAll("letter:not(.correct)").length > 0;

    const classToAdd = hasMissedLetters ? "marked" : "correct";
    $currentWord.classList.add(classToAdd);
    $input.value = "";
  }

  // Borrar letras
  if (key === "Backspace" && inputText.length === 0) {
    const $prevWord = $currentWord.previousElementSibling;
    const $prevLetter = $currentLetter.previousElementSibling;

    if (!$prevWord && !$prevLetter) {
      event.preventDefault();
      return;
    }

    const $wordMarked = $paragraph.querySelector("word.marked");

    if ($wordMarked && !$prevLetter) {
      event.preventDefault();
      $prevWord.classList.remove("marked");

      const $letterToGo = $prevWord.querySelector("letter:last-child");

      $currentLetter.classList.remove("active");
      $currentWord.classList.remove("active");
      $letterToGo.classList.add("active");
      $prevWord.classList.add("active");

      const prevWordValues = $prevWord.querySelectorAll(
        "letter.correct, letter.incorrect"
      );

      $input.value = [...prevWordValues]
        .map(($el) => {
          return $el.classList.contains("correct") ? $el.innerText : "*";
        })
        .join("");
    }
  }
}

function onkeyup(event) {
  const $currentWord = $paragraph.querySelector("word.active");
  const $currentLetter = $currentWord.querySelector("letter.active");

  const currentWord = $currentWord.innerText.trim();
  $input.maxLength = currentWord.length;

  const $allLetters = $currentWord.querySelectorAll("letter");

  $allLetters.forEach(($letter) =>
    $letter.classList.remove("correct", "incorrect")
  );

  $input.value.split("").forEach((e, index) => {
    const $letter = $allLetters[index];
    const letterToCheck = currentWord[index];

    const char = $input.value[index];

    //Revisar si es correcto solo la letra actual
    const isCorrect = char === letterToCheck;
    const letterClass = isCorrect ? "correct" : "incorrect";
    $letter.classList.add(letterClass);
  });

  //
  $currentLetter.classList.remove("active", "is-last");
  const inputLength = $input.value.length;
  const $nextActiveLetter = $allLetters[inputLength];

  if ($nextActiveLetter) {
    $allLetters[inputLength].classList.add("active");
  } else {
    $currentLetter.classList.add("active", "is-last");
  }
}

function gameOver() {
  // $game.style.display = "none";
  $results.style.display = "flex";
  $input.disabled = true;

  const correctWords = $paragraph.querySelectorAll("word.correct").length;
  const correctLetter = $paragraph.querySelectorAll("letter.correct").length;
  const incorrectLetter =
    $paragraph.querySelectorAll("letter.incorrect").length;

  const totalLetters = correctLetter + incorrectLetter;
  const exactitud = totalLetters > 0 ? (correctLetter / totalLetters) * 100 : 0;

  const ppm = (correctWords * 60) / INITIAL_TIME;
  $ppm.textContent = ppm;
  $exactitud.textContent = `${exactitud.toFixed(2)}%`;
}
