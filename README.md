# 🛰️ OrbitSentinel
### AI-Powered Orbital Risk Analysis & Ground Communication Continuity

**OrbitSentinel** is an AI-assisted space safety prototype designed to analyze potential satellite conjunction risks and help protect critical ground-level communication services.

By combining machine learning, a simple interactive dashboard, and a ground-continuity response checklist, OrbitSentinel demonstrates how intelligent software can help space operators identify potential threats and prepare for communication disruptions.

> 🚀 Built as a hackathon MVP exploring the intersection of Agentic AI, space sustainability, machine learning, and disaster resilience.

---

## 🌍 The Problem

Earth's orbit contains thousands of active satellites and large amounts of tracked and untracked debris. Potential close approaches between orbital objects can threaten satellite operations and the services that depend on them.

A satellite communication disruption can affect:

- 🏥 Rural healthcare and telemedicine
- 🚨 Emergency response and disaster coordination
- 🌦️ Weather monitoring and forecasting
- 🌾 Agricultural monitoring
- 📡 Remote communication infrastructure

Traditional workflows can involve multiple tools, data sources, and manual analysis. There is a need for systems that make risk information easier to interpret and help ground teams prepare continuity plans.

## 💡 Our Solution

OrbitSentinel brings orbital risk analysis and ground-level impact awareness into one dashboard.

The prototype accepts an example orbital scenario, uses a machine learning classifier to estimate a demonstration risk score, and displays suggested steps for human operators to review.

### ✨ Key Features

- 🖥️ **Interactive React Dashboard** — A clean, responsive interface with bright colors and easy-to-read information cards.
- 🛰️ **Orbital Scenario Analysis** — Enter miss distance, relative speed, time to approach, and tracking uncertainty.
- 🧠 **Machine Learning Risk Estimation** — A Random Forest classifier processes scenario features.
- 📊 **Model Performance Monitoring** — View training accuracy, test accuracy, precision, recall, and F1 score.
- 🏥 **Ground Continuity Planning** — Review suggested actions for protecting critical communication-dependent services.
- 🛡️ **Human-in-the-Loop Safety** — The system provides recommendations for review instead of automatically controlling satellites.
- ⚡ **Python API Integration** — FastAPI connects the React frontend to the ML model.

## 🏗️ System Architecture

```text
              ┌─────────────────────────┐
              │     React Dashboard     │
              │   HTML + CSS + React    │
              └────────────┬────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │       FastAPI API       │
              │   Scenario Processing   │
              └────────────┬────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │   Random Forest Model   │
              │  Demo Risk Estimation   │
              └────────────┬────────────┘
                           │
                ┌──────────┴───────────┐
                ▼                      ▼
      ┌──────────────────┐   ┌──────────────────┐
      │  Risk Dashboard  │   │ Ground Continuity│
      │ Score & Metrics  │   │    Checklist     │
      └──────────────────┘   └──────────────────┘
```

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React | Interactive user interface |
| HTML5 | Application entry point and page structure |
| CSS3 | Responsive layout, colors, and styling |
| JavaScript | Frontend interactions and API requests |
| Python | Backend and ML implementation |
| FastAPI | REST API |
| scikit-learn | Random Forest classifier and evaluation metrics |
| NumPy | Synthetic dataset generation and numerical operations |
| Vite | Frontend development server |

## 🤖 Machine Learning Approach

OrbitSentinel uses a **Random Forest classifier** to demonstrate orbital scenario risk classification.

### Input Features

| Feature | Description |
|---|---|
| Miss distance | Example closest separation between orbital objects, in km |
| Relative speed | Relative velocity, in km/s |
| Time to approach | Time until the example closest approach, in hours |
| Tracking uncertainty | Example uncertainty value, in km |

### Model Configuration

The prototype uses the following settings to control model complexity:

- Number of estimators: `160`
- Maximum tree depth: `6`
- Minimum samples per leaf: `4`
- Training/test split: `75% / 25%`
- Class weighting: `balanced`

### Preventing Underfitting and Overfitting

The model uses depth limits and a minimum leaf size to reduce overly complex decision rules. A held-out test set helps evaluate how well it generalizes beyond its training examples.

The dashboard compares training and test accuracy and reports precision, recall, and F1 score.

**Important:** The current model is trained on synthetic educational data. Its scores are not real collision probabilities, and good test metrics on synthetic data do not establish operational accuracy. Real-world use would require validated historical conjunction data, orbital uncertainty information, appropriate temporal validation, and domain-expert review.

## 🚀 Getting Started

Follow these steps to run OrbitSentinel locally.

### Prerequisites

Install the following:

- [Python](https://www.python.org/downloads/)
- [Node.js and npm](https://nodejs.org/)
- [Visual Studio Code](https://code.visualstudio.com/)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/OrbitSentinel.git
cd OrbitSentinel
```

Replace `YOUR_USERNAME` with your GitHub username and `OrbitSentinel` with your repository name if different.

### 2. Set up the backend

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment.

**Windows PowerShell:**

```powershell
.venv\Scripts\Activate.ps1
```

**macOS/Linux:**

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the backend:

```bash
uvicorn main:app --reload
```

The API will be available at:

`http://127.0.0.1:8000`

Interactive API documentation is available at:

`http://127.0.0.1:8000/docs`

### 3. Set up the frontend

Open a second terminal and navigate to the frontend directory from the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL shown by Vite, typically:

`http://localhost:5173`

Keep both the frontend and backend running while using the application.

## 📁 Project Structure

```text
OrbitSentinel/
│
├── backend/
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       └── styles.css
│
├── README.md
└── .gitignore
```

## 🔮 Future Enhancements

OrbitSentinel can be extended with:

- Integration with public orbital element sources such as [CelesTrak](https://celestrak.org/).
- SGP4-based orbital propagation for supported orbital data.
- Analysis using validated conjunction assessments and orbital uncertainty estimates.
- Historical conjunction datasets and time-based ML evaluation.
- A ground-infrastructure dependency database for identifying affected services.
- Interactive orbital visualizations and scenario timelines.
- Notifications for authorized operators and disaster-response teams.
- A multi-agent orchestration layer for coordinating analysis and reporting tasks.

These are planned extensions and are not implemented in the current MVP.

## 🔐 Safety & Limitations

OrbitSentinel is an educational prototype, not a certified spaceflight safety system.

- The current dataset is synthetic.
- Risk scores are demonstration outputs, not calibrated collision probabilities.
- The application does not currently ingest live orbital data.
- It does not calculate flight-ready maneuver vectors.
- It does not send commands to spacecraft or propulsion systems.
- Recommendations require independent verification by qualified personnel.

The project is intended to demonstrate a software workflow for risk awareness and continuity planning, not to replace authoritative conjunction assessment or operational decision-making.

## 🤝 Contributing

Contributions and suggestions are welcome!

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Open a pull request describing your improvement.

For substantial changes, consider opening an issue first to discuss the proposed feature.

## 📜 License

This project is currently an educational prototype. Before publishing, add a license such as the MIT License if you want others to be able to reuse and modify your code under those terms.

---

**OrbitSentinel — Making space safety more understandable and ground services more resilient.** 🛰️🌍 
