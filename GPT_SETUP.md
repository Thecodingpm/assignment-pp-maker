# 🔮 GPT Search Setup Guide

## **What's New: Magical GPT Search!**

Your presentation maker now includes an AI-powered search feature that allows users to ask questions and get instant answers from GPT!

## **🚀 Features:**

- **AI-Powered Answers**: Ask any question and get intelligent responses
- **Editor Integration**: Insert GPT responses directly into your documents
- **Copy to Clipboard**: Easy copying of responses
- **Beautiful UI**: Modern, responsive design with dark mode support
- **Real-time Search**: Instant responses with loading animations

## **⚙️ Setup Instructions:**

### **1. Get Your OpenAI API Key:**
- Go to [OpenAI Platform](https://platform.openai.com/api-keys)
- Sign in or create an account
- Click "Create new secret key"
- Copy your API key

### **2. Add API Key to Environment:**
Create a `.env.local` file in your project root and add:

```bash
OPENAI_API_KEY=your_actual_api_key_here
```

**⚠️ Important:** Never commit your API key to version control!

### **3. Restart Your Development Server:**
```bash
npm run dev
```

## **🎯 How to Use:**

1. **Open the Editor**: Go to any editor page
2. **Click GPT Search**: Look for the search icon in the top toolbar
3. **Ask a Question**: Type your question in the search box
4. **Get Answer**: GPT will provide an intelligent response
5. **Insert or Copy**: Use the "Insert" button to add to your document or "Copy" to clipboard

## **💡 Example Questions:**

- "How do I create an effective presentation?"
- "What are the best practices for writing a business proposal?"
- "How can I improve my writing skills?"
- "What are the key elements of a research paper?"

## **🔧 Technical Details:**

- **API Endpoint**: `/api/gpt-search`
- **Model**: GPT-3.5-turbo
- **Max Tokens**: 500
- **Temperature**: 0.7 (balanced creativity)

## **💰 Cost Considerations:**

- OpenAI charges per API call
- GPT-3.5-turbo is very affordable (~$0.002 per 1K tokens)
- Monitor your usage at [OpenAI Usage Dashboard](https://platform.openai.com/usage)

## **🛡️ Security:**

- API keys are stored server-side only
- No sensitive data is sent to the client
- Rate limiting can be added if needed

## **🎨 Customization:**

You can modify the system prompt in `/app/api/gpt-search/route.ts` to make GPT more specialized for your use case.

---

**🎉 You're all set! Enjoy your magical GPT search feature!** 