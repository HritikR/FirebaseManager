# Firebase Manager

**Firebase Manager** is a tool that helps you quickly test and explore Firebase projects. It’s made for pentesters and researchers who often come across Firebase configs while reverse engineering websites.

Instead of writing new code every time, Firebase Manager lets you plug in a config and start testing right away.

---

### Why I Built This

While pentesting or analyzing web apps, I often find Firebase being used for things like:

- Firestore (database)
- Authentication
- Storage

To test them, I used to copy the config, write boilerplate code, figure out collection names, etc. Doing this over and over again was slow and annoying.

So I built **Firebase Manager** to automate and speed up the process.

---

## Features

- **Easy Setup**

  - Drop a config file
  - Paste a JSON string
  - just paste the `firebaseConfig` constant from the JS code (best option).

- **Authentication Testing**

  - Sign in with email and password
  - Useful for checking if authentication is working or misconfigured

- **Firestore Explorer**

  - Query any collection
  - Use filters like `where` and `limit`
  - No need to hardcode collection names
  - Saves collection name to localStorage

- **Storage Explorer**

  - Browse public files in Firebase Storage (if access is allowed)
  - View file info or download them

---

## Getting Started

1. Clone the repo:

   ```bash
   git clone https://github.com/HritikR/FirebaseManager.git
   cd FirebaseManager
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the server:

   ```bash
   npm run build
   ```

4. Start the server:

   ```bash
   npm start
   ```

5. Paste or drop your Firebase config and start testing.

---

## Disclaimer

This tool is for **educational and legal testing purposes only**.
Do **not** use it on any Firebase project you don’t have permission to test.

---

## 📌 TODO

- Add support for Realtime Database
- Add google login to authentication
- Add user account creation

---
