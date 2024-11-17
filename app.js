document.addEventListener("DOMContentLoaded", () => {
  const buttonContainer = document.getElementById("button-container");

  class TestTimer {
    constructor(timerDisplay, instructionDisplay) {
      this.timerDisplay = timerDisplay;
      this.instructionDisplay = instructionDisplay;
    }

    start(duration, label, callback, hideTimer = false) {
      if (!hideTimer) {
        this.instructionDisplay.textContent = label;
        this.updateTimerDisplay(duration);
      } else {
        this.instructionDisplay.textContent = ""; // Clear label for hidden timer
        this.timerDisplay.textContent = "";
      }

      if (!hideTimer) {
        const interval = setInterval(() => {
          if (--duration < 0) {
            clearInterval(interval);
            callback();
          } else {
            this.updateTimerDisplay(duration);
          }
        }, 1000);
      } else {
        // Call the callback immediately if the timer is hidden
        callback();
      }
    }

    updateTimerDisplay(seconds) {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      this.timerDisplay.textContent = `${minutes}:${
        secs < 10 ? "0" : ""
      }${secs}`;
    }
  }

  class TestController {
    constructor() {
      this.timerDisplay = document.getElementById("timer");
      this.instructionDisplay = document.getElementById("instruction");
      this.questionDisplay = document.getElementById("question-display");
      this.imageDisplay = document.getElementById("image-display");
      this.mainMessage = document.getElementById("main-message");
      this.startMenu = document.getElementById("start-menu");
      this.testContainer = document.getElementById("test-container");
      this.currentPartIndex = 0;
      this.currentQuestionIndex = 0;
      this.data = null;
      this.timer = new TestTimer(this.timerDisplay, this.instructionDisplay);
      this.skipButton = document.getElementById("skip-button");

      // Attach event listener to the skip button
      this.skipButton.addEventListener("click", () => {
        this.skipIntro();
      });

      // Audios
      this.specialSound = new Audio("Audios/special.mp3");
      this.startingExamSound = new Audio("Audios/starting(MultilevelExam).mp3");
      this.sayYourName = new Audio("Audios/tellYourFullName.mp3");
      this.thankYou = new Audio("Audios/ThankYou.mp3");
      this.endAnswerTimeAudio = new Audio("Audios/time-is-up.mp3");
      this.endExamAudio = new Audio("Audios/endExam.mp3");
      this.yourExamStartsAudio = new Audio(
        "Audios/yourExamStartsin10seconds.mp3"
      );

      this.introAudios = {
        "Part 1.1": new Audio("Audios/part1.1.mp3"),
        "Part 1.2": new Audio("Audios/part1.2.mp3"),
        "Part 2": new Audio("Audios/part2.mp3"),
        "Part 3": new Audio("Audios/part3.mp3"),
      };
    }

    playAudio(audio) {
      return new Promise((resolve) => {
        audio.play().catch(() => {});
        audio.onended = resolve;
      });
    }

    skipIntro() {
      if (this.currentAudio) {
        this.currentAudio.pause(); // Pause current audio
        this.currentAudio.currentTime = 0; // Reset playback to start
      }

      // Stop any ongoing audio promises
      this.audioSkipped = true;

      // Hide skip button and move directly to the next part
      this.skipButton.classList.add("hidden");
      this.displayPart(this.data.parts[this.currentPartIndex]);
    }

    async playIntroForPart(part, callback) {
      const introText = {
        "Part 1.1":
          "Part 1.1. In this part, I will ask you a few questions about yourself. For each question, you will have 30 seconds to answer. You should speak after this sound.",
        "Part 1.2":
          "Part 1.2. You will now see 2 pictures. You need to answer some questions based on these pictures. You will have 30 seconds to answer each question. You should speak after this sound.",
        "Part 2":
          "Part 2. You will be given a picture followed by 3 questions. You do not need to describe the picture, but focus on the questions provided. You will have 1 minute to prepare for the questions and 2 minutes to answer them. You should speak after this sound.",
        "Part 3":
          "Part 3. You will be given a statement to discuss. You will need to speak about both sides of the argument. You will have 1 minute to prepare for the task and 2 minutes to speak. You should speak after this sound.",
      };

      const audio = this.introAudios[part];
      const text = introText[part] || "Get ready for the next part.";

      // Reset skip state
      this.audioSkipped = false;

      // Hide the timer and clear the instruction label for intros
      this.timerDisplay.textContent = "";
      this.instructionDisplay.textContent = "";

      // Display skip button
      this.skipButton.classList.remove("hidden");

      // Display intro message
      this.displayMessage(text);

      // Play audio and special sound sequentially
      try {
        this.currentAudio = audio;

        // Play intro audio
        await this.playAudio(audio);

        // If skipped during audio, stop further processing
        if (this.audioSkipped) return;

        // Play special sound
        this.currentAudio = this.specialSound;
        await this.playAudio(this.specialSound);

        // If skipped during audio, stop further processing
        if (this.audioSkipped) return;

        // Call the callback after sounds complete
        callback();
      } catch (err) {
        console.error("Audio playback interrupted or skipped.");
      } finally {
        // Hide the skip button after the intro
        this.skipButton.classList.add("hidden");
        this.currentAudio = null;
      }
    }

    startTest(testName) {
      this.testName = testName;
      this.startMenu.classList.add("hidden");
      this.testContainer.classList.remove("hidden");
      this.loadTest(testName);
    }

    async loadTest(testName) {
      const response = await fetch(`Tests/${testName}/questions.json`);
      this.data = await response.json();
      this.startExam();
    }

    startExam() {
      this.instructionDisplay.textContent = ""; // Clear label for intros
      this.displayMessage("Multilevel Exam, New Speaking Test");
      this.startingExamSound.play().catch(() => {});
      this.instructionDisplay.textContent = ""; // Clear label for intros
      setTimeout(() => {
        this.displayMessage("Can you tell me your full name please?");
        this.sayYourName.play().catch(() => {});
        this.instructionDisplay.textContent = ""; // Clear label for intros
        setTimeout(() => {
          this.displayMessage("Thank You!");
          this.thankYou.play().catch(() => {});
          this.instructionDisplay.textContent = ""; // Clear label for intros
          setTimeout(() => {
            this.displayMessage("Your exam starts in 10 seconds!");
            this.yourExamStartsAudio.play().catch(() => {});
            this.timer.start(10, "", () => this.nextPart());
          }, 2000);
        }, 5000);
      }, 3500);
    }

    nextPart() {
      // Clear images and questions
      this.clearImagesAndQuestions();

      if (this.currentPartIndex >= this.data.parts.length) {
        this.endExam();
        return;
      }

      const part = this.data.parts[this.currentPartIndex];
      this.updateActivePartLabel(part.part);

      // Play intro audio and show introductory text, then proceed
      this.playIntroForPart(part.part, () => {
        this.displayPart(part);
      });
    }

    displayPart(part) {
      // Clear previous images and questions when a new part starts
      this.clearImagesAndQuestions();
      this.skipButton.classList.add("hidden"); // Ensure the skip button is hidden

      if (["Part 2", "Part 3"].includes(part.part)) {
        this.mainMessage.textContent = "";
      } else {
        this.mainMessage.textContent = part.part;
      }

      this.instructionDisplay.textContent = this.getPartInstruction(part.part);

      if (["Part 1.1", "Part 1.2"].includes(part.part)) {
        if (part.images) this.displayImages(part.images);
        this.nextQuestion(part);
      } else if (part.part === "Part 2") {
        this.displayImages(part.images);
        this.displayQuestions(part.questions);
        this.handleTimedSection(part);
      } else if (part.part === "Part 3") {
        this.displayArgumentTable(part.questions[0]);
        this.handleTimedSection(part);
      }
    }

    clearImagesAndQuestions() {
      this.imageDisplay.innerHTML = "";
      this.questionDisplay.innerHTML = "";
    }

    updateActivePartLabel(part) {
      document
        .querySelectorAll(".part-label")
        .forEach((label) => label.classList.remove("active"));
      const activeLabel = document.getElementById(
        `part-${part.replace(/\./g, "-")}`
      );
      if (activeLabel) {
        activeLabel.classList.add("active");
        // Set the background color according to the part
        activeLabel.style.backgroundColor = this.partStyles[part] || "#fff";
      }
    }

    nextQuestion(part) {
      if (this.currentQuestionIndex >= part.questions.length) {
        this.currentPartIndex++;
        this.currentQuestionIndex = 0;
        this.nextPart();
        return;
      }

      const question = part.questions[this.currentQuestionIndex];
      this.displayMessage(Object.values(question)[0]);

      let answerTime = part.answerTime;
      if (part.part === "Part 1.2" && this.currentQuestionIndex === 0) {
        answerTime = 45; // Set 45 seconds for the first question
      }

      this.timer.start(part.prepareTime, "Please prepare!", () => {
        this.specialSound.play();

        // Start the answer time with the determined duration
        this.timer.start(answerTime, "Answer the question", () => {
          this.endAnswerTimeAudio.play(); // Play the audio when answer time finishes
          this.currentQuestionIndex++;
          this.nextQuestion(part);
        });
      });
    }

    displayImages(images) {
      // Clear previous images
      this.imageDisplay.innerHTML = "";
      // Append new images
      this.imageDisplay.innerHTML = images
        .map(
          (img) =>
            `<img src="Tests/${this.testName}/imgs/${img}" alt="Image" class="image-side-by-side" />`
        )
        .join("");
    }

    displayQuestions(questions) {
      // Clear previous questions
      this.questionDisplay.innerHTML = "";
      // Append new questions as a list
      const questionList = questions
        .map((q) => `<li style="text-align: left;">${Object.values(q)[0]}</li>`)
        .join("");
      this.questionDisplay.innerHTML = `<ul>${questionList}</ul>`;
    }

    displayArgumentTable(argument) {
      this.questionDisplay.innerHTML = `
        <h2>${argument.statement}</h2>
        <table border="1" style="width: 100%; text-align: left;">
          <thead>
            <tr>
              <th>For</th>
              <th>Against</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${Object.values(argument.For)
                .map((f) => `<li>${f}</li>`)
                .join("")}</td>
              <td>${Object.values(argument.Against)
                .map((a) => `<li>${a}</li>`)
                .join("")}</td>
            </tr>
          </tbody>
        </table>
      `;
    }

    displayMessage(message) {
      this.mainMessage.textContent = message;
    }

    getPartInstruction(part) {
      const instructions = {
        "Part 1.1":
          "I will ask you a few questions about yourself. You have 30 seconds to answer.",
        "Part 1.2":
          "Look at these pictures. You will answer questions based on them. 45 seconds per answer.",
        "Part 2": "Describe the picture and answer all questions below.",
        "Part 3": "Discuss both sides of the argument provided.",
      };
      return instructions[part] || "";
    }

    handleTimedSection(part) {
      this.timer.start(part.prepareTime, "Please prepare!", () => {
        this.specialSound.play();
        this.timer.start(part.answerTime, "Answer", () => {
          this.endAnswerTimeAudio.play(); // Play the audio when answer time finishes
          this.currentPartIndex++;
          this.nextPart();
        });
      });
    }

    endExam() {
      // Hide all containers
      document.getElementById("timer-container").classList.add("hidden");
      document.getElementById("instruction-container").classList.add("hidden");
      document.getElementById("question-container").classList.add("hidden");
      document.getElementById("image-container").classList.add("hidden");

      // Show end screen message
      this.displayMessage("This is the end of the Speaking Test.");
      this.endAnswerTimeAudio.play().catch(() => {});

      // Create the 'Go to Home' button dynamically
      const endButton = document.createElement("button");
      endButton.textContent = "Go to Tests";
      endButton.classList.add("end-exam-button");

      // Append the button to the main message container or another place
      this.mainMessage.appendChild(endButton);

      // Add a click event to the button to navigate to the home page or any other desired page
      endButton.addEventListener("click", () => {
        window.location.href = "test.html"; // or the desired page link
      });
    }
  }

  const testController = new TestController();
  window.startTest = testController.startTest.bind(testController);
});
