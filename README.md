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
[![Windows](https://img.shields.io/badge/Windows-0078D6?style=flat&logo=windows&logoColor=white)](...)
</div>

---

# 🌟 Overview

Ever wondered if your data is safe or not? Ever wondered how much of your data you are actually unknowingly giving to chat applications on the internet? No???? click at this article below:

<a href="https://www.bbc.com/news/articles/c0573lj172jo" target="_blank">
  <img width="600" height="400" alt="Meta AI article" src="https://github.com/user-attachments/assets/710a0638-cc7c-4693-bbb4-043b2d39bbed" />
</a>

<br>
<br>

If you read the article your reaction is probably like this right now 

<img width="400" height="300" alt="aww-hell" src="https://github.com/user-attachments/assets/0b250dda-e09c-4c8a-97e5-71e5cecd16fc" />

<br>
<br>

Well, I have some good news for you!! , Google's recent high performance `Gemma3n model` is the answer for all your therapeutic needs! Instead of asking ChatGPT or other AI tools for therapy, why not ask **MindWell**? Your very own offline AI desktop app where you are in control of your data and you can `analyze` and `journal` your `special memories`, and view your `progress` over time.

## The Magic Behind MindWell

All of this is possible thanks to a lightweight model from Google called **"Gemma 3n"**.

Gemma 3n is truly one of a kind! You know how models create better responses based on the parameters they have? Well, Gemma 3n is unique in this case - it has a footprint of 5B parameters but operates with the memory capacity of only 2B (in the case of e2b), allowing us to create a desktop application with **2 instances of the model** when required for internal calls with much less memory and utilize the TTL mechanisims of Ollama to auto-kill the instance when in-active creating a smooth experience for the entire Desktop application itself:

- 📝 **Summarization**
- 💬 **Chat**  
- 📊 **Tracking**
- 📔 **Journaling**

**All at once!!!** How awesome is that??

<img width="480" height="270" alt="giphy-downsized" src="https://github.com/user-attachments/assets/3b8dc88c-dadc-4482-a767-86acbe20a387" />

---

Below you can check out the architecture diagram and tech stacks used in this project:

## Key Features

<div align="left">
  <img width="250" height="250" alt="gemma3n" src="https://github.com/user-attachments/assets/12d3e39c-5ba3-4be4-9ae6-98bb56408a23" />
</div>
<br>

Interact with a powerful local AI assistant from Google (Gemma3n model via Ollama) for various tasks including:
- Question answering  
- Re-affirmations  
- Wellness tracking  
- Storing Special Memories  
- Journaling  
- Language Switching  
- Exporting or accessing your database  
- and a lot more planned...
<img width="1280" height="720" alt="Streaming img" src="https://github.com/user-attachments/assets/6f88a745-5cf6-4f27-abee-628e1ea5c06c" />

---

### 😊 **Mood Tracking & Analytics**
- Log daily moods with detailed entries
- Interactive mood trend visualizations
- Insightful summaries over time
- Pattern recognition and insights
- Multilingual Summarization

<img width="1280" height="720" alt="Mindwell graph" src="https://github.com/user-attachments/assets/c5e37669-b3e9-4a8c-91bf-511d72bae65e" />
<br><br>
<img width="1280" height="720" alt="Summary, Analyze conversations" src="https://github.com/user-attachments/assets/699c9510-a9cc-4d40-91c7-34e36eb34071" />

---

### 🧠 **Memory Lane**
- Any special memories tagged by Gemma3n are stored in Memory lane
- Allows users to Journal, modify the memory on command
- Revisit old memories with timestamps
- Delete Memories on command
- Multilingual Memory storage

# Memory Lane UI

<img width="1280" height="720" alt="Memory Lane section" src="https://github.com/user-attachments/assets/6f168c2d-bfdc-45f0-aa2d-972bd1d92341" />

<br>

# Journaling/Editing Memory UI

<img width="600" height="600" alt="Put command eg" src="https://github.com/user-attachments/assets/44f28b1f-41e1-425b-989a-9b8bf174f394" />



---

### 🔧 **Customization & Accessibility**
- User name setting to utilize as context for the chat app
- default language settings to get summarization and journaling in different languages
- Adaptive UI design and interactive animations
  
<img width="1900" height="1015" alt="Settings tsx" src="https://github.com/user-attachments/assets/d9bbec63-a6e9-4c2b-bdf3-3dcfdf6e2fce" />

## 🛠 Key Components

### Custom NSIS Installer

![MindWell Installer](https://github.com/user-attachments/assets/790d84b0-ceb1-482d-866f-44bb3430fe18)

A fully configured NSIS (Nullsoft Scriptable Install System) installer bundles the entire Electron app along with required binaries. It handles:

- Offline installation of MindWell
- Offline installation of Ollama

### Integrated Terminal (xterm.js)

![Terminal Download](https://github.com/user-attachments/assets/4ab935c9-bdb7-4233-ab2a-12ee7263e2d3)

Leveraging terminal emulation via:

- `@xterm/xterm ^5.5.0` – Provides the core terminal interface
- `@xterm/addon-fit ^0.10.0` – Auto-resizes terminal to fit container

These libraries allow for an embedded terminal that displays real-time model downloads (e.g., `ollama pull gemma:3n`) during first launch.

### Bundled Ollama Installer

- The Ollama binary is pre-packaged within the app's `resources/` directory
- If not already installed, it runs immediately after Mindwell installation during setup
- Post-install, Ollama auto-updates and manages local models efficiently

## 🧠 First-Time Setup Flow

1. App launches with embedded terminal
2. Checks for ollama binary and gemma:3n model
3. If missing, silently installs Ollama
4. Runs:
   ```bash
   ollama pull gemma:3n
   ```
5. User sees progress and status via in-app terminal

## ✅ Benefits

- **Offline-ready** and installer-integrated
- **Terminal transparency** for initial first-time setups and download 
- **Seamless first-time** AI model provisioning
- **Supports auto-updating** of Ollama in background via Ollama itself
  
⚠️ **Warning**:  
If the integrated terminal fails to open due to new Ollama updates, manually pull the required model using **CMD**:

```cmd
ollama pull gemma3n:e2b
```

---

## Architecture & Tech Stack

<img width="3840" height="3354" alt="Updated loop" src="https://github.com/user-attachments/assets/eb10acdd-1052-4df9-9fba-570dabe9e8d3" />



### 🛠️ Technologies Used

| **Category** | **Technologies** | **Purpose** |
|--------------|------------------|-------------|
| **Frontend** | ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white) | User Interface & Experience |
| **UI/UX** | ![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chart.js&logoColor=white) ![Framer Motion](https://img.shields.io/badge/Framer%20Motion-0055FF?style=flat-square&logo=framer&logoColor=white) | Data Visualization & Animations |
| **Backend** | ![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat-square&logo=fastapi) | API & Business Logic |
| **AI/ML** | ![Ollama](https://img.shields.io/badge/Ollama-FF6B35?style=flat-square) ![LangChain](https://img.shields.io/badge/LangChain-121212?style=flat-square) ![Gemma 3n](https://img.shields.io/badge/Gemma3n-FFD700?style=flat-square&logo=google) | Local AI Processing |
| **Desktop** | ![Electron](https://img.shields.io/badge/Electron-191970?style=flat-square&logo=Electron&logoColor=white) | Cross-platform Desktop App |
| **Build Tools** | ![Electron Builder](https://img.shields.io/badge/Electron%20Builder-2B2E3A?style=flat-square) ![NSIS](https://img.shields.io/badge/NSIS-1E88E5?style=flat-square) | Application Packaging |

---

## 🚀 Quick Start (For Development only)

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
   - 🤖 Connect to the local Ollama instance (Ollama is necessary when running on dev environments)

### First Run Setup

1. **Install Ollama** (if not already installed)
   - Visit [ollama.ai](https://ollama.ai) and follow installation instructions
   - Pull the Gemma model: `ollama pull gemma3n:e2b`

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

Built applications will be available in `electron-app/dist/`

`Currently Scripts and Setups have been modified and created with Windows in mind only`

### Build Features

- 📦 **Standalone Executables**: No Python installation required
- 🔧 **Custom NSIS Installer**: Professional Windows installation experience
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

### 🔮 Future Plans

- [ ] Cloud sync (optional, encrypted)
- [ ] Mobile companion app
- [ ] Advanced analytics dashboard
- [ ] Integration with Mobile devices
- [ ] Voice interaction capabilities when Gemma3n updates on Ollama enabling multi-modal capabilities
- [ ] RAG implementation and so much more

---

## 🤝 Contributing

contributions from the community are wlecomed! if you have any blazing new idea make sure to let me know and do the following below to submit a pull-request:

1. **🍴 Fork the repository**
2. **🌿 Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **💻 Make your changes**
5. **📝 Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **🚀 Push to the branch** (`git push origin feature/amazing-feature`)
7. **🔀 Open a Pull Request**

(I will verify the requests manually as i haven't integrated any tests yet)

### Development Guidelines

- Follow the existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

# 🙏 Acknowledgments

This project wouldn't have been possible without the incredible contributions and innovations from various teams and communities:

## Core Technologies
- **Ollama Team** – For building an exceptional local AI infrastructure that makes running large language models accessible and efficient
- **Electron Community** – For providing the powerful desktop framework that bridges web technologies with native applications
- **React & FastAPI Teams** – For creating robust, developer-friendly tools that form the backbone of modern applications

## Community & Inspiration
- **Open Source Community** – For the endless inspiration, collaborative spirit, and unwavering support that has brought infinite joy throughout my entire Software Development Engineer career. The open-source ethos continues to fuel innovation and creativity in ways that never cease to amaze me.

## The Star of the Show
A special recognition goes to the **Google Gemma 3n Team** for creating something truly extraordinary. The innovation achieved in these models is nothing short of jaw-dropping:

- **Blazing Performance** – The response times and memory efficiency make the application feel incredibly fast and responsive
- **Exceptional Quality** – The model's output quality and reasoning capabilities are remarkable for a local deployment
- **Multi-Modal Vision** – The multi-modal capabilities make this model genuinely one-of-a-kind in the local AI space

*Note: While Ollama hasn't yet updated to support the full multi-modal capabilities of Gemma 3n, working with what's currently available has been an absolute pleasure.*

## Final Thoughts

This hackathon has been an incredibly rewarding experience. Building with cutting-edge AI technology, exploring the boundaries of what's possible with local models, and creating something meaningful in such a short timeframe has been both challenging and exhilarating.

**Thank you for this amazing opportunity** – it's experiences like these that remind me why I fell in love with software development in the first place.
---

<div align="center">

**Made with ❤️ for mental wellness and productivity**

[⭐ Star this project](https://github.com/MirangBhandari/MindWell) if you find it helpful or interesting!!

</div>
