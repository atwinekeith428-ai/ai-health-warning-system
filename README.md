# 🏥 AI-Based Early Warning System

> **Early Detection. Better Decisions. Healthier Mothers and Babies.**

An AI-powered web application that analyzes key health indicators to provide early warnings for potential health risks in expectant mothers and newborn babies.

🔗 **Live Demo:** [ai-health-warning-system-6ss45kpoq-keithan.vercel.app](https://ai-health-warning-system-6ss45kpoq-keithan.vercel.app)

---

## ✨ Features

### 👤 Maternal Health Assessment
- AI-powered risk prediction based on 6 key health indicators
- Real-time risk classification: **Low / Mid / High Risk**
- Detailed explanation of identified risk factors
- Automatic recommended actions for each patient

### 👶 Newborn Health Assessment
- Risk detection based on birth weight, temperature, respiratory rate, oxygen saturation, and feeding observation
- Rule-based prediction with clear risk categorization

### 📋 Patient Records Management
- Save, view, edit, and delete patient records
- Full CRUD operations backed by a real database
- Search and filter by patient name, mother's name, or risk level
- Patient detail page with complete vitals and assessment history

### 📊 Analytics & Reports
- Weekly activity chart
- Risk distribution visualization
- High-risk patient alerts
- Recent activity feed
- Dynamic KPI dashboard

### 🔐 Authentication
- User login/logout
- Protected routes
- Personalized dashboard header

### 📱 Responsive Design
- Mobile-first, works on any screen size
- Collapsible sidebar on mobile
- Touch-friendly controls

---

## 🧠 AI Model

The maternal risk prediction uses a **Random Forest Classifier** trained on the [Maternal Health Risk Data Set](https://archive.ics.uci.edu/ml/datasets/Maternal+Health+Risk+Data+Set).

| Metric | Value |
|--------|-------|
| Algorithm | Random Forest (100 estimators) |
| Training samples | 1,000+ |
| Accuracy | 81.28% |
| Features | Age, Systolic BP, Diastolic BP, Blood Sugar, Body Temp, Heart Rate |
| Classes | Low Risk, Mid Risk, High Risk |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** — UI framework
- **Vite** — Build tool
- **Tailwind CSS** — Styling
- **React Router** — Client-side routing
- **Lucide-style emoji icons** — Visual language

### Backend
- **Python 3** — Core language
- **FastAPI** — Web framework
- **SQLAlchemy 1.4** — ORM
- **SQLite** — Database (dev & production)
- **Pydantic** — Data validation

### AI/ML
- **scikit-learn** — ML library
- **pandas** — Data manipulation
- **joblib** — Model serialization

### Deployment
- **Vercel** — Frontend hosting
- **Render** — Backend hosting
- **GitHub** — Version control

---

## 🚀 Run Locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### 1. Clone the repository
```bash
git clone https://github.com/atwinekeith428-ai/ai-health-warning-system.git
cd ai-health-warning-system
```

### 2. Set up the backend
```bash
cd backend
py -m pip install -r requirements.txt
py train_model.py        # Trains the ML model (only needed once)
py -m uvicorn main:app --reload
```
Backend runs at **http://127.0.0.1:8000**
API docs: **http://127.0.0.1:8000/docs**

### 3. Set up the frontend
Open a **new terminal**:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at **http://localhost:5173**

### 4. Log in
- **Email:** any valid email (e.g., `ambrose@hospital.com`)
- **Password:** any 4+ character password (e.g., `demo123`)

---

## 📁 Project Structure

```
ai-health-warning-system/
├── backend/
│   ├── main.py                     # FastAPI app + endpoints
│   ├── database.py                 # SQLAlchemy models
│   ├── train_model.py              # ML training script
│   ├── requirements.txt            # Python dependencies
│   ├── Procfile                    # Render start command
│   ├── maternal_risk_model.pkl     # Trained model
│   ├── label_encoder.pkl           # Label encoder
│   └── Maternal Health Risk Data Set.csv
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx          # Sidebar + main content
    │   │   └── Toast.jsx           # Notification component
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Maternal.jsx
    │   │   ├── Newborn.jsx
    │   │   ├── Records.jsx
    │   │   ├── PatientDetail.jsx
    │   │   ├── Reports.jsx
    │   │   └── Settings.jsx
    │   ├── utils/
    │   │   ├── api.js              # API client
    │   │   └── auth.js             # Auth helpers
    │   └── App.jsx                 # Routes
    ├── public/
    │   └── hero.jpg                # Dashboard hero image
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/predict/maternal` | Test AI prediction (no save) |
| `POST` | `/api/records/maternal` | Save maternal record with AI prediction |
| `POST` | `/api/records/newborn` | Save newborn record |
| `GET` | `/api/records` | Get all records |
| `GET` | `/api/records/{id}` | Get single record |
| `PUT` | `/api/records/{id}` | Update record |
| `DELETE` | `/api/records/{id}` | Delete record |
| `DELETE` | `/api/records` | Delete all records |

---

## 📸 Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/800x400/3b82f6/ffffff?text=Dashboard)

### Maternal Assessment
![Maternal](https://via.placeholder.com/800x400/ef4444/ffffff?text=Maternal+Assessment)

### Reports
![Reports](https://via.placeholder.com/800x400/10b981/ffffff?text=Reports)

*(Replace these placeholders with real screenshots from your live app)*

---

## ⚠️ Important Notes

### Free Tier Limitations
- **Render free tier** sleeps after 15 minutes of inactivity
- First request after sleep takes **30-60 seconds**
- Subsequent requests are instant
- Upgrade to paid tier for always-on backend

### Data Persistence
- Production database is SQLite, stored on Render
- Data may be lost if Render redeploys without a persistent volume
- For production use, migrate to PostgreSQL

### Security Disclaimer
- ⚠️ This app uses **fake authentication** (any email + password works)
- Not suitable for actual clinical use
- For real deployment: add JWT auth, bcrypt passwords, HTTPS enforcement, HIPAA compliance

---

## 🎯 Roadmap / Future Improvements

- [ ] Real JWT authentication with bcrypt
- [ ] PostgreSQL migration for production data
- [ ] PDF export of patient reports
- [ ] Dark mode toggle
- [ ] Advanced analytics (trend charts over time)
- [ ] Multi-user roles (admin, doctor, nurse)
- [ ] Email notifications for high-risk patients
- [ ] Offline mode (PWA)

---

## 🤝 Contributing

This is a personal project, but feel free to:
1. Fork it
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 👨‍💻 Author

**Atwine Keith**
- GitHub: [@atwinekeith428-ai](https://github.com/atwinekeith428-ai)
- Project Link: [https://github.com/atwinekeith428-ai/ai-health-warning-system](https://github.com/atwinekeith428-ai/ai-health-warning-system)

---

## 🙏 Acknowledgments

- [UCI Machine Learning Repository](https://archive.ics.uci.edu/ml/index.php) — Maternal Health Risk dataset
- [FastAPI](https://fastapi.tiangolo.com/) — Modern Python web framework
- [Vercel](https://vercel.com) and [Render](https://render.com) — Free hosting
- Inspired by the need for accessible AI-driven healthcare tools in underserved regions

---

**Built with ❤️ for healthier mothers and babies.**#   R e b u i l d   t r i g g e r  
 