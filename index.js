console.log("Index Script init!");

var isRegistered =
  (localStorage.getItem("isRegistered") &&
    JSON.parse(localStorage.getItem("isRegistered"))) ||
  false;
var showSoftphone = false;
var softphoneToggleButton;
var softphoneUiWrapper;
var softphoneGeneralBlock;
var softphoneLoginForm;
var softphoneWorkForm;
var softphoneWorkCallWrapper;

function addSoftphonePluginStyles() {
  const styles = document.createElement("style");
  styles.type = "text/css";
  styles.innerHTML = `
      * {
        box-sizing: border-box;
      }
      body,
      html {
        margin: 0;
        padding: 0;
      }
      body {
        width: 100vw;
        height: 100vh;
        overflow: hidden;
      }
      .softphone-ui-wrapper {
        position: fixed;
        right: -300px;
        top: 50%;
        transform: translateY(-50%);
        width: 300px;
        height: 200px;
        transition: right 0.3s linear;
      }
      .softphone-ui-wrapper.show {
        right: 0;
      }
      .softphone-toggle-btn {
        position: absolute;
        left: -40px;
        top: 50%;
        transform: translateY(-50%);
        width: 40px;
        height: 40px;
        border: none;
        cursor: pointer;
        outline: none;
        font-size: 24px;
        background-color: rgba(0,0,0, 0.85);
        color: #fff;
        border-top-left-radius: 12px;
        border-bottom-left-radius: 12px;
        text-align: center;
      }
      .softphone-toggle-btn.registered {
        color: rgb(134,255,0);
      }
      .softphone-general-block {
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0, 0.85);
        border-top-left-radius: 6px;
        border-bottom-left-radius: 6px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        position: relative;
        padding: 15px;
      }
      .softphone-exit-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        background-color: transparent;
        border: none;
        color: #f44336;
        cursor: pointer;
        outline: none;
        font-size: 20px;
        padding: 0;
      }
      .softphone-login-btn {
        height: 30px;
        background-color: #03a9f4;
        border: none;
        border-radius: 16px;
        color: #fff;
        font-weight: bold;
        font-size: 14px;
        cursor: pointer;
        outline: none;
        transition: backgroud-color 0.3s linear;
      }
      .softphone-login-btn:hover {
        background-color: #029ce3;
      }
      .softphone-call-btn {
        height: 30px;
        background-color: #00cc69;
        border: none;
        border-radius: 16px;
        color: #fff;
        font-weight: bold;
        font-size: 16px;
        cursor: pointer;
        outline: none;
        transition: backgroud-color 0.3s linear;
      }
      .softphone-call-btn:hover {
        background-color: #00b35c;
      }
      #softphone-login-form {
        display: flex;
        flex-wrap: wrap;
        flex-direction: column;
      }
      #softphone-work-form {
      }
      #softphone-work-call-wrapper {
        display: flex;
        flex-direction: column;
      }
      .hidden {
        display: none!important;
      }
      .form-title {
        text-align: center;
        margin: 0 0 15px;
        color: #fff;
        font-size: 18px;
      }
      input {
        height: 30px;
        padding-left: 10px;
        background-color: #000;
        border: none;
        color: #fff;
        border-radius: 4px;
        outline: none;
        margin-bottom: 15px;
      }
      input::placeholder  {
        color: #fff;
      }
      #incoming-query {
        color: #fff;
        text-align: center;
        font-weight: bold;
        font-size: 20px;
      }
      #incoming-query p {
        margin: 0 0 15px;
      }
      .softphone-accept-btn, .softphone-reject-btn {
        height: 30px;
        color: #fff;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        padding: 0 12px;
        margin: 0 10px;
      }
      .softphone-accept-btn {
        background-color: #00b35c;
      }
      .softphone-reject-btn {
        background-color: #f44336;
      }
      .call-session {
        display: flex;
        justify-content: space-around;
      }
      .call-session button {
        height: 30px;
        border: none;
        border-radius: 16px;
        color: #fff;
        font-weight: bold;
        font-size: 14px;
        cursor: pointer;
        outline: none;
        width: 100px;
        transition: box-shadow 0.3s ease-in-out;
      }
      .unhold-btn {
        background-color: #00cc69;
      }
      .unhold-btn:hover {
        box-shadow: 0 0 20px #00cc69;
      }
      .hold-btn {
        background-color: #9e9e9e;
      }
      .hold-btn:hover {
        box-shadow: 0 0 20px #9e9e9e;
      }
      .hangup-btn {
        background-color: #f44336;
      }
      .hangup-btn:hover {
        box-shadow: 0 0 20px #f44336;
      }
    `;
  document.getElementsByTagName("head")[0].appendChild(styles);
}

