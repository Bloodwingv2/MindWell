# MindWell - Your Offline AI-Powered Desktop Assistant

MindWell is a desktop application designed to be your personal AI-powered assistant, focusing on mental wellness and productivity. It runs completely offline, ensuring your data remains private and secure on your machine. MindWell is built with a modern tech stack, featuring a React-based frontend, a Python backend with FastAPI, and Electron for cross-platform desktop compatibility.

![MindWell Screenshot](https://i.imgur.com/your-screenshot.png) <!-- Replace with an actual screenshot -->

## ✨ Features

MindWell offers a suite of features to help you track your mood, set goals, and reflect on your memories:

*   **🧠 AI-Powered Chat:** Interact with a powerful AI assistant (powered by Ollama and a local Gemma model) for a wide range of tasks, from answering questions to creative writing.
*   **😊 Mood Summarizer:** Log your daily moods and get insightful summaries over time. Visualize your mood trends with interactive charts.
*   **🎯 Goal Setter:** Define, track, and manage your personal and professional goals to stay motivated and focused.
*   **📝 Memory Lane:** A digital journal to record your thoughts, experiences, and memories.
*   **🌿 Wellness Tracker:** Monitor your daily habits and wellness activities to promote a healthy lifestyle.
*   **🔒 Offline and Private:** All your data is stored locally on your computer. No need for an internet connection.
*   **⚙️ Customizable Settings:** Tailor the application to your preferences.
*   **🗣️ Text-to-Speech:** Have the AI's responses read aloud to you.

## 🛠️ Tech Stack

MindWell is built with a combination of modern and powerful technologies:

| Category          | Technology                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| **Frontend**      | [React](https://react.dev/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/) |
| **UI/UX**         | [Chart.js](https://www.chartjs.org/), [Framer Motion](https://www.framer.com/motion/)                   |
| **Backend**       | [Python](https://www.python.org/), [FastAPI](https://fastapi.tiangolo.com/)                             |
| **AI/ML**         | [Ollama](https://ollama.ai/), [LangChain](https://www.langchain.com/)                                    |
| **Desktop App**   | [Electron](https://www.electronjs.org/)                                                                |
| **Database**      | Local JSON files for mood logs and memories.                                                           |
| **Installer**     | [Electron Builder](https://www.electron.build/), [NSIS](https://nsis.sourceforge.io/Main_Page)          |

## 🏗️ Architecture

The project follows a monorepo-like structure, with the frontend, backend, and Electron code all managed within a single repository.

*   **Frontend:** The React application, located in the `electron-app/src/ui` directory, provides the user interface. It communicates with the backend via HTTP requests to the FastAPI server.
*   **Backend:** The Python-based backend, found in `electron-app/src/Binaries`, is built with FastAPI. It exposes a REST API for the frontend to consume. The backend is responsible for handling business logic, interacting with the AI models, and managing data storage.
*   **Electron:** The Electron application, configured in `electron-app/src/electron`, wraps the frontend and backend into a cohesive desktop experience. It manages the application window, system tray integration, and other native functionalities.
*   **Python-less Virtual Environment:** The Python backend is packaged as a standalone executable using PyInstaller. This allows the application to run on users' machines without requiring them to have Python installed. The `backend.bat` script is used to launch the Python server in the development environment.

## 🚀 Getting Started

To get MindWell up and running on your local machine, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/Gemmatalk.git
    cd Gemmatalk/electron-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the application in development mode:**
    ```bash
    npm run dev
    ```
    This will start the React development server, the Electron application, and the Python backend concurrently.

## 📦 Build and Distribution

To build the application for production and create installers for different operating systems, use the following commands:

*   **Build for Windows:**
    ```bash
    npm run dist:win
    ```

*   **Build for macOS:**
    ```bash
    npm run dist:mac
    ```

*   **Build for Linux:**
    ```bash
    npm run dist:linux
    ```

The distributable files will be located in the `electron-app/dist` directory.

##  Work Done in Stages

The development of MindWell was carried out in several stages:

1.  **Electron Setup:** The initial phase involved setting up the basic Electron application structure, including the main and preload scripts.
2.  **Frontend Development:** The user interface was built using React and TypeScript. Different components were created for each feature, such as the `MoodSummarizer`, `GoalSetter`, and `WellnessTracker`.
3.  **Backend Development:** The FastAPI backend was developed to handle the application's logic. This included creating API endpoints for the frontend, integrating with the Ollama and LangChain libraries for AI functionality, and setting up the data storage.
4.  **Electron Builder and NSIS:** The application was packaged for distribution using Electron Builder. A custom NSIS script (`installer-script.nsi`) was created to customize the Windows installer.
5.  **Python-less Packaging:** The Python backend was packaged into a standalone executable to create a "python-less" environment, making it easy for users to run the application without any complex setup.
6.  **Icon and Branding:** The application's icon and branding were designed to create a unique identity for MindWell.

## 📜 License

This project is licensed under the [MIT License](LICENSE).
