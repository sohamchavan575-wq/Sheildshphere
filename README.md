```markdown
# Shieldsphere — Static site with Firebase Authentication + Firestore

This repository contains a static site (Shieldsphere) with a Login/Register/Forgot flow (email & phone OTP) using Firebase Authentication, and feedback storage in Firestore.

After you upload these files to the new repository, follow the short next steps below.

## Next steps (short)
1. Edit firebase-config.js in the repo (GitHub web editor is fine) and paste your Firebase web app config:
   export const firebaseConfig = { apiKey: "...", authDomain: "...", projectId: "...", ... };

2. Firebase Console:
   - Create a Firebase project: https://console.firebase.google.com/
   - Add a Web App and copy its config into `firebase-config.js`.
   - Authentication → Sign-in method → enable Email/Password and Phone.
   - (Optional dev tip) Add a test phone number in Authentication → Sign-in method → Phone to avoid SMS cost.
   - Firestore → Create database (test mode is fine for development).

3. (Recommended) Firestore rules for basic protection:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /feedback/{docId} {
         allow create: if request.auth != null;
         allow read: if request.auth != null;
       }
     }
   }
   ```

4. Test locally (phone auth reCAPTCHA works on localhost):
   - Run in repo folder: `python -m http.server 8000`
   - Open: http://localhost:8000/Login.html

5. Make the repo a GitHub Pages site:
   - If repo name is `yourusername.github.io` it will publish automatically.
   - Otherwise open the repo → Settings → Pages → set Branch = main (root) and save; wait a few minutes.

If you want, once you finish uploading, paste the repository URL here and I will:
- tell you the exact firebase-config.js content to paste (or produce it if you paste the Firebase config object),
- walk you step-by-step to enable Firebase providers and Firestore,
- verify the sign-up / sign-in flows and help publish Pages if needed.
```
