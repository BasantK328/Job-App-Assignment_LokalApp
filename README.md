﻿# Job-App-Assignment_LokalApp
# React Native Job Feed App (Assignment)

A mobile application built with React Native and Expo for browsing, viewing, bookmarking, and interacting with job listings fetched from an API. Targets Android & iOS.

## Core Features

*   **Job Feed:** Infinite scrolling list of jobs with details (title, location, salary, logo).
*   **Job Details:** Dedicated screen with comprehensive info, apply (WhatsApp/Call), and share options.
*   **Bookmarking:** Save jobs for offline viewing using AsyncStorage.
*   **Offline Access:** View saved jobs in the "Saved Jobs" tab even without internet.
*   **UI:** Bottom Tab Navigation, Custom Splash Screen, Loading/Error/Empty states.

## Demo Video

** watch demo video : https://drive.google.com/file/d/1oCgn50xdmexOF4hM0JXI931klBzg6dnL/view?usp=drive_link

## Tech Stack

*   React Native / Expo
*   React Navigation (Stack, Bottom Tabs)
*   AsyncStorage
*   React Native APIs (Share, Linking)
*   JavaScript (ES6+)

## Setup & Run

1.  **Prerequisites:** Node.js, npm/yarn, Expo Go app (or simulator), Expo CLI (`npm i -g expo-cli`).
2.  **Install:** `cd [Your Repo Folder] && npm install` (or `yarn install`)
3.  **Start:** `npx expo start`
4.  **Open:** Scan QR code with Expo Go or press `a`/`i` for simulator.

## API Endpoint

*   `https://testapi.getlokalapp.com/common/jobs?page=[pageNumber]`
