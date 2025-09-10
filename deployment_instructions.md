# How to Fix the "Error Creating Link"

This error is happening because the backend code (Cloud Functions) for this project has not been activated on your Firebase account yet. The frontend part of the website is trying to call backend code that doesn't exist in the cloud.

You do **not** need to create Firestore collections manually. The code will do that for you automatically once the functions are deployed.

To fix this, you need to deploy the functions. Please follow these steps carefully.

### Prerequisites

1.  **Node.js Installed:** You must have Node.js installed on your computer. If you don't, download it from [https://nodejs.org/](https://nodejs.org/).
2.  **Firebase CLI Installed:** You need the Firebase Command Line Interface (CLI). If you don't have it, open your terminal (Command Prompt, PowerShell, or Terminal on Mac/Linux) and run this command:
    ```
    npm install -g firebase-tools
    ```

### Deployment Steps

**Step 1: Log in to Firebase**

   - Open your terminal.
   - Run the following command to log in to your Google account:
     ```
     firebase login
     ```
   - A browser window will open. Log in with the same Google account you used to create the "moiz-links" Firebase project.

**Step 2: Select Your Firebase Project**

   - In the terminal, navigate to the main project directory (`c:/Users/Abdul Moiz/Desktop/Apps/Moiz Links`).
   - Run this command to make sure the CLI is using your new project:
     ```
     firebase use moiz-links
     ```
   - The terminal should confirm that you are now using the `moiz-links` project.

**Step 3: Install Function Dependencies**

   - Navigate into the `functions` sub-directory. This is a critical step.
     ```
     cd functions
     ```
   - Once you are inside the `functions` directory, install the necessary packages by running:
     ```
     npm install
     ```
   - Wait for it to finish. You will see a `node_modules` folder appear inside the `functions` directory.

**Step 4: Deploy the Functions**

   - While still inside the `functions` directory, run the deployment command:
     ```
     firebase deploy --only functions
     ```
   - This process will take a few minutes. It will package up the code in `functions/index.js` and send it to your Firebase project.
   - Wait for the "Deploy complete!" message in the terminal.

Once you have successfully completed these steps, the "Error creating link" will be resolved, and your application will work as expected.
