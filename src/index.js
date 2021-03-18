import Postmonger from "postmonger";
window.addEventListener('load', async () => {
  var config = {};
  var journey = {};
  var connection = {};
  var currentStepIndex = 0;

  const loadJson = url => fetch(url).then(response => response.json());
  journey = await loadJson("journey.json");
  config = await loadJson("config.json");
  const activityFrame = document.getElementById('activity');
  const activity = document.createElement("iframe");
  activity.setAttribute("src", "activity.html");
  activity.setAttribute("width", config.userInterfaces.configModal.width);
  activity.setAttribute("height", config.userInterfaces.configModal.height);
  document.body.appendChild(activity);
  connection = new Postmonger.Session({
    connect: activity
  });

  const backButton = document.createElement("button");
  backButton.innerText = "Back";
  backButton.addEventListener("click", () => connection.trigger("clickedBack"));

  const nextButton = document.createElement("button");
  nextButton.innerText = "Next";
  nextButton.addEventListener("click", () => connection.trigger("clickedNext"));

  document.body.appendChild(backButton);
  document.body.appendChild(nextButton);

  connection.on("updateButton", target => {
    console.log("update button", target);
    const disabledAttr = "disabled";
    const toggle = button => {
      if (target.enabled) {
	button.removeAttribute(disabledAttr);
      } else {
	button.setAttribute(disabledAttr, disabledAttr);
      }
    }
    switch (target.button) {
    case "back":
      toggle(backButton);
      break;
    case "next":
      console.log("toggleing next button");
      toggle(nextButton);
      break;
    }
  });

  const doneButton = document.createElement("button");
  doneButton.innerText = "Done";
  doneButton.addEventListener("click", () => {
    currentStepIndex = 0;
    activity.contentWindow.location.reload();
  });
  document.body.appendChild(doneButton);
  const gotoStep = () => connection.trigger("gotoStep", config.wizardSteps[currentStepIndex]);
  connection.on("nextStep", () => {
    currentStepIndex++;
    gotoStep();
    if (currentStepIndex >= config.wizardSteps.length - 1) {
      nextButton.style.display = "none";
      doneButton.style.display = "inline";
    }
  });
  connection.on("prevStep", () => {
    currentStepIndex--;
    gotoStep();
  });

  connection.on("requestInteraction", () => connection.trigger("requestedInteraction", journey));
  connection.on("updateActivity", newConfig => {
    console.log("updateActivity", newConfig);
    config = newConfig;
  });
  connection.on("ready", () => connection.trigger("initActivity", config));
});

