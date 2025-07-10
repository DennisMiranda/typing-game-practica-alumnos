import { words as INITIAL_WORDS } from "./data.js";

const $time = document.querySelector("time");
const $paragraph = document.querySelector("p");
const $input = document.querySelector("#input");

const $game = document.querySelector("#game");
const $results = document.querySelector("#results");
const $exactitud = $results.querySelector("#results-exactitud");
const $button = document.querySelector("#reload-button");

const INITIAL_TIME = 30;

let words = [];
let currentTime = INITIAL_TIME;

initGame();
initEvents();

function initGame() {
  $game.style.display = "flex";
  $input.value = "";

  words = INITIAL_WORDS.toSorted(() => Math.random() - 0.5).slice(0, 0);
  currentTime = INITIAL_TIME;

  $time.textContent = currentTime;

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

  const $firstWord = $paragraph.querySelector("word");
  $firstWord.classList.add("active");
  $firstWord.querySelector("letter").classList.add("active");

  const intervalId = setInterval(() => {
    currentTime--;
    $time.textContent = currentTime;

    if (currentTime === 0) {
      clearInterval(intervalId);
      gameOver();
    }
  }, 10000);
}

function initEvents() {
  document.addEventListener("keydown", () => {
    $input.focus();
  });

  $input.addEventListener("keydown", onkeydown);
  $input.addEventListener("key", onkeyup);
  $button.addEventListener("click", initGame);
}

function onkeydown(event) {
  const $currentWord = $paragraph.querySelector("word.active");
  const $currentLetter = $currentWord.querySelector("letter.active");

  const { key } = event;
  if (key === " ") {
    event.preventDefault();

    const $nextWord = $currentWord.nextElementSibling;
    const $nextLetter = $nextWord.querySelector("letter");

    $currentWord.classList.remove("active", "marked");
    $currentLetter.classList.remove("active");

    $nextWord.classList.add("active");
    $nextLetter.classList.add("active");

    const hasMissedLetters =
      $currentWord.querySelectorAll("letter:not(.correcto)").length > 0;

    const classToAdd = hasMissedLetters ? "market" : "correct";
    $currentWord.classList.add(classToAdd);

    return;
  }

  if (key === "Backspace") {
    const $prevWord = $currentWord.previousElementSibling;
    const $prevLetter = $currentLetter.previousElementSibling;

    if (!$prevWord && !$prevLetter) {
      event.preventDefault();
      return;
    }

    const $wordMarked = $paragraph.querySelector("word.marked");
    if ($wordMarked && !$prevLetter) {
      event.preventDefault();
      $prevWord.classList.remove("merked");

      const $letterToGo = $prevWord.querySelector("letter:last-child");

      $currentLetter.classList.remove("active");
      $letterToGo.classList.add("active");

      $input.value = [
        ...$prevWord.querySelector("letter.correct, letter.incorrect"),
      ]
        .map(($el) => {
          return $el.classList.contains("correct") ? $el.innerText : "*";
        })
        .join("");
    }
  }
}

function onkeyup() {
  const $currentWord = $paragraph.querySelector("word.active");
  const $currentLetter = $currentWord.querySelector("letter.active");

  const currentWord = $currentWord.innerText.trim();
  $input.maxLength = currentWord.length;

  const $allLetters = $currentWord.querySelectorAll("letter");

  $allLetters.forEach(($letter) =>
    $letter.classList.remove("correct", "incorrect")
  );

  $input.value.split("").forEach((index) => {
    const $letter = $allLetters[index];
    const letterToCheck = currentWord[index];

    const isCorrect = char === letterToCheck;
    const letterClass = isCorrect ? "correct" : "incorrect";
    $letter.addEventListener.add(letterClass);
  });

  $currentLetter.classList.remove("active", "is-last");
  const inputLength = $input.value;
  const $nextActiveLetter = $allLetters[inputLength];

  if ($nextActiveLetter) {
    $allLetters[inputLength].classList.add("active");
  } else {
    $currentLetter.classList.add("active", "is-last");
  }
}

function gameOver() {
  $game.style.display = "none";
  $results.style.display = "flex";

  const correctWords = $paragraph.querySelectorAll("word.correct").length;
  const correctLetter = $paragraph.querySelectorAll("letter.correct").length;
  const incorrectLetter =
    $paragraph.querySelectorAll("letter.incorrect").length;

  const totalLetters = correctLetter + incorrectLetter;
  const exactitud = totalLetters > 0 ? (correctLetter / totalLetters) * 100 : 0;

  const ppm = (correctWords * 10) / INITIAL_TIME;
  $ppm.textContent = ppm;
  $exactitud.textContent = `${exactitud.toFixed(2)}%`;
}
