# 🍔 Smart Menu Catalog API (The Hacker Project)

> **Google Developer Group on Campus UGM - Backend Case Study Submission**

This project is a robust RESTful API designed to manage a food menu catalog. It goes beyond standard CRUD operations by integrating **Google Gemini AI** for intelligent content generation and **Google Firestore** for scalable data storage.

## 🚀 Key Features

* **🤖 AI-Powered Auto-Enrichment:**
    If the `description` field is left empty during creation, the system automatically generates an appetizing description using **Google Gemini 1.5 Flash** based on the item name and ingredients.
* **☁️ Serverless Database:**
    Built on top of **Google Cloud Firestore** (NoSQL) for real-time and scalable data management.
* **🔍 Advanced Filtering & Search:**
    Supports complex query parameters including full-text search (`q`), price range (`min_price`, `max_price`), calorie limit (`max_cal`), and category filtering.
* **📊 Data Aggregation:**
    Special endpoint to group menus by category or count items per category for analytics.
* **📄 Pagination & Sorting:**
    Efficient data retrieval with customizable page size and sorting options.

## 🛠 Tech Stack

* **Runtime:** Node.js & Express.js
* **Database:** Google Firestore (Firebase)
* **AI Model:** Google Gemini API (via `@google/generative-ai`)
* **Tools:** Postman (Testing)

## 🎥 Project Demo Video

Watch the explanation and live demo of this project here:
****



## 📂 Project Structure

```bash
├── controllers/      # Business logic & AI integration
├── routes/           # API Endpoint definitions
├── app.js            # Server entry point
├── firebaseConfig.js # Database configuration
└── serviceAccountKey.json # (Not included for security)
