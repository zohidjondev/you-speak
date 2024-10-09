// Updated Sample JSON data
const data = {
  "Speaking Session 1": {
    "Odilov Sanjarbek": { Speaking: 30 },
    Eldorbek: { Speaking: 0 },
    "Omonov Sanjarbek": { Speaking: 0 },
    Qobiljon: { Speaking: 50 },
    Kamronbek: { Speaking: 45 },
  },
  "Speaking Session 2": {
    "Odilov Sanjarbek": { Speaking: 34 },
    Eldorbek: { Speaking: 0 },
    "Omonov Sanjarbek": { Speaking: 0 },
    Qobiljon: { Speaking: 52 },
    Kamronbek: { Speaking: 48 },
  },
  "Speaking Session 3": {
    "Odilov Sanjarbek": { Speaking: 38 },
    Eldorbek: { Speaking: 0 },
    "Omonov Sanjarbek": { Speaking: 35 },
    Qobiljon: { Speaking: 53 },
    Kamronbek: { Speaking: 50 },
  },
  "Speaking Session 4": {
    "Odilov Sanjarbek": { Speaking: 40 },
    Eldorbek: { Speaking: 53 },
    "Omonov Sanjarbek": { Speaking: 0 },
    Qobiljon: { Speaking: 54 },
    Kamronbek: { Speaking: 53 },
  },
  "Speaking Session 5": {
    "Odilov Sanjarbek": { Speaking: 42 },
    Eldorbek: { Speaking: 53 },
    "Omonov Sanjarbek": { Speaking: 0 },
    Qobiljon: { Speaking: 57 },
    Kamronbek: { Speaking: 55 },
  },
  "Speaking Session 6": {
    "Odilov Sanjarbek": { Speaking: 45 },
    Eldorbek: { Speaking: 53 },
    "Omonov Sanjarbek": { Speaking: 0 },
    Qobiljon: { Speaking: 57 },
    Kamronbek: { Speaking: 55 },
  },
  "Speaking Session 7": {
    "Odilov Sanjarbek": { Speaking: 45 },
    Eldorbek: { Speaking: 53 },
    "Omonov Sanjarbek": { Speaking: 0 },
    Qobiljon: { Speaking: 57 },
    Kamronbek: { Speaking: 56 },
  },
  "Speaking Session 8": {
    "Odilov Sanjarbek": { Speaking: 46 },
    Eldorbek: { Speaking: 53 },
    "Omonov Sanjarbek": { Speaking: 0 },
    Qobiljon: { Speaking: 57 },
    Kamronbek: { Speaking: 56 },
  },
  "Speaking Session 9": {
    "Odilov Sanjarbek": { Speaking: 48 },
    Eldorbek: { Speaking: 53 },
    "Omonov Sanjarbek": { Speaking: 0 },
    Qobiljon: { Speaking: 57 },
    Kamronbek: { Speaking: 57 },
  }
};

// Get unique participants from the JSON data
const participants = Array.from(
  new Set(Object.values(data).flatMap((session) => Object.keys(session)))
);

// Function to populate the dropdown with participants
function populateDropdown() {
  const participantSelect = document.getElementById("participant-select");

  participants.forEach((participant) => {
    const option = document.createElement("option");
    option.value = participant;
    option.textContent = participant;
    participantSelect.appendChild(option);
  });
}

// Function to display the selected participant's speaking scores
function showParticipantProgress(participant) {
  const tableBody = document.querySelector("#progress-table tbody");
  tableBody.innerHTML = ""; // Clear the table for new data

  // Loop through each session and get the participant's score
  for (const session in data) {
    if (data[session][participant]) {
      const row = tableBody.insertRow();
      const sessionCell = row.insertCell(0);
      const scoreCell = row.insertCell(1);

      sessionCell.textContent = session; // Display session
      scoreCell.textContent = data[session][participant].Speaking; // Display speaking score
    }
  }
}

// Event listener for dropdown change
document
  .getElementById("participant-select")
  .addEventListener("change", (event) => {
    const selectedParticipant = event.target.value;
    showParticipantProgress(selectedParticipant);
  });

// Populate the dropdown on page load
populateDropdown();
