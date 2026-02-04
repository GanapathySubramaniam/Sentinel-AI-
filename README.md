<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🛡️ SentinelAI - Built to See Threats First

**A comprehensive, AI-powered security auditor for cloud, hybrid, and hypervisor environments.**

SentinelAI is an advanced **multimodal compliance automation platform** that performs unified security audits across 40+ compliance frameworks simultaneously. Leveraging Google's Gemini 3.0 AI with extended thinking, SentinelAI delivers precise threat detection, attack simulations, and remediation guidance tailored to your infrastructure and role.

---

## 🎯 Core Features

### 🔍 **Unified Compliance Auditing**
- **40+ Compliance Standards** including:
  - **Cloud & General**: SOC2 Type II, ISO/IEC 27001, CIS Controls v8, CSA Cloud Controls Matrix
  - **AI & Emerging Tech**: NIST AI RMF 1.0, ISO/IEC 42001, EU AI Act, OWASP Top 10 for LLMs
  - **Government & NIST**: NIST CSF 2.0, NIST SP 800-53 r5, FedRAMP (Moderate/High), CMMC 2.0
  - **Finance & Payments**: PCI-DSS v4.0.1, FINRA, GLBA, SOX, NYDFS 500, SWIFT CSCF
  - **Healthcare**: HIPAA, HITRUST CSF, GxP (FDA 21 CFR Part 11)
  - **Privacy & Global**: GDPR, CCPA/CPRA, LGPD, PIPL
  - **Critical Infrastructure**: NERC CIP, TISAX, IEC 62443, FERPA
- Automatically maps findings across all selected standards
- Regional compliance filtering (US, EU, APAC, LATAM, Global)

### 🎭 **Persona-Driven Analysis**
- **4 Expert Perspectives**:
  - **CISO**: Business risk and executive summary focus
  - **DevSecOps**: Automation and infrastructure-as-code focus
  - **Compliance Auditor**: Regulatory alignment and control mappings
  - **Software Developer**: Actionable fixes and code-level remediation
- Each persona receives tailored vocabulary, priorities, and recommendations

### 📊 **Comprehensive Security Analysis**
- **Executive TL;DR** (Persona-specific)
- **Supply Chain & Dependency Discovery**
- **MITRE ATT&CK Matrix Mapping**
- **Threat Modeling with Visual Attack Surfaces** (Mermaid.js diagrams)
- **Multi-Standard Gap Analysis** with control-to-standard cross-mapping
- **Infrastructure-as-Code Remediation** (Terraform blocks)
- **Authoritative Citations & References** to standard documentation

### 🚨 **Red Team Strike Simulation**
- **Advanced Attack Simulation Engine**
- **Cyber Kill Chain Visualization**:
  - Reconnaissance
  - Weaponization
  - Delivery
  - Exploitation
  - Installation
  - Command & Control
  - Actions on Objectives
- **Technical PoC** (Python, Bash, Go code snippets)
- **Business Impact Assessment**
- **MITRE ATT&CK Technique Mapping**
- **Remediation Priority Scoring**

### 💬 **Interactive Remediation Copilot**
- Real-time chat interface for technical questions
- File upload support (Terraform, YAML, JSON configs)
- Image analysis for architecture diagrams
- Report modification suggestions
- Citation persistence and context awareness

### 🎨 **Advanced UI/UX**
- **War Room Mode**: Retro-cyberpunk CRT terminal aesthetic with customizable themes (Green, Amber, Cyan)
- **Multi-Tab Interface**: Switch between Security Reports and Attack Simulations
- **Floating Dock Navigation**: Quick access to all analysis tools
- **Report Versioning**: Track all analysis changes with timestamps
- **Export Capabilities**: Download reports as PDF/JSON
- **Print-Friendly Layouts**: Professional compliance documentation
- **Voice Uplink Support**: Microphone integration for hands-free interaction

### 📁 **Multimodal Input Support**
- Text-based architecture descriptions
- PDF and document uploads
- Code configuration files (Terraform, YAML, JSON)
- Image attachments (architecture diagrams, screenshots)
- File attachments are intelligently parsed and integrated into analysis

### 🔒 **Enterprise-Grade Features**
- Extended thinking with Google Gemini 3.0 (8192-token budget for deep analysis)
- Structured JSON output parsing
- Real-time streaming responses
- Session persistence with analysis history
- Professional report generation

---

## 📋 Requirements

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Google Gemini API Key** (free tier available)

---

## 🚀 Quick Start

