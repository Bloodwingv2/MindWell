# MindWell - Your Offline AI-Powered Therapy Assistant

<div align="center">

<img src="electron-app/src/assets/MindWell.png" alt="MindWell Logo" width="150"/>

**Your personal AI-powered assistant for all your theraputic needs**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-191970?style=flat&logo=Electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Ollama](https://img.shields.io/badge/Ollama-000000?style=flat&logo=ollama&logoColor=white)](https://ollama.com/)

[![Windows](https://img.shields.io/badge/Windows-0078D6?style=flat&logo=windows&logoColor=white)](https://github.com/MirangBhandari/MindWell/releases)


[📥 Download](https://github.com/MirangBhandari/MindWell/releases) • [📖 Documentation](#) • [🐛 Report Bug](https://github.com/MirangBhandari/MindWell/issues) • [💡 Request Feature](https://github.com/MirangBhandari/MindWell/issues)

</div>

---

## 🌟 Overview

Ever wondered if your data is safe or not? Ever wondered how much of your data you are actually unknowingly giving to chat applications on the internet? No????

Well, I have just the answer for all your therapeutic needs! Instead of asking ChatGPT or other AI tools for therapy, why not ask MindWell? Your very own offline AI desktop app where you are in control of your data and you can analyze and journal your special memories, and view your progress over time.

All of this is possible thanks to a lightweight model from Google called **"Gemma3n"**.

Gemma3n is truly one of a kind! You know how models create better responses based on the parameters they have? Well, Gemma3n is unique - it has a footprint of 5B parameters but operates with the memory capacity of only 2B (in the case of e2b), allowing us to create a desktop application with 2 instances of the model when required for internal calls of summarization + chat + tracking + journaling all at once!!! How awesome is that??

Below you can check out the architecture diagram and tech stacks used in this project

> 🔒 **Privacy First**: All your data stays on your device. No cloud storage, no data sharing.

---

## ✨ Key Features

### 🤖 **Gemma3n Powered Chat**
Interact with a powerful local AI assistant from Google (Gemma3n model via Ollama) for various tasks including:
- Question answering
- Re-affirmations
- Wellness tracking
- Storing Special Memories
- Journaling
- Language Switching
- Exporting or accessing your database
- and a lot more planned...

### 😊 **Mood Tracking & Analytics**
- Log daily moods with detailed entries
- Interactive mood trend visualizations
- Insightful summaries over time
- Pattern recognition and insights

### 🎯 **Memory Lane**
- Any special memories tagged by Gemma3n are stored in Memory lane
- Allows users to Journal, modify the memory on command
- Revisit old memories with timestamps
- Delete Memories on command

### 🔧 **Customization & Accessibility**
- Personalized settings and themes
- User name setting to utilize as context for the chat app
- default langugae settings to get summarization and journaling in different languages
- Adaptive UI design and interactive animations

---

## 🏗️ Architecture & Tech Stack

```mermaid
graph TB
    A[Electron App] --> B[React.tsx Frontend]
    A --> C[Python Backend .venv]
    B --> D[FastAPI Server]
    D --> B
    C --> E[Ollama Manager]
    E --> H[Gemma 3n]
    H --> J[Conversation Buffer]
    J --> I[SQLite Storage]
    C --> F[Local JSON Storage]
    F --> I[SQLite Storage]
    D --> G[LangChain --> Prompt-Template + Question]

    style A fill:#2196F3,color:#fff
    style B fill:#61DAFB,color:#000
    style C fill:#3776AB,color:#fff
    style D fill:#05a081,color:#fff
    style E fill:#FF6B35,color:#fff
    style H fill:#FFD700,color:#000
    style J fill:#FFF176,color:#000
    style F fill:#8D6E63,color:#fff
    style I fill:#4DB6AC,color:#000
    style G fill:#6A1B9A,color:#fff
```

### 🛠️ Technologies Used

| **Category** | **Technologies** | **Purpose** |
|--------------|------------------|-------------|
| **Frontend** | ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white) | User Interface & Experience |
| **UI/UX** | ![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chart.js&logoColor=white) ![Framer Motion](https://img.shields.io/badge/Framer%20Motion-0055FF?style=flat-square&logo=framer&logoColor=white) | Data Visualization & Animations |
| **Backend** | ![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat-square&logo=fastapi) | API & Business Logic |
| **AI/ML** | ![Ollama](https://img.shields.io/badge/Ollama-FF6B35?style=flat-square) ![LangChain](https://img.shields.io/badge/LangChain-121212?style=flat-square) | Local AI Processing |
| **Desktop** | ![Electron](https://img.shields.io/badge/Electron-191970?style=flat-square&logo=Electron&logoColor=white) | Cross-platform Desktop App |
| **Build Tools** | ![Electron Builder](https://img.shields.io/badge/Electron%20Builder-2B2E3A?style=flat-square) ![NSIS](https://img.shields.io/badge/NSIS-1E88E5?style=flat-square) | Application Packaging |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MirangBhandari/MindWell.git
   cd MindWell/electron-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development environment**
   ```bash
   npm run dev
   ```
   
   This command will:
   - 🚀 Start the React development server
   - 🖥️ Launch the Electron application
   - 🐍 Initialize the Python backend
   - 🤖 Connect to the local Ollama instance

### First Run Setup

1. **Install Ollama** (if not already installed)
   - Visit [ollama.ai](https://ollama.ai) and follow installation instructions
   - Pull the Gemma model: `ollama pull gemma`

2. **Launch MindWell**
   - The application will automatically detect your Ollama installation
   - Complete the initial setup wizard
   - Start exploring your new AI assistant!

---

## 📦 Build & Distribution

### Building for Production

| Platform | Command | Output |
|----------|---------|--------|
| **Windows** | `npm run dist:win` | `.exe` installer |
| **macOS** | `npm run dist:mac` | `.dmg` installer |
| **Linux** | `npm run dist:linux` | `.AppImage` / `.deb` |

Built applications will be available in `electron-app/dist/`

### Build Features

- 📦 **Standalone Executables**: No Python installation required
- 🔧 **Custom NSIS Installer**: Professional Windows installation experience
- 🍎 **macOS Code Signing**: Ready for distribution (certificate required)
- 🐧 **Linux AppImage**: Universal Linux compatibility

---

## 🛣️ Development Roadmap

### ✅ Completed

- [x] Core Electron application setup
- [x] React-based UI with TypeScript
- [x] FastAPI backend integration
- [x] Ollama AI integration
- [x] Mood tracking with Chart.js visualizations
- [x] Goal management system
- [x] Digital journaling (Memory Lane)
- [x] Wellness tracking
- [x] Cross-platform build system
- [x] Python-less packaging

### 🚧 In Progress

- [ ] Advanced AI conversation memory
- [ ] Data export/import functionality
- [ ] Customizable themes
- [ ] Plugin system architecture

### 🔮 Future Plans

- [ ] Cloud sync (optional, encrypted)
- [ ] Mobile companion app
- [ ] Advanced analytics dashboard
- [ ] Integration with wearable devices
- [ ] Voice interaction capabilities

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **🍴 Fork the repository**
2. **🌿 Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **💻 Make your changes**
4. **✅ Run tests** (`npm test`)
5. **📝 Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **🚀 Push to the branch** (`git push origin feature/amazing-feature`)
7. **🔀 Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Ollama Team** for the amazing local AI infrastructure
- **Electron Community** for the powerful desktop framework
- **React & FastAPI Teams** for the robust development tools
- **Open Source Community** for inspiration and support

---

<div align="center">

**Made with ❤️ for mental wellness and productivity**

[⭐ Star this project](https://github.com/MirangBhandari/MindWell) if you find it helpful!

</div>