function createSoftphonePlugin() {
  softphoneUiWrapper = document.createElement("div");
  softphoneUiWrapper.classList = "softphone-ui-wrapper";
  createSoftphoneToggleBtn(softphoneUiWrapper);
  createSoftphoneGeneralBlock(softphoneUiWrapper);
  document.getElementsByTagName("body")[0].appendChild(softphoneUiWrapper);
}

function createSoftphoneToggleBtn() {
  softphoneToggleButton = document.createElement("button");
  softphoneToggleButton.classList = "softphone-toggle-btn";
  softphoneToggleButton.classList.toggle("registered", isRegistered);
  softphoneToggleButton.innerHTML = `<i class="fas fa-angle-double-left"></i>`;
  softphoneToggleButton.addEventListener("click", function(event) {
    event.stopPropagation();
    showSoftphone = !showSoftphone;
    softphoneToggleButton.innerHTML = showSoftphone
      ? `<i class="fas fa-angle-double-right"></i>`
      : `<i class="fas fa-angle-double-left"></i>`;
    softphoneUiWrapper.classList.toggle("show", showSoftphone);
  });
  softphoneUiWrapper.appendChild(softphoneToggleButton);
}

function createSoftphoneGeneralBlock() {
  softphoneGeneralBlock = document.createElement("article");
  softphoneGeneralBlock.classList = "softphone-general-block";
  createSoftphoneWorkForm();
  createSoftphoneLoginForm();
  isRegistered
    ? softphoneLoginForm.classList.toggle("hidden", true)
    : softphoneWorkForm.classList.toggle("hidden", true);
  softphoneUiWrapper.appendChild(softphoneGeneralBlock);

  const isIncomingInviteWaiting = localStorage.getItem(
    "isIncomingInviteWaiting"
  );
  if (isIncomingInviteWaiting) {
    handleIncomingInvite(isIncomingInviteWaiting);
    return;
  }

  const activeCall =
    localStorage.getItem("isActiveCall") &&
    JSON.parse(localStorage.getItem("isActiveCall"));
  if (activeCall && activeCall.state) {
    handleInviteCreated(activeCall.id);
  }
}

function createSoftphoneLoginForm() {
  softphoneLoginForm = document.createElement("form");
  softphoneLoginForm.id = "softphone-login-form";
  softphoneLoginForm.action = "";
  const title = document.createElement("h4");
  title.innerText = "Login to Softphone";
  title.classList = "form-title";
  const inputUserName = document.createElement("input");
  inputUserName.placeholder = "Login";
  inputUserName.required = true;
  const inputUserPass = document.createElement("input");
  inputUserPass.placeholder = "Password";
  inputUserPass.type = "password";
  inputUserPass.required = true;
  const loginButton = document.createElement("button");
  loginButton.classList = "softphone-login-btn";
  loginButton.innerText = "Login";
  loginButton.type = "submit";
  loginButton.addEventListener("click", function(event) {
    event.stopPropagation();
    event.preventDefault();
    if (inputUserName.value && inputUserPass.value) {
      const account = {
        userName: inputUserName.value,
        userPass: inputUserPass.value
      };
      localStorage.setItem("openSipSession", JSON.stringify(account));
      window.open("wsp.html", "WSP", "width=300,height=200");
    }
  });
  softphoneLoginForm.appendChild(title);
  softphoneLoginForm.appendChild(inputUserName);
  softphoneLoginForm.appendChild(inputUserPass);
  softphoneLoginForm.appendChild(loginButton);
  softphoneGeneralBlock.appendChild(softphoneLoginForm);
}

