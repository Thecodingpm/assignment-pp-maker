# API Setup Guide - Unsplash & Giphy

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

## 🎬 **Giphy API Setup**

### **Getting Your API Key:**
1. **Visit**: [https://developers.giphy.com/](https://developers.giphy.com/)
2. **Create App**: Click "Create an App" and choose "API Key"
3. **Copy API Key**: Use the generated API key

### **Environment Variable:**
```bash
GIPHY_API_KEY=your_giphy_api_key_here
```

---

## 🔧 **Complete Setup**

### **1. Create `.env.local` file:**
```bash
# Unsplash API
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here

# Giphy API  
GIPHY_API_KEY=your_giphy_api_key_here
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

### **Giphy Integration:**
- ✅ **GIF search** with trending support
- ✅ **Animated content** for presentations
- ✅ **Popular GIFs** and trending content
- ✅ **Proper attribution** for creators

---

## 🚀 **How to Use**

1. **Click Media tool** in your toolbar
2. **Switch between integrations**:
   - **Unsplash**: For high-quality photos
   - **Giphy**: For animated GIFs
3. **Search or use categories** to find content
4. **Click any media** to select it
5. **Media data** is passed to your presentation editor

---

## 📊 **API Limits**

### **Unsplash:**
- **Demo apps**: 50 requests/hour
- **Production**: 5,000 requests/hour

### **Giphy:**
- **Free tier**: 42 requests/hour
- **Premium tiers**: Higher limits available

---

## 🔍 **Testing Your Setup**

### **Test Unsplash:**
- Select "Unsplash" integration
- Search for "nature" or click "Gradient" category
- Should see real photos with credits

### **Test Giphy:**
- Select "Giphy" integration  
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
