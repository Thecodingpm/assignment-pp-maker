# API Setup Guide - Unsplash & Tenor

## 🖼️ **Unsplash API Setup**

### **Getting Your API Key:**
1. **Visit**: [https://unsplash.com/developers](https://unsplash.com/developers)
2. **Create Application**: Click "New Application" and fill in details
3. **Copy Access Key**: Use the "Access Key" (Client ID), NOT the Secret Key

### **Environment Variable:**
```bash
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

---

## 🎬 **Tenor API Setup**

### **Getting Your API Key:**
1. **Visit**: [https://developers.google.com/tenor](https://developers.google.com/tenor)
2. **Create Project**: Create a new Google Cloud project
3. **Enable Tenor API**: Enable the Tenor API in your project
4. **Create Credentials**: Create an API key for Tenor
5. **Copy API Key**: Use the generated API key

### **Environment Variable:**
```bash
TENOR_API_KEY=your_tenor_api_key_here
```

---

## 🔧 **Complete Setup**

### **1. Create `.env.local` file:**
```bash
# Unsplash API
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here

# Tenor API  
TENOR_API_KEY=your_tenor_api_key_here
```

### **2. Restart your dev server:**
```bash
npm run dev
```

---

## ✨ **Features Available**

### **Unsplash Integration:**
- ✅ **Real-time image search**
- ✅ **Category quick access** (Gradient, Data, Abstract, Tech, 3D Shapes)
- ✅ **High-quality photos** with proper attribution
- ✅ **API compliance** with download tracking

### **Tenor Integration:**
- ✅ **GIF search** with trending support
- ✅ **Animated content** for presentations
- ✅ **Popular GIFs** and trending content
- ✅ **Proper attribution** for creators

---

## 🚀 **How to Use**

1. **Click Media tool** in your toolbar
2. **Switch between integrations**:
   - **Unsplash**: For high-quality photos
   - **Tenor**: For animated GIFs
3. **Search or use categories** to find content
4. **Click any media** to select it
5. **Media data** is passed to your presentation editor

---

## 📊 **API Limits**

### **Unsplash:**
- **Demo apps**: 50 requests/hour
- **Production**: 5,000 requests/hour

### **Tenor:**
- **Free tier**: 1,000 requests/day
- **Paid tiers**: Higher limits available

---

## 🔍 **Testing Your Setup**

### **Test Unsplash:**
- Select "Unsplash" integration
- Search for "nature" or click "Gradient" category
- Should see real photos with credits

### **Test Tenor:**
- Select "Tenor" integration  
- Search for "funny" or see trending GIFs
- Should see animated GIFs with credits

---

## 🆘 **Troubleshooting**

### **"API key not configured":**
- Check your `.env.local` file exists
- Verify the key names are correct
- Restart your dev server

### **"Failed to fetch media":**
- Check your internet connection
- Verify API keys are valid
- Check browser console for errors

### **"No media found":**
- Try different search terms
- Check if you've hit API rate limits
- Verify API keys have proper permissions

---

## 🎯 **Next Steps**

After setup, you can:
1. **Test both integrations** with search and categories
2. **Select media items** to see data in console
3. **Integrate with your presentation editor** to insert media
4. **Add more integrations** (Icons, Brandfetch, Stickers)

Your media popup now supports both high-quality photos and animated GIFs! 🎉

