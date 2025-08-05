# MindWell - Your Offline AI-Powered Therapy Assistant

<div align="center">

<img src="electron-app/src/assets/MindWell.png" alt="MindWell Logo" width="150"/>

**Your personal AI-powered assistant for mental wellness and productivity**

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

MindWell is a powerfu lcompletely offline desktop application utilizing Gemma3n as the brains behind the operation, designed to be your personal AI-powered Therapy assistant, with a special focus on mental wellness tracking, journaling and summarization. Built with privacy in mind, it runs completely offline with its own SQLLite database, ensuring your data remains secure on your machine and only you have access to it. Experience the power of Gemma3n and AI without compromising your privacy.

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

<div align="center">

```mermaid
graph TB
    A[Electron App] --> B[React Frontend]
    A --> C[Python Backend]
    B --> D[FastAPI Server]
    C --> E[Ollama AI]
    C --> F[Local JSON Storage]
    D --> G[LangChain]
    
    style A fill:#2196F3,color:#fff
    style B fill:#61DAFB,color:#000
    style C fill:#3776AB,color:#fff
    style E fill:#FF6B35,color:#fff
```

</div>

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
