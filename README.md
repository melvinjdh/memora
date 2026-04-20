
  # Memora

  React + Vite + TypeScript project for a Surabaya museum tourism app, with Capacitor Android already initialized.

  ## Web

  Run `npm i` to install dependencies.

  Run `npm run dev` to start the development server.

  Run `npm run build` to verify a production build.

  ## Android Studio

  This project already includes the Android folder at [android](./android).

  Recommended local setup on this laptop:
  - Android Studio: `D:\android\bin\studio64.exe`
  - Android SDK: `C:\Users\ACER\AppData\Local\Android\Sdk`
  - JDK: Java 21 is required for the current Capacitor Android toolchain

  Helpful commands:
  - `npm run android:doctor`
  - `npm run android:sync`
  - `npm run android:open`

  Suggested IDE flow:
  1. Run `npm run android:sync`
  2. Run `npm run android:open`
  3. In Android Studio, let Gradle sync finish
  4. Select an emulator or connected device
  5. Run the `app` configuration

  Notes:
  - `android/local.properties` is set to the local Android SDK path on this laptop.
  - If Android Studio uses the wrong JDK, point Gradle JDK to a Java 21 installation.
  
