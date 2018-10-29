console.log("WSP Script init!");

window.addEventListener("beforeunload", function(event) {
  // event.preventDefault();
  localStorage.removeItem("closeSipSession");
  localStorage.removeItem("isIncomingInviteWaiting");
  localStorage.removeItem("isActiveCall");
  localStorage.removeItem("activeCallBtnState");
  localStorage.setItem("closeSipSession", "close");
});

var userAgent;
var session;
var sessionUIs = [];
var activeSession;
var optionsAudio = {
  sessionDescriptionHandlerOptions: {
    constraints: {
      audio: true,
      video: false
    }
  }
};
var sessionList = document.getElementById("session-list");
var softphoneWorkCallWrapper;

function handleStorageEvents(event) {
  console.log("Catch event WSP", event);
  switch (event.key) {
    case "closeSipSession":
      handleCloseSipSessionEvent(event.newValue);
      break;
    case "onIncomingInviteAnswer":
      handleIncomingInviteAnswerEvent(event.newValue);
      break;
    case "onInvite":
      handleOnInviteEvent(event.newValue);
      break;
    case "onHangupSession":
      handleHangupClick(event.newValue);
      break;
    case "onHoldSession":
      handleHoldClick(event.newValue);
      break;
    case "onUnholdSession":
      handleUnholdClick(event.newValue);
      break;
    default:
      return;
  }
}

function openSipSession() {
  const account = JSON.parse(localStorage.getItem("openSipSession"));
  const options = {
    uri: account.userName + "@webphone.callway.com.ua",
    transportOptions: {
      wsServers: ["wss://webphone.callway.com.ua:8089/ws"]
    },
    authorizationUser: account.userName,
    password: "Secret" + account.userPass + "!",
    displayName: "User " + account.userName,
    register: true,
    autoStart: true,
    sessionDescriptionHandlerFactoryOptions: {
      modifiers: [SIP.Web.Modifiers.stripG722]
    }
  };
  userAgent = new SIP.UA(options);
  addUserAgentListener(userAgent);
}

function handleCloseSipSessionEvent() {
  localStorage.removeItem("closeSipSession");
  localStorage.setItem("closeSipSession", "close");
  window.close();
}

function handleIncomingInviteAnswerEvent(answer) {
  if (answer) {
    let body = {
      code: answer,
      id: activeSession.id
    };
    localStorage.setItem("onIncomingInviteAnswer", JSON.stringify(body));
    softphoneWorkCallWrapper.classList.toggle("hidden", true);
    const queryNode = document.getElementById("incoming-query");
    sessionList.removeChild(queryNode);
    localStorage.removeItem("isIncomingInviteWaiting");
  }
  if (answer === "Accept") {
    const activeCall = {
      state: true,
      id: activeSession.id
    };
    localStorage.setItem("isActiveCall", JSON.stringify(activeCall));
    createNewSessionUI(activeSession);
    activeSession.accept(optionsAudio);
  } else if (answer === "Reject") {
    localStorage.removeItem("isActiveCall");
    localStorage.removeItem("activeCallBtnState");
    activeSession.reject(null, "User rejected");
    softphoneWorkCallWrapper.classList.toggle("hidden", false);
  }
}

function handleOnInviteEvent(phoneNumber) {
  if (phoneNumber) {
    console.log("Invite", phoneNumber);
    session = userAgent.invite(
      phoneNumber + "@webphone.callway.com.ua",
      optionsAudio
    );
    createNewSessionUI(session);
  }
}

