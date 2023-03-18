let tokenClient;
let accessToken = null;
let pickerInited = false;
let gisInited = false;

// Use the API Loader script to load google.picker
function onApiLoad() {
    gapi.load('picker', onPickerApiLoad);
}

function onPickerApiLoad() {
    pickerInited = true;
}

function gisLoaded() {
    // TODO(developer): Replace with your client ID and required scopes
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: '507701161714-qh4hpbbhv565c7r8ni4fa71dnr93ga0d.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/drive',
        callback: '', // defined later
    });
    gisInited = true;
}

// Create and render a Google Picker object for selecting from Drive
function createPicker() {
    onApiLoad()
    gisLoaded()
    const showPicker = () => {
        // TODO(developer): Replace with your API key
        const picker = new google.picker.PickerBuilder()
            .addView(google.picker.ViewId.DOCS)
            .setOAuthToken(accessToken)
            .setDeveloperKey('AIzaSyDFan7V1_MKMjJcZ1uAU47kXovI-jBHxPY')
            .setCallback(pickerCallback)
            .build();
        picker.setVisible(true);
    }

    // Request an access token
    tokenClient.callback = async (response) => {
        if (response.error !== undefined) {
            throw (response);
        }
        accessToken = response.access_token;
        showPicker();
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
