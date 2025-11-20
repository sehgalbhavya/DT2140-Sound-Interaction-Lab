//==========================================================================================
// AUDIO SETUP
//------------------------------------------------------------------------------------------
// Interaction 2: Bell triggered by Free Fall (>30cm)
//==========================================================================================
let dspNode = null;
let dspNodeParams = null;
let jsonParams = null;

// 1. SET DSP NAME
// Ensure 'bells.wasm' exists in your wasm folder
const dspName = "bells";
const instance = new FaustWasm2ScriptProcessor(dspName);

// output to window or npm package module
if (typeof module === "undefined") {
  window[dspName] = instance;
} else {
  const exp = {};
  exp[dspName] = instance;
  module.exports = exp;
}

// 2. INITIALIZE DSP
bells.createDSP(audioContext, 1024).then((node) => {
  dspNode = node;
  dspNode.connect(audioContext.destination);
  console.log("params: ", dspNode.getParams());
  const jsonString = dspNode.getJSON();
  jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
  dspNodeParams = jsonParams;
});

//==========================================================================================
// INTERACTIONS
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit the next functions to create interactions
// Decide which parameters you're using and then use playAudio to play the Audio
//------------------------------------------------------------------------------------------
//
//==========================================================================================

// GLOBAL VARIABLES FOR FALL DETECTION
let isFalling = false;
let fallStartTime = 0;

function accelerationChange(accx, accy, accz) {
  // 3. CALCULATE TOTAL ACCELERATION (Magnitude)
  // Normal resting magnitude is ~9.8 m/s^2 (gravity)
  // In free fall, this drops effectively to 0.
  let magnitude = Math.sqrt(accx * accx + accy * accy + accz * accz);

  // 4. DETECT FREE FALL STATE
  // We use a threshold of 3.0 to account for sensor noise.
  if (magnitude < 3.0) {
    if (!isFalling) {
      isFalling = true;
      fallStartTime = millis(); // Start the timer
    }
  } else {
    // 5. DETECT IMPACT (End of fall)
    if (isFalling) {
      let fallDuration = millis() - fallStartTime;

      // 6. CHECK THE "30 CM" RULE
      // It takes approx 247ms to fall 30cm.
      // If the fall lasted longer than 250ms, we trigger the sound.
      if (fallDuration > 250) {
        playAudio();
      }

      // Reset logic
      isFalling = false;
    }
  }
}

function rotationChange(rotx, roty, rotz) {
  // Not used for this interaction
}

function mousePressed() {
  playAudio(); // Debugging: Test sound with mouse click
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

function getMinMaxParam(address) {
  if (!dspNodeParams) return [0, 1];
  const exampleMinMaxParam = findByAddress(dspNodeParams, address);
  const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
  console.log("Min value:", exampleMinValue, "Max value:", exampleMaxValue);
  return [exampleMinValue, exampleMaxValue];
}

//==========================================================================================
// AUDIO INTERACTION
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit here to define your audio controls
//------------------------------------------------------------------------------------------
//
//==========================================================================================

function playAudio() {
  if (!dspNode) {
    return;
  }
  if (audioContext.state === "suspended") {
    return;
  }

  // 7. TRIGGER THE BELL
  // Gate 1 starts the sound, Gate 0 releases it.
  dspNode.setParamValue("/englishBell/gate", 1);

  // Turn off the gate quickly to let the bell ring out naturally
  setTimeout(() => {
    dspNode.setParamValue("/englishBell/gate", 0);
  }, 100);
}

//==========================================================================================
// END
//==========================================================================================
