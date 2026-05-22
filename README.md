## 🪔 AI Mudra Detection

The Mudra Detection module identifies hand gestures used in Bharatanatyam using computer vision and machine learning.

### 🎯 Features
- 📸 Image-based mudra prediction  
- 🎥 Real-time webcam detection  
- 📊 Confidence score output  

### 🧠 How It Works
- MediaPipe extracts 21 hand landmarks  
- Landmarks → feature vector  
- Random Forest model predicts mudra  

### ⚡ Highlights
- Real-time detection with smoothing  
- Stable predictions using confidence filtering  
- ~80–90% accuracy under proper conditions  

### 🛠️ Tech Stack
FastAPI · MediaPipe · Scikit-learn · OpenCV · React  

### 🌐 Deployment
Backend: Render  
Frontend: Vercel  
