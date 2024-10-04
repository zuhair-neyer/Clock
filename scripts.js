// Handle navigation between sections
document.getElementById('showAlarm').addEventListener('click', function() {
  showSection('alarmSection');
});

document.getElementById('showCalendar').addEventListener('click', function() {
  showSection('calendarSection');
  renderCalendar(); // Render the full calendar when the calendar section is clicked
});

document.getElementById('showStopwatch').addEventListener('click', function() {
  showSection('stopwatchSection');
});

document.getElementById('showWorldClock').addEventListener('click', function() {
  showSection('worldClockSection');
});

// Function to hide all sections and show only the clicked one
function showSection(sectionId) {
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    section.style.display = 'none';
  });
  document.getElementById(sectionId).style.display = 'block';
}

// Initialize FullCalendar for the calendar section
function renderCalendar() {
  var calendarEl = document.getElementById('calendar');
  if (!calendarEl.innerHTML) {
    var calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
    });
    calendar.render();
  }
}

// Alarm Clock functionality
let alarms = [];
document.getElementById('setAlarm').addEventListener('click', function() {
  const alarmTime = document.getElementById('alarmTime').value;
  if (alarmTime) {
    alarms.push(alarmTime);
    renderAlarms();
  }
});

function renderAlarms() {
  const alarmList = document.getElementById('alarmList');
  alarmList.innerHTML = '';
  alarms.forEach((alarm, index) => {
    alarmList.innerHTML += `
      <div>
        <p>Alarm set for: ${alarm}</p>
        <button class="deleteAlarm" data-index="${index}">Delete</button>
      </div>
    `;
  });
  document.querySelectorAll('.deleteAlarm').forEach(button => {
    button.addEventListener('click', function() {
      const index = this.getAttribute('data-index');
      alarms.splice(index, 1);
      renderAlarms();
    });
  });
}

function checkAlarms() {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);
  alarms.forEach((alarm, index) => {
    if (currentTime === alarm) {
      const alarmSound = document.getElementById('alarmSound');
      alarmSound.play();
      alarms.splice(index, 1);
      renderAlarms();
    }
  });
}
setInterval(checkAlarms, 1000);

// Stopwatch functionality
let stopwatchInterval;
let stopwatchStartTime;
let isStopwatchRunning = false;

document.getElementById('startStopwatch').addEventListener('click', function() {
  if (!isStopwatchRunning) {
    stopwatchStartTime = Date.now();
    isStopwatchRunning = true;
    stopwatchInterval = setInterval(updateStopwatch, 10); // Update every 10 milliseconds
  }
});

document.getElementById('stopStopwatch').addEventListener('click', function() {
  clearInterval(stopwatchInterval);
  isStopwatchRunning = false;
});

document.getElementById('resetStopwatch').addEventListener('click', function() {
  clearInterval(stopwatchInterval);
  isStopwatchRunning = false;
  document.getElementById('stopwatchDisplay').innerText = '00:00:00.000';
});

function updateStopwatch() {
  const elapsedTime = Date.now() - stopwatchStartTime;
  const milliseconds = Math.floor(elapsedTime % 1000);
  const seconds = Math.floor((elapsedTime / 1000) % 60);
  const minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
  const hours = Math.floor((elapsedTime / (1000 * 60 * 60)) % 24);
  
  document.getElementById('stopwatchDisplay').innerText = 
    `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(milliseconds, 3)}`;
}

function pad(num, size = 2) {
  let s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}

// Timer functionality
let timerInterval;
document.getElementById('startTimer').addEventListener('click', function() {
  const minutes = parseInt(document.getElementById('timerMinutes').value, 10) || 0;
  const seconds = parseInt(document.getElementById('timerSeconds').value, 10) || 0;
  let timeRemaining = (minutes * 60) + seconds;

  if (timerInterval) clearInterval(timerInterval); // Clear any existing timer

  timerInterval = setInterval(() => {
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      const timerSound = document.getElementById('timerSound');
      timerSound.play();
      alert('Time is up!');
    } else {
      timeRemaining--;
      const mins = Math.floor(timeRemaining / 60);
      const secs = timeRemaining % 60;
      document.getElementById('timerDisplay').innerText = `${pad(mins)}:${pad(secs)}`;
    }
  }, 1000);
});

document.getElementById('resetTimer').addEventListener('click', function() {
  clearInterval(timerInterval);
  document.getElementById('timerDisplay').innerText = '00:00';
});

// World Clock functionality
const countrySelect = document.getElementById('countrySelect');
const countryTimesContainer = document.getElementById('countryTimes');

fetch('https://restcountries.com/v3.1/all')
  .then(response => response.json())
  .then(data => {
    countrySelect.innerHTML = '<option value="">Select a country...</option>';
    data.forEach(country => {
      const option = document.createElement('option');
      option.value = country.cca2; // Use country code
      option.innerText = country.name.common;
      countrySelect.appendChild(option);
    });
  })
  .catch(error => console.log('Error loading countries:', error));

countrySelect.addEventListener('change', function() {
  const countryCode = this.value;
  const countryName = this.options[this.selectedIndex].text;

  if (countryCode) {
    addCountryTime(countryCode, countryName);
  }
});

function addCountryTime(countryCode, countryName) {
  const timeZoneApiUrl = `https://worldtimeapi.org/api/timezone/${countryCode}`;
  
  fetch(timeZoneApiUrl)
    .then(response => response.json())
    .then(data => {
      const currentTime = new Date(data.datetime).toLocaleTimeString();
      
      const countryTimeDiv = document.createElement('div');
      countryTimeDiv.classList.add('country-time');
      countryTimeDiv.innerHTML = `<h3>${countryName}</h3><p>Current Time: ${currentTime}</p>`;
      countryTimesContainer.appendChild(countryTimeDiv);
      
      setInterval(() => {
        const newTime = new Date().toLocaleTimeString();
        countryTimeDiv.querySelector('p').innerText = `Current Time: ${newTime}`;
      }, 1000);
    })
    .catch(error => console.log('Error fetching time data:', error));
}