### 1. **Clone the Repository**
```bash
git clone https://github.com/GanapathySubramaniam/Sentinel-AI-.git
cd Sentinel-AI-
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Configure API Key**
Create a `.env.local` file in the root directory:
```env
VITE_GEMINI_API_KEY=your_api_key_here
API_KEY=your_api_key_here
```

Get your free Gemini API key at: https://ai.google.dev/

### 4. **Run Development Server**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 5. **Build for Production**
```bash
npm run build
npm run preview
```

---

## 🏗️ Project Architecture

### **Tech Stack**
- **Frontend Framework**: React 19.2.3 + TypeScript
- **Build Tool**: Vite 6.2.0
- **UI Components**: Lucide React (Icons), React Markdown
- **AI Engine**: Google Genai (Gemini 3.0 Pro Preview)
- **Diagrams**: Mermaid 11.4.1
- **Styling**: Tailwind CSS (via Vite)

### **Directory Structure**
```
sentinelai/
├── App.tsx                    # Main application component
├── index.tsx                  # React entry point
├── index.html                 # HTML template
├── types.ts                   # TypeScript interfaces & enums
├── metadata.json              # App metadata
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies & scripts
│
├── services/
│   ├── geminiService.ts       # Google Gemini API integration
│   └── liveService.ts         # Live/streaming service
│
└── components/
    ├── InputForm.tsx          # Initial compliance/persona form
    ├── AnalysisResult.tsx      # Main report display & tools
    ├── AttackSimulation.tsx    # Red Team strike engine UI
    ├── RemediationChat.tsx     # AI Copilot chat interface
    ├── MermaidDiagram.tsx      # Attack surface visualization
    ├── CitationViewer.tsx      # Standards reference links
    ├── GapViewer.tsx           # Control gap analysis
    ├── SystemIntegrity.tsx     # System health metrics
    ├── VoiceUplink.tsx         # Voice interaction support
    ├── JsonInspector.tsx       # Raw JSON data viewer
    ├── DynamicInputForm.tsx    # Adaptive form generation
    ├── LoadingState.tsx        # Loading state with animations
    └── Other utilities...
```

---

## 🎓 Usage Guide

### **Basic Workflow**

1. **Start an Assessment**
   - Describe your architecture (cloud infrastructure, APIs, databases, etc.)
   - Select compliance standards (multi-select supported)
   - Choose your persona (CISO, DevSecOps, Auditor, Developer)
   - Optionally attach files (configs, diagrams)

2. **Review the Report**
   - Executive Summary (persona-tailored)
   - Threat modeling with Mermaid diagrams
   - Gap analysis across standards
   - MITRE ATT&CK mappings
   - Remediation guidance with Terraform code

3. **Simulate Attacks**
   - Switch to "Attack Simulation" tab
   - Watch the Red Team execute a realistic cyber kill chain
   - Understand business impact
   - Prioritize fixes based on exploit complexity

4. **Chat with Copilot**
   - Ask technical questions
   - Upload specific config files for deep analysis
   - Request report modifications
   - Get remediation guidance

5. **Export & Share**
   - Download as PDF for executives
   - Export as JSON for integrations
   - Print for compliance audits
   - Track version history

---

## 🔐 Security & Compliance

SentinelAI itself adheres to:
- ✅ No data retention (stateless assessments)
- ✅ API calls only sent to Google Gemini
- ✅ GDPR-compliant with local processing option
- ✅ No telemetry or user tracking
- ✅ Open-source codebase for transparency

---

## 🤝 Contributing

We welcome contributions! 

**Developed by:**
- [Archer Sharma](https://www.linkedin.com/in/archersharma/)
- [Ganapathy Subramaniam](https://www.linkedin.com/in/ganapathy-subramaniam-sundar-b08aa222b/)
- [Priyanka Sharma](https://www.linkedin.com/in/priyanka-sharma-202a1320/)

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🆘 Troubleshooting

### **API Key Issues**
- Ensure `VITE_GEMINI_API_KEY` is set correctly in `.env.local`
- Generate a new key at https://ai.google.dev/
- Verify the key has access to Gemini 3.0 models

### **Build Errors**
- Clear `node_modules`: `rm -r node_modules && npm install`
- Clear Vite cache: `rm -r dist .vite`
- Ensure Node.js version >= 18

### **Large Files / Timeouts**
- Reduce input complexity for faster analysis
- Use War Room mode for visual feedback during processing
- Consider streaming responses in production deployments

---

## 🔗 Useful Links

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [NIST CSF 2.0](https://nvlpubs.nist.gov/nistpubs/csf/NIST.CSF.1.1.pdf)
- [ISO/IEC 27001:2022](https://www.iso.org/standard/27001)
- [OWASP Top 10 for LLMs](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- [MITRE ATT&CK Framework](https://attack.mitre.org/)
- [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks/)
- [PCI-DSS v4.0.1](https://www.pcisecuritystandards.org/)

---

## 📞 Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Contact the development team via LinkedIn (links above)
- Check existing issues for solutions

---

**© 2026 SentinelAI Security Systems. Automated Multimodal Compliance Auditor & Strike Engine.**

*Built to see threats first.* 🛡️
