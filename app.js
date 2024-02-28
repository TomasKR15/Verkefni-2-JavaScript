// Initialize the synthesizer only once at the top level
const synth = new Tone.Synth().toDestination();

// Function to play a note, ensuring Tone.js is started upon user interaction
function playTone(note) {
  // Ensures the audio context is resumed (or started) before playing a note
  Tone.start().then(() => {
    synth.triggerAttackRelease(note, "8n");
  });
}

let songs = [];

let isRecording = false;
let recordedTune = [];
let recordStartTime = null;

// Mapping of piano note IDs to keyboard keys
const keyMap = {
  'c4': 'a',
  'c#4': 'w',
  'd4': 's',
  'd#4': 'e',
  'e4': 'd',
  'f4': 'f',
  'f#4': 't',
  'g4': 'g',
  'g#4': 'y',
  'a4': 'h',
  'bb4': 'u',
  'b4': 'j',
  'c5': 'k',
  'c#5': 'o',
  'd5': 'l',
  'd#5': 'p',
  'e5': ';',
};

Object.keys(keyMap).forEach((note) => {
    const element = document.getElementById(note);
    if (element) {
      element.addEventListener("click", () => {
        console.log(note + " played"); // This will log to the console each time a note is played.
        playAndRecordTone(note); // This function should record the note.
      });
    }
  });
  
  

// Attaching keydown event listeners for playing notes via keyboard
// Attaching keydown event listeners for playing and recording notes via keyboard
document.addEventListener("keydown", (event) => {
    // Prevent repeated triggering when key is held down
    if (event.repeat) return;
  
    const key = event.key.toLowerCase();
    const note = Object.keys(keyMap).find((note) => keyMap[note] === key);
  
    if (note && isRecording) {
      // Record the note with timing information
      const noteTiming = (Date.now() - recordStartTime) / 1000; // Convert ms to seconds
      recordedTune.push({ note: note.toUpperCase(), duration: "8n", timing: noteTiming });
      console.log(`Recorded ${note.toUpperCase()} at ${noteTiming} seconds`);
    }
  
    if (note) {
      playTone(note.toUpperCase()); // Play the note (will also handle recording if isRecording is true)
    }
  });
  

// ... your existing code ...


const playSelectedTune = async () => {
    const selectedTuneName = document.getElementById('tunesDrop').value;
    // Corrected URL, removed the extraneous closing brace
    const url = `http://localhost:3000/api/v1/tunes`;
  
    try {
      const response = await axios.get(url);
      console.log("Tunes fetched: ", response.data);
      // Find the selected tune by name from the fetched list
      const tune = response.data.find((song) => song.name.toLowerCase() === selectedTuneName.toLowerCase());
      if (!tune) {
        console.log("Tune not found");
        return;
      }
      // Use tune.tune since 'tune' is the object that includes the 'tune' property
      playTune(tune.tune); // Assumes that the backend sends the tune as an array of notes
    } catch (error) {
      console.error("Error fetching tunes: ", error);
    }
  };
  
  // Function to play a tune
  const playTune = (tune) => {
    // Ensure the audio context is started
    Tone.start().then(() => {
      const now = Tone.now();
      tune.forEach(noteObj => {
        // Schedule the notes to play at the right time
        synth.triggerAttackRelease(noteObj.note, noteObj.duration, now + noteObj.timing);
      });
    });
  };
  
  // Event listener for the play button
  document.addEventListener('DOMContentLoaded', () => {
    const playButton = document.getElementById('play-tunes-btn');
    playButton.addEventListener('click', playSelectedTune);
  });
  
  // ... any other frontend code ...

  // Function to play and record a note
  function playAndRecordTone(note) {
    if (isRecording) {
      const noteTiming = Date.now() - recordStartTime;
      recordedTune.push({
        note: note, // The note to play
        duration: "8n", // The duration of the note, "8n" for eighth note
        timing: noteTiming / 1000 // Timing since the recording started, in seconds
      });
    }
    // Then play the note
    playTone(note);
  }
  
  
  // Function to start recording
  function startRecording() {
    isRecording = true;
    recordedTune = [];
    recordStartTime = Date.now();
    document.getElementById('recordbtn').disabled = true;
    document.getElementById('stopbtn').disabled = false;
  }
  
  // Function to stop recording and send the tune to the server
  function stopRecording() {
    isRecording = false;
    document.getElementById('recordbtn').disabled = false;
    document.getElementById('stopbtn').disabled = true;
  
    if (recordedTune.length === 0) {
      console.log("No tune recorded");
      return;
    }
  
    const tuneNameInput = document.getElementById('recordName');
    const tuneName = tuneNameInput.value.trim() || "No-name Tune";
    
    const tuneData = {
      name: tuneName,
      tune: recordedTune
    };
  
    sendTuneToServer(tuneData);
    tuneNameInput.value = ''; // Reset the input field after recording
  }
  
  // Function to send recorded tune to the server
  function sendTuneToServer(tuneData) {
    const url = 'http://localhost:3000/api/v1/tunes';
    axios.post(url, tuneData)
      .then(response => {
        console.log("Tune saved: ", response.data);
        // Refresh the dropdown menu to include the new tune
        // This would require a function to fetch tunes and update the dropdown
        fetchTunesAndUpdateDropdown();
      })
      .catch(error => console.error("Error saving tune: ", error));
  }
  
  // Function to fetch tunes and update the dropdown menu
  function fetchTunesAndUpdateDropdown() {
    const url = 'http://localhost:3000/api/v1/tunes';
    axios.get(url)
      .then(response => {
        const tunesDrop = document.getElementById('tunesDrop');
        tunesDrop.innerHTML = ''; // Clear existing options
        response.data.forEach(tune => {
          const option = new Option(tune.name, tune.name.toLowerCase());
          tunesDrop.add(option);
        });
      })
      .catch(error => console.error("Error fetching tunes: ", error));
  }
  
  // Attach event listeners to buttons
  document.getElementById('recordbtn').addEventListener('click', startRecording);
  document.getElementById('stopbtn').addEventListener('click', stopRecording);
  