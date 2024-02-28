const synth = new Tone.Synth().toDestination();

function playTone(note) {
  Tone.start().then(() => {
    synth.triggerAttackRelease(note, "8n");
  });
}

let songs = [];

let isRecording = false;
let recordedTune = [];
let recordStartTime = null;

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
        console.log(note + " played"); 
        playAndRecordTone(note); 
      });
    }
  });
  
  


document.addEventListener("keydown", (event) => {
    if (event.repeat) return;
  
    const key = event.key.toLowerCase();
    const note = Object.keys(keyMap).find((note) => keyMap[note] === key);
  
    if (note && isRecording) {
      const noteTiming = (Date.now() - recordStartTime) / 1000;
      recordedTune.push({ note: note.toUpperCase(), duration: "8n", timing: noteTiming });
      console.log(`Recorded ${note.toUpperCase()} at ${noteTiming} seconds`);
    }
  
    if (note) {
      playTone(note.toUpperCase()); 
    }
  });
  


const playSelectedTune = async () => {
    const selectedTuneName = document.getElementById('tunesDrop').value;
    const url = `http://localhost:3000/api/v1/tunes`;
  
    try {
      const response = await axios.get(url);
      console.log("Tunes fetched: ", response.data);
      const tune = response.data.find((song) => song.name.toLowerCase() === selectedTuneName.toLowerCase());
      if (!tune) {
        console.log("Tune not found");
        return;
      }
      playTune(tune.tune); 
    } catch (error) {
      console.error("Error fetching tunes: ", error);
    }
  };
  
  const playTune = (tune) => {
    Tone.start().then(() => {
      const now = Tone.now();
      tune.forEach(noteObj => {
        synth.triggerAttackRelease(noteObj.note, noteObj.duration, now + noteObj.timing);
      });
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    const playButton = document.getElementById('play-tunes-btn');
    playButton.addEventListener('click', playSelectedTune);
  });
  function playAndRecordTone(note) {
    if (isRecording) {
      const noteTiming = Date.now() - recordStartTime;
      recordedTune.push({
        note: note, 
        duration: "8n",
        timing: noteTiming / 1000 
      });
    }
    playTone(note);
  }
  
  function startRecording() {
    isRecording = true;
    recordedTune = [];
    recordStartTime = Date.now();
    document.getElementById('recordbtn').disabled = true;
    document.getElementById('stopbtn').disabled = false;
  }
  
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
    tuneNameInput.value = ''; 
  }
  

  function sendTuneToServer(tuneData) {
    const url = 'http://localhost:3000/api/v1/tunes';
    axios.post(url, tuneData)
      .then(response => {
        console.log("Tune saved: ", response.data);
        fetchTunesAndUpdateDropdown();
      })
      .catch(error => console.error("Error saving tune: ", error));
  }
  
  function fetchTunesAndUpdateDropdown() {
    const url = 'http://localhost:3000/api/v1/tunes';
    axios.get(url)
      .then(response => {
        const tunesDrop = document.getElementById('tunesDrop');
        tunesDrop.innerHTML = '';
        response.data.forEach(tune => {
          const option = new Option(tune.name, tune.name.toLowerCase());
          tunesDrop.add(option);
        });
      })
      .catch(error => console.error("Error fetching tunes: ", error));
  }
  
  document.getElementById('recordbtn').addEventListener('click', startRecording);
  document.getElementById('stopbtn').addEventListener('click', stopRecording);
  