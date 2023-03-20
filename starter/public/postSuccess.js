// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/drive";

// TODO(developer): Set to client ID and API key from the Developer Console
const CLIENT_ID =
  "REPLACE YOUR CLIENT ID";
const API_KEY = "REPLACE YOUR API KEY";

// TODO(developer): Replace with your own project number from console.developers.google.com.
const APP_ID = "REPLACE YOUR APP ID";



let tokenClient;
let accessToken = null;
let pickerInited = false;
let gisInited = false;

document.getElementById("authorize_button").style.visibility = "hidden";

/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
  gapi.load("client:picker", initializePicker);
}


/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function initializePicker() {
  await gapi.client.load(
    "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
  );
  pickerInited = true;
  maybeEnableButtons();
}


/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: "", // defined later
  });
  gisInited = true;
  maybeEnableButtons();
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
  if (pickerInited && gisInited) {
    document.getElementById("authorize_button").style.visibility = "visible";
  }
}


/**
 *  Sign in the user upon button click.
 */
function handleAuthClick() {
  tokenClient.callback = async (response) => {
    if (response.error !== undefined) {
      throw response;
    }
    accessToken = response.access_token;
    document.getElementById("authorize_button").innerText = "Change Photo";
    await createPicker();
  };

  if (accessToken === null) {
    // Prompt the user to select a Google Account and ask for consent to share their data
    // when establishing a new session.
    tokenClient.requestAccessToken({ prompt: "consent" });
  } else {
    // Skip display of account chooser and consent dialog for an existing session.
    tokenClient.requestAccessToken({ prompt: "" });
  }
}


/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick() {
  if (accessToken) {
    accessToken = null;
    google.accounts.oauth2.revoke(accessToken);
    document.getElementById("content").innerText = "";
    document.getElementById("authorize_button").innerText = "Authorize";
  }
}


/**
 *  Create and render a Picker object for searching images.
 */
function createPicker() {
  const view = new google.picker.View(google.picker.ViewId.DOCS);
  view.setMimeTypes("image/png,image/jpeg,image/jpg");
  const picker = new google.picker.PickerBuilder()
    .enableFeature(google.picker.Feature.NAV_HIDDEN)
    .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
    .setAppId(APP_ID)
    .setOAuthToken(accessToken)
    .addView(view)
    .addView(new google.picker.DocsUploadView())
    .setCallback(pickerCallback)
    .build();
  picker.setVisible(true);
}



/**
 * Displays the file details of the user's selection.
 * @param {object} data - Containers the user selection from the picker
 */
async function pickerCallback(data) {
  if (data.action === google.picker.Action.PICKED) {
    let text = `Picker response: \n${JSON.stringify(data, null, 2)}\n`;
    const document = data[google.picker.Response.DOCUMENTS][0];
    const fileId = document[google.picker.Document.ID];
    console.log(fileId);
    gapi.client.drive.permissions
      .create({
        fileId: fileId,
        role: "reader",
        type: "anyone",
      })
      .then((success) => {
        console.log(success);
      });
    window.document.getElementById(
      "profile-picture"
    ).src = `https://drive.google.com/uc?export=view&id=${fileId}`;
    window.document.getElementById(
      "profile-link"
    ).value = `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
}



// Show success window when finished insert data into spreadsheet
window.addEventListener("load", function () {
  const form = document.getElementById("my-form");
  const loader = document.getElementById("loader");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    loader.style.display = "block";
    const data = new FormData(form);
    const action = e.target.action;
    fetch(action, {
      method: "POST",
      body: data,
    })
      .then(() => {
        alert("Success!");
      })
      .finally(() => {
        loader.style.display = "none";
      });
  });
});