function createSoftphoneWorkForm() {
  softphoneWorkForm = document.createElement("form");
  softphoneWorkForm.id = "softphone-work-form";
  softphoneWorkCallWrapper = document.createElement("div");
  softphoneWorkCallWrapper.id = "softphone-work-call-wrapper";
  const inputUserPhone = document.createElement("input");
  inputUserPhone.placeholder = "Recipient's number";
  inputUserPhone.required = true;
  const callButton = document.createElement("button");
  callButton.innerHTML = `<i class="fas fa-phone"></i> Call`;
  callButton.classList = "softphone-call-btn";
  callButton.type = "button";
  callButton.addEventListener("click", function(event) {
    event.stopPropagation();
    localStorage.removeItem("onInvite");
    localStorage.setItem("onInvite", inputUserPhone.value);
  });
  const exitButton = document.createElement("button");
  exitButton.classList = "softphone-exit-btn";
  exitButton.innerHTML = `<i class="fas fa-window-close"></i>`;
  exitButton.type = "button";
  exitButton.title = "Close softphone session";
  exitButton.addEventListener("click", function(event) {
    event.stopPropagation();
    localStorage.removeItem("closeSipSession");
    localStorage.setItem("closeSipSession", "close");
  });
  softphoneWorkCallWrapper.appendChild(inputUserPhone);
  softphoneWorkCallWrapper.appendChild(callButton);
  softphoneWorkForm.appendChild(exitButton);
  softphoneWorkForm.appendChild(softphoneWorkCallWrapper);
  softphoneGeneralBlock.appendChild(softphoneWorkForm);
}

function handleStorageEvents(event) {
  console.log("Catch event Index", event);
  switch (event.key) {
    case "onRegistered":
      handleOnRegisteredEvent(event.newValue);
      break;
    case "closeSipSession":
      handleCloseSipSessionEvent(event.newValue);
      break;
    case "onInviteCreated":
      handleInviteCreated(event.newValue);
      break;
    case "onCloseCallSession":
      removeSessionControlElement(event.newValue);
      break;
    case "onIncomingInvite":
      handleIncomingInvite(event.newValue);
      break;
    case "onIncomingInviteAnswer":
      handleIncomingInviteAnswerEvent(event.newValue);
      break;
    case "activeCallBtnState":
      handleActiveCallBtnState(event.newValue);
      break;
    default:
      return;
  }
}

function handleOnRegisteredEvent(account) {
  if (account) {
    localStorage.setItem("isRegistered", true);
    softphoneToggleButton.classList.toggle("registered", true);
    softphoneLoginForm.classList.toggle("hidden", true);
    softphoneWorkForm.classList.toggle("hidden", false);
  }
}

function handleCloseSipSessionEvent(value) {
  if (value) {
    softphoneToggleButton.classList.toggle("registered", false);
    softphoneWorkForm.classList.toggle("hidden", true);
    softphoneLoginForm.classList.toggle("hidden", false);
    localStorage.setItem("isRegistered", false);
  }
}

