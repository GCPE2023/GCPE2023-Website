/* exported gapiLoaded */
/* exported gisLoaded */
/* exported handleAuthClick */
/* exported handleSignoutClick */

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/drive';

// TODO(developer): Set to client ID and API key from the Developer Console
const CLIENT_ID = '507701161714-qh4hpbbhv565c7r8ni4fa71dnr93ga0d.apps.googleusercontent.com';
const API_KEY = 'AIzaSyDFan7V1_MKMjJcZ1uAU47kXovI-jBHxPY';

// TODO(developer): Replace with your own project number from console.developers.google.com.
const APP_ID = '507701161714';

let tokenClient;
let accessToken = null;
let pickerInited = false;
let gisInited = false;


document.getElementById('authorize_button').style.visibility = 'hidden';
// document.getElementById('signout_button').style.visibility = 'hidden';

/**
  * Callback after api.js is loaded.
  */
function gapiLoaded() {
  gapi.load('client:picker', initializePicker);
}

/**
  * Callback after the API client is loaded. Loads the
  * discovery doc to initialize the API.
  */
async function initializePicker() {
  await gapi.client.load('https://www.googleapis.com/discovery/v1/apis/drive/v3/rest');
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
    callback: '', // defined later
  });
  gisInited = true;
  maybeEnableButtons();
}

/**
  * Enables user interaction after all libraries are loaded.
  */
function maybeEnableButtons() {
  if (pickerInited && gisInited) {
    document.getElementById('authorize_button').style.visibility = 'visible';
  }
}

/**
  *  Sign in the user upon button click.
  */
function handleAuthClick() {
  tokenClient.callback = async (response) => {
    if (response.error !== undefined) {
      throw (response);
    }
    accessToken = response.access_token;
    // document.getElementById('signout_button').style.visibility = 'visible';
    document.getElementById('authorize_button').innerText = 'Refresh';
    await createPicker();
  };

  if (accessToken === null) {
    // Prompt the user to select a Google Account and ask for consent to share their data
    // when establishing a new session.
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    // Skip display of account chooser and consent dialog for an existing session.
    tokenClient.requestAccessToken({ prompt: '' });
  }
}

/**
  *  Sign out the user upon button click.
  */
function handleSignoutClick() {
  if (accessToken) {
    accessToken = null;
    google.accounts.oauth2.revoke(accessToken);
    document.getElementById('content').innerText = '';
    document.getElementById('authorize_button').innerText = 'Authorize';
    // document.getElementById('signout_button').style.visibility = 'hidden';
  }
}

/**
  *  Create and render a Picker object for searching images.
  */
function createPicker() {
  const view = new google.picker.View(google.picker.ViewId.DOCS);
  view.setMimeTypes('image/png,image/jpeg,image/jpg');
  const picker = new google.picker.PickerBuilder()
    .enableFeature(google.picker.Feature.NAV_HIDDEN)
    .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
    .setDeveloperKey(API_KEY)
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
    gapi.client.drive.permissions.create({
      'fileId': fileId,
      'role': 'reader',
      'type': 'anyone'
    })
      .then((success) => {
        console.log(success)
      })
    window.document.getElementById("profile-picture").src = `https://drive.google.com/uc?export=view&id=${fileId}`
    window.document.getElementById("profile-link").value = `https://drive.google.com/uc?export=view&id=${fileId}`
    // text += `Drive API response for first document: \n${JSON.stringify(res.url, null, 2)}\n`;
  }
}

window.addEventListener("load", function () {
  const form = document.getElementById("my-form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const data = new FormData(form);
    const action = e.target.action;
    fetch(action, {
      method: "POST",
      body: data,
    }).then(() => {
      alert("Success!");
    });
  });
});
