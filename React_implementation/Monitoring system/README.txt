━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  MediTrack - Patient Monitoring System
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: Add CorsConfig.java to Spring Boot
  Copy CorsConfig.java to:
  src/main/java/com/example/patient_monitoring_system/config/CorsConfig.java
  Then restart Spring Boot.

STEP 2: Open CMD inside this folder (meditrack2)
  → Open this folder in File Explorer
  → Click address bar → type cmd → press Enter

STEP 3: Run these commands
  npm install
  npm start

App opens at: http://localhost:3000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOW TO USE LOGIN / SIGNUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SIGNUP (first time):
  1. Click "Sign up here"
  2. Choose Patient or Doctor tab
  3. Fill in your details
  4. After signup, you get your ID (e.g. Patient ID: 1)
  5. SAVE that ID — you need it to login!

LOGIN:
  1. Enter your ID (pId for Patient, dId for Doctor)
  2. Enter your Contact (pContact or dContact)
  3. Click Login

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
