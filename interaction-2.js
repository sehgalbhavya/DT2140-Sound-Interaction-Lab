//==========================================================================================
// AUDIO SETUP
//==========================================================================================
let dspNode = null;
let dspNodeParams = null;
let jsonParams = null;

// Use the bell DSP
const dspName = "bells";
const instance = new FaustWasm2ScriptProcessor(dspName);

if (typeof module === "undefined") {
  window[dspName] = instance;
} else {
  const exp = {};
  exp[dspName] = instance;
  module.exports = exp;
}

// Create the FAUST node
bells.createDSP(audioContext, 1024).then((node) => {
  dspNode = node;
  dspNode.connect(audioContext.destination);
  console.log("params: ", dspNode.getParams()); // check console to see the exact param names
  const jsonString = dspNode.getJSON();
  jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
  dspNodeParams = jsonParams;
});

//==========================================================================================
// VARIABLES FOR DROP LOGIC
//==========================================================================================
let isFalling = false; // Are we currently in the air?
let fallStartTime = 0; // When did the fall start?
let wasFallingValid = false; // Did we fall long enough to count as 30 cm?

function accelerationChange(accx, accy, accz) {
  if (!dspNode) return;

  // Total acceleration magnitude (including gravity)
  // At rest ≈ 9.8 m/s², free fall ≈ 0, impact >> 9.8
  const magnitude = Math.sqrt(accx * accx + accy * accy + accz * accz);

  // ------------------------------------------------------
  // PHASE 1: FREE FALL (low acceleration)
  // magnitude < ~4 ≈ "gravity has disappeared" → falling
  // ------------------------------------------------------
  if (magnitude < 4.0) {
    if (!isFalling) {
      // Just started falling
      isFalling = true;
      fallStartTime = millis();
      wasFallingValid = false;
    } else {
      // Still falling → check duration
      // d = 1/2 * g * t^2 → 30cm → ~0.25s
      const duration = millis() - fallStartTime;
      if (duration > 200) {
        // 200–250ms ~= 30 cm drop
        wasFallingValid = true; // long enough!
        statusLabels[2].style("color", "red"); // optional visual feedback
      }
    }
  }

  // ------------------------------------------------------
  // PHASE 2: IMPACT (high acceleration)
  // ------------------------------------------------------
  else if (magnitude > 15.0) {
    // Only ring if we *were* falling long enough
    if (isFalling && wasFallingValid) {
      console.log("Valid drop detected – ring bell!");
      playAudio(); // ring the bell!

      // Reset
      isFalling = false;
      wasFallingValid = false;
      statusLabels[2].style("color", "black");
    } else {
      // Big bump but no valid fall beforehand → ignore
      isFalling = false;
      wasFallingValid = false;
      statusLabels[2].style("color", "black");
    }
  }

  // ------------------------------------------------------
  // PHASE 3: NORMAL HANDLING (standing / small moves)
  // ------------------------------------------------------
  else {
    isFalling = false;
    wasFallingValid = false;
    statusLabels[2].style("color", "black");
  }
}

//==========================================================================================
// AUDIO INTERACTION
//==========================================================================================
function playAudio() {
  if (!dspNode) return;
  if (audioContext.state === "suspended") return;

  // CHANGE THIS if your parameter name is different.
  // Look in the console output from dspNode.getParams().
  const gateAddress = "/churchBell/gate";

  dspNode.setParamValue(gateAddress, 1);
  setTimeout(() => {
    dspNode.setParamValue(gateAddress, 0);
  }, 80); // short pulse
}