function onRegistered() {
  const onRegisteredWrapper = document.getElementById("wsp-general-block");
  softphoneWorkCallWrapper = document.createElement("div");
  softphoneWorkCallWrapper.id = "softphone-work-call-wrapper";
  const inputUserPhone = document.createElement("input");
  inputUserPhone.id = "wsp-number-input";
  inputUserPhone.placeholder = "Recipient's number";
  const callButton = document.createElement("button");
  callButton.innerHTML = `<i class="fas fa-phone"></i> Call`;
  callButton.classList = "softphone-call-btn";
  callButton.type = "button";
  callButton.addEventListener("click", function(event) {
    event.stopPropagation();
    handleOnInviteEvent(inputUserPhone.value);
  });
  const exitButton = document.createElement("button");
  exitButton.classList = "softphone-exit-btn";
  exitButton.innerHTML = `<i class="fas fa-window-close"></i>`;
  exitButton.type = "button";
  exitButton.title = "Close softphone session";
  exitButton.addEventListener("click", function(event) {
    event.stopPropagation();
    handleCloseSipSessionEvent();
  });
  onRegisteredWrapper.removeChild(document.getElementById("wsp-connection"));
  softphoneWorkCallWrapper.appendChild(inputUserPhone);
  softphoneWorkCallWrapper.appendChild(callButton);
  onRegisteredWrapper.appendChild(exitButton);
  onRegisteredWrapper.appendChild(softphoneWorkCallWrapper);
}

function addUserAgentListener(ua) {
  ua.on("invite", function(session) {
    console.log("invite");
    console.warn("session", session);
    localStorage.setItem("isIncomingInviteWaiting", session.id);
    localStorage.setItem("onIncomingInvite", session.id);
    activeSession = session;
    handleIncomingInvite();
  });
  ua.on("registered", function(data) {
    console.log("registered");
    console.log(data);
    localStorage.setItem("onRegistered", "Registered");
    localStorage.removeItem("onRegistered");
    onRegistered();
  });
  ua.on("unregistered", function(data) {
    console.log("unregistered");
    console.log(data);
  });
  ua.on("connected", function(data) {
    console.log("connected");
    console.log(data);
  });
}

function createNewSessionUI(session) {
  const activeCall = {
    state: true,
    id: session.id
  };
  localStorage.setItem("isActiveCall", JSON.stringify(activeCall));
  softphoneWorkCallWrapper.classList.toggle("hidden", true);
  var sessionUI = {
    id: session.id,
    session: session,
    elements: addSessionControlElements(session)
  };
  localStorage.removeItem("onInviteCreated");
  localStorage.setItem("onInviteCreated", session.id);
  addSessionListener(sessionUI);
  sessionUIs.push(sessionUI);
}

function addSessionControlElements(session) {
  const sessionWrapper = document.createElement("div");
  sessionWrapper.id = "sessionId" + session.id;
  sessionWrapper.classList.add("call-session");
  const buttonHangup = document.createElement("button");
  buttonHangup.innerHTML = `<i class="fas fa-phone-slash"></i> Hangup`;
  buttonHangup.classList = "hangup-btn";
  buttonHangup.addEventListener("click", function() {
    event.stopPropagation(event);
    handleHangupClick(session.id);
  });
  const buttonHold = document.createElement("button");
  buttonHold.innerHTML = `<i class="fas fa-pause"></i> Hold`;
  buttonHold.classList = "hold-btn";
  buttonHold.id = "hold-btn";
  buttonHold.addEventListener("click", function() {
    event.stopPropagation(event);
    handleHoldClick(session.id);
  });
  const buttonUnhold = document.createElement("button");
  buttonUnhold.innerHTML = `<i class="fas fa-phone-volume"></i> Unhold`;
  buttonUnhold.classList = "unhold-btn hidden";
  buttonUnhold.id = "unhold-btn";
  buttonUnhold.addEventListener("click", function() {
    event.stopPropagation(event);
    handleUnholdClick(session.id);
  });
  const remoteMedia = document.createElement("audio");
  sessionWrapper.appendChild(remoteMedia);
  sessionWrapper.appendChild(buttonHangup);
  sessionWrapper.appendChild(buttonHold);
  sessionWrapper.appendChild(buttonUnhold);
  sessionList.appendChild(sessionWrapper);
  const elements = {
    sessionWrapper: sessionWrapper,
    buttonHangup: buttonHangup,
    buttonHold: buttonHold,
    buttonUnhold: buttonUnhold,
    remoteMedia: remoteMedia
  };
  return elements;
}

function handleHangupClick(sessionId) {
  const session = sessionUIs.find(s => s.id == sessionId);
  if (session) {
    session.session.bye();
  }
}

