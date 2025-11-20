//==========================================================================================
// INTERACTIONS
//==========================================================================================

// Variable to store the last time we played the sound
let lastSoundTime = 0;

function accelerationChange(accx, accy, accz) {
  // 1. Calculate the total force (magnitude)
  let magnitude = Math.sqrt(accx * accx + accy * accy + accz * accz);

  // 2. DETECT IMPACT (The Catch)
  // If the phone is resting, magnitude is ~0 or ~9.8.
  // If you shake it or catch it, it spikes high (e.g., > 15 or > 20).
  // We use 20 as a safe threshold for a "hard catch" or drop impact.
  const impactThreshold = 20;

  if (magnitude > impactThreshold) {
    // 3. DEBOUNCE
    // Prevent the bell from ringing 50 times in one second.
    // We only allow it to ring once every 500ms.
    let now = millis();
    if (now - lastSoundTime > 500) {
      console.log("Impact detected! Magnitude:", magnitude);
      playAudio();
      lastSoundTime = now;
    }
  }
}

function rotationChange(rotx, roty, rotz) {}

function mousePressed() {
  playAudio();
}

function deviceMoved() {
  movetimer = millis();
  statusLabels[2].style("color", "pink");
}

function deviceTurned() {
  threshVals[1] = turnAxis;
}

function deviceShaken() {
  shaketimer = millis();
  statusLabels[0].style("color", "pink");
}

//==========================================================================================
// AUDIO INTERACTION
//==========================================================================================

function playAudio() {
  if (!dspNode) return;
  if (audioContext.state === "suspended") return;

  // Ensure this path matches your console logs exactly!
  dspNode.setParamValue("/englishBell/gate", 1);

  setTimeout(() => {
    dspNode.setParamValue("/englishBell/gate", 0);
  }, 100);
}
