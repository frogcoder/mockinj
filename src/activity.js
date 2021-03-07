import Postmonger from 'postmonger';

window.addEventListener('load', () => {
  console.log("activity loaded");
  activate(document.getElementById('root'));
});

function activate(elementRoot) {
  let foo = "";
  let currentStep = "one";
  let activityConfig = {};
  
  const stepOne = document.createElement("div");
  const stepOneTitle = document.createElement("h1");
  stepOneTitle.appendChild(document.createTextNode("Step 1"));
  stepOne.className = "one";
  stepOne.appendChild(stepOneTitle);

  const stepTwo = document.createElement("div");
  const stepTwoTitle = document.createElement("h1");
  const fooInput = document.createElement("input");
  fooInput.type = "text";
  fooInput.required = true;
  fooInput.placeholder = "foo is required";
  fooInput.addEventListener("change", e => {
    if (e.checkValidity()) {
      foo = fooInput.value;
    } else {
      connection.trigger("updateButton", { button: "next", enabled: false });
    }
  });
  stepTwoTitle.appendChild(document.createTextNode("Step 2"));
  stepTwo.className = "two";
  stepTwo.appendChild(stepTwoTitle);
  stepTwo.appendChild(fooInput);
		      
  const stepThree = document.createElement("div");
  const stepThreeTitle = document.createElement("h1");
  stepThreeTitle.appendChild(document.createTextNode("Step 3"));
  stepThree.className = "three";
  stepThree.appendChild(stepThreeTitle);

  elementRoot.appendChild(stepOne);
  elementRoot.appendChild(stepTwo);
  elementRoot.appendChild(stepThree);
  
  const connection = new Postmonger.Session();		      
  connection.on("initActivity", config => {
    console.log("initActivity", config);
    activityConfig = config;
    connection.trigger('requestInteraction');
    const fooSource = config.arguments.execute.inArguments.find(a => "foo" in a);
    if (fooSource) {
      foo = fooSource["foo"];
    }
  });

  connection.on("requestedInteraction", journey => {
    console.log("requestedInteraction", journey);
  });

  connection.on("clickedNext", () => {
    switch (currentStep) {
    case "two":
      const foo = activityConfig.arguments.execute.inArguments.find(a => "foo" in a);
      foo.foo = fooInput.value;
      break;
    case "three":
      connection.trigger('updateActivity', activityConfig);
      break;
    }
    connection.trigger('nextStep');
  });
  
  connection.on("clickedBack", () => {
    connection.trigger('prevStep');
  });

  connection.on("gotoStep", step => {
    currentStep = step.key;
    if (currentStep === "two") {
      fooInput.value = foo;
      connection.trigger("updateButton", { button: 'next', enabled: fooInput.checkValidity() });
    }
    elementRoot.className = currentStep;
  });
  
  connection.trigger("ready");

}