function handleHoldClick(sessionId) {
  localStorage.setItem("activeCallBtnState", "Hold");
  document.getElementById("hold-btn").classList.toggle("hidden", true);
  document.getElementById("unhold-btn").classList.toggle("hidden", false);
  const session = sessionUIs.find(s => s.id == sessionId);
  if (session) {
    session.session.hold();
  }
}

function handleUnholdClick(sessionId) {
  localStorage.setItem("activeCallBtnState", "Unhold");
  document.getElementById("hold-btn").classList.toggle("hidden", false);
  document.getElementById("unhold-btn").classList.toggle("hidden", true);
  const session = sessionUIs.find(s => s.id == sessionId);
  if (session) {
    session.session.unhold();
  }
}

function handleIncomingInvite() {
  const wrapper = document.createElement("div");
  wrapper.id = "incoming-query";
  const title = document.createElement("p");
  title.innerText = "Incoming call";
  const btnAccept = document.createElement("button");
  btnAccept.innerHTML = `<i class="fas fa-phone"></i> Accept`;
  btnAccept.classList = "softphone-accept-btn";
  btnAccept.addEventListener("click", function(event) {
    event.stopPropagation();
    handleIncomingInviteAnswerEvent("Accept");
  });
  const btnReject = document.createElement("button");
  btnReject.innerHTML = `<i class="fas fa-phone-slash"></i> Reject`;
  btnReject.classList = "softphone-reject-btn";
  btnReject.addEventListener("click", function(event) {
    event.stopPropagation();
    handleIncomingInviteAnswerEvent("Reject");
  });
  wrapper.appendChild(title);
  wrapper.appendChild(btnAccept);
  wrapper.appendChild(btnReject);
  softphoneWorkCallWrapper.classList.toggle("hidden", true);
  const activeCall = {
    state: true,
    id: activeSession.id
  };
  localStorage.setItem("isActiveCall", JSON.stringify(activeCall));
  sessionList.appendChild(wrapper);
}

function addSessionListener(sessionUI) {
  var session = sessionUI.session;
  var remoteMedia = sessionUI.elements.remoteMedia;
  session.on("progress", function(response, cause) {
    console.log("progress");
  });
  session.on("accepted", function(response, cause) {
    console.log("accepted");
  });
  session.on("rejected", function(response, cause) {
    console.log("rejected");
    removeSessionControlElement(session.id);
  });
  session.on("failed", function(response, cause) {
    console.log("failed");
    removeSessionControlElement(session.id);
  });
  session.on("terminated", function(response, cause) {
    console.log("terminated");
  });
  session.on("cancel", function(response, cause) {
    console.log("cancel");
    removeSessionControlElement(session.id);
  });
  session.on("reinvite", function(response, cause) {
    console.log("reinvite");
  });
  session.on("replaced", function(response, cause) {
    console.log("replaced");
  });
  session.on("directionChanged", function(response, cause) {
    console.log("directionChanged");
  });
  session.on("trackAdded", function() {
    console.log("trackAdded");
    var pc = session.sessionDescriptionHandler.peerConnection;
    var remoteStream = new window.MediaStream();
    pc.getReceivers().forEach(function(receiver) {
      console.log(receiver);
      remoteStream.addTrack(receiver.track);
    });
    remoteMedia.srcObject = remoteStream;
    remoteMedia.play().catch(function() {
      console.log("play was rejected");
    });
  });
  session.on("bye", function(response, cause) {
    console.log("bye");
    removeSessionControlElement(session.id);
    console.log("session status " + session.status);
  });
}

function removeSessionControlElement(id) {
  let sessionElToDelete = document.getElementById("sessionId" + id);
  if (sessionElToDelete) {
    softphoneWorkCallWrapper.classList.toggle("hidden", false);
    sessionList.removeChild(sessionElToDelete);
    localStorage.setItem("onCloseCallSession", id);
    localStorage.removeItem("isIncomingInviteWaiting");
    localStorage.removeItem("isActiveCall");
    localStorage.removeItem("activeCallBtnState");
  }
}

window.addEventListener("storage", handleStorageEvents);
openSipSession();
