# 🏠 HomeBudget - Indian Family Expense Tracker

A comprehensive home budget tracking application designed specifically for Indian families, featuring bilingual support (English/Gujarati) and Firebase integration for secure data storage.

## ✨ Features

- **Bilingual Support**: All expense categories in English and Gujarati
- **Real-time Tracking**: Daily, weekly, monthly, and yearly expense summaries
- **Secure Authentication**: Custom username/password system with Firebase
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Data Persistence**: All data stored securely in Firebase Firestore
- **User-friendly Interface**: Clean, intuitive design for family use

## 📋 Expense Categories (English/Gujarati)

- Fruits & Vegetables (ફળો અને શાકભાજી)
- Grocery & Food (કરિયાણું અને ખોરાક)
- Milk & Dairy (દૂધ અને દૂધની વસ્તુઓ)
- Transport & Fuel (પરિવહન અને બળતણ)
- Medical & Health (દવા અને સ્વાસ્થ્ય)
- Education & Books (શિક્ષણ અને પુસ્તકો)
- School Fees (શાળાની ફી)
- House Rent (ઘરનું ભાડું)
- Electricity Bill (વીજળીનો બિલ)
- Water Bill (પાણીનો બિલ)
- Gas Bill (ગેસનો બિલ)
- Internet & Mobile (ઇન્ટરનેટ અને મોબાઇલ)
- House Maintenance (ઘરની જાળવણી)
- Cleaning & Services (સફાઈ અને સેવાઓ)
- Kitchen Appliances (રસોડાના સાધનો)
- Furniture & Home (ફર્નિચર અને ઘર)
- Clothing & Fashion (કપડાં અને ફેશન)
- Kids & Toys (બાળકો અને રમકડાં)
- Entertainment (મનોરંજન)
- Restaurant & Dining (રેસ્ટોરન્ટ અને ભોજન)
- Travel & Vacation (પ્રવાસ અને રજા)
- Insurance (વીમો)
- Investment & Savings (નિવેશ અને બચત)
- Gifts & Celebrations (ભેટ અને ઉજવણી)
- Petrol & Vehicle (પેટ્રોલ અને વાહન)
- Other (અન્ય)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/PDA-DP-Shop/Home-Budgest.git
cd Home-Budgest
```

### 2. Set Up Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Firestore Database
4. Set up Authentication (optional, as we use custom auth)

### 3. Start the Application
```bash
# Using Python (if available)
python -m http.server 8000

# Or using Node.js
npx http-server -p 8000

# Or simply open index.html in your browser
```

## 🔧 Setup Instructions

### Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Firestore Database
4. Set up Authentication (optional, as we use custom auth)

### Firebase Security Rules

Set up these Firestore security rules in your Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Expenses can only be accessed by the user who created them
    match /expenses/{expenseId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

## 📱 Mobile Optimization

- Touch-friendly interface
- Responsive design for all screen sizes
- Optimized for mobile browsers
- Swipe gestures support
- Pull-to-refresh functionality

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase Firestore
- **Authentication**: Custom system with Firebase
- **Hosting**: Firebase Hosting / GitHub Pages
- **Styling**: Custom CSS with Flexbox/Grid

## 📊 Data Structure

### Users Collection
```javascript
{
  username: string,
  password: string, // In production, use proper hashing
  createdAt: timestamp
}
```

### Expenses Collection
```javascript
{
  userId: string,
  username: string,
  date: string,
  category: string,
  amount: number,
  note: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues:

1. Check the browser console for errors
2. Verify Firebase configuration is correct
3. Ensure all files are in the correct directory
4. Check Firebase security rules
5. Create an issue in the GitHub repository

## 🔄 Updates

- **v2.0**: Added Gujarati translations
- **v1.0**: Initial release with basic functionality

---

**Made with ❤️ for Indian families** 