function handleInviteCreated(sessionId) {
  if (sessionId) {
    const sessionWrapper = document.createElement("div");
    sessionWrapper.id = "sessionId" + sessionId;
    sessionWrapper.classList.add("call-session");
    const buttonHangup = document.createElement("button");
    buttonHangup.innerHTML = `<i class="fas fa-phone-slash"></i> Hangup`;
    buttonHangup.classList = "hangup-btn";
    buttonHangup.addEventListener("click", function(event) {
      event.stopPropagation();
      localStorage.removeItem("onHangupSession");
      localStorage.setItem("onHangupSession", sessionId);
    });
    const buttonHold = document.createElement("button");
    buttonHold.innerHTML = `<i class="fas fa-pause"></i> Hold`;
    buttonHold.classList = "hold-btn";
    buttonHold.id = "hold-btn";
    buttonHold.addEventListener("click", function(event) {
      event.stopPropagation();
      localStorage.removeItem("onHoldSession");
      localStorage.setItem("onHoldSession", sessionId);
    });
    const buttonUnhold = document.createElement("button");
    buttonUnhold.innerHTML = `<i class="fas fa-phone-volume"></i> Unhold`;
    buttonUnhold.classList = "unhold-btn";
    buttonUnhold.id = "unhold-btn";
    buttonUnhold.addEventListener("click", function(event) {
      event.stopPropagation();
      localStorage.removeItem("onUnholdSession");
      localStorage.setItem("onUnholdSession", sessionId);
    });

    const callBtnState = localStorage.getItem("activeCallBtnState");
    if (callBtnState && callBtnState === "Hold") {
      buttonHold.classList.add("hidden");
    } else {
      buttonUnhold.classList.add("hidden");
    }

    sessionWrapper.appendChild(buttonHangup);
    sessionWrapper.appendChild(buttonHold);
    sessionWrapper.appendChild(buttonUnhold);
    softphoneWorkCallWrapper.classList.toggle("hidden", true);
    softphoneGeneralBlock.appendChild(sessionWrapper);
  }
}

function removeSessionControlElement(sessionId) {
  const session = document.getElementById("sessionId" + sessionId);
  if (session) {
    softphoneWorkCallWrapper.classList.toggle("hidden", false);
    softphoneGeneralBlock.removeChild(session);
  }
}

function handleIncomingInvite(value) {
  if (value) {
    const wrapper = document.createElement("div");
    wrapper.id = "incoming-query";
    const title = document.createElement("p");
    title.innerText = "Incoming call";
    const btnAccept = document.createElement("button");
    btnAccept.innerHTML = `<i class="fas fa-phone"></i> Accept`;
    btnAccept.classList = "softphone-accept-btn";
    btnAccept.addEventListener("click", function(event) {
      event.stopPropagation();
      localStorage.removeItem("onIncomingInviteAnswer");
      localStorage.setItem("onIncomingInviteAnswer", "Accept");
    });
    const btnReject = document.createElement("button");
    btnReject.innerHTML = `<i class="fas fa-phone-slash"></i> Reject`;
    btnReject.classList = "softphone-reject-btn";
    btnReject.addEventListener("click", function(event) {
      event.stopPropagation();
      localStorage.removeItem("onIncomingInviteAnswer");
      localStorage.setItem("onIncomingInviteAnswer", "Reject");
    });
    wrapper.appendChild(title);
    wrapper.appendChild(btnAccept);
    wrapper.appendChild(btnReject);
    softphoneWorkCallWrapper.classList.toggle("hidden", true);
    softphoneGeneralBlock.appendChild(wrapper);
  }
}

function handleIncomingInviteAnswerEvent(answer) {
  if (answer) {
    const queryNode = document.getElementById("incoming-query");
    softphoneWorkCallWrapper.classList.toggle("hidden", false);
    softphoneGeneralBlock.removeChild(queryNode);
  }
}

function handleActiveCallBtnState(value) {
  if (value) {
    if (value === "Unhold") {
      document.getElementById("hold-btn").classList.toggle("hidden", false);
      document.getElementById("unhold-btn").classList.toggle("hidden", true);
    } else {
      document.getElementById("hold-btn").classList.toggle("hidden", true);
      document.getElementById("unhold-btn").classList.toggle("hidden", false);
    }
  }
}

window.addEventListener("storage", handleStorageEvents);
addSoftphonePluginStyles();
createSoftphonePlugin();
