# AI Voice Chat Application

A production-ready AI voice chat application built with Next.js, TypeScript, LangChain, and MongoDB. Chat with Google Gemini using your voice or text input.

## Features

- 🎤 **Voice Input**: Record voice messages using Web Speech API
- 🤖 **AI Enhancement**: Improve text clarity using Hugging Face models
- 💬 **Gemini Integration**: Chat with Google Gemini AI via LangChain
- 🔊 **Text-to-Speech**: AI responses are read aloud
- 💾 **MongoDB Storage**: All conversations are stored in MongoDB
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔐 **Secure**: API keys stored locally, never on servers

## Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Voice Processing**: Web Speech API, Web Speech Synthesis API
- **AI/ML**: LangChain, Google Gemini, Hugging Face
- **Database**: MongoDB Atlas
- **Deployment**: Vercel-ready

## Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Google Gemini API key
- Hugging Face API key (optional, for text enhancement)

## Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd ai-voice-chat-app
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Fill in your environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `HUGGINGFACE_API_KEY`: Your Hugging Face API key

4. **Get your Google Gemini API key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create an API key
   - Enter it in the application UI (stored locally)

5. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Deployment

### Vercel Deployment

1. **Push to GitHub**
   \`\`\`bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   \`\`\`

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically

### Environment Variables for Production

Set these in your deployment platform:

\`\`\`env
MONGODB_URI=your_mongodb_connection_string
HUGGINGFACE_API_KEY=your_huggingface_api_key
\`\`\`

## Usage

1. **Enter your Gemini API key** in the configuration section
2. **Start chatting** using either:
   - Voice input: Click the microphone button and speak
   - Text input: Type your message and press Send
3. **View conversation history** in the chat interface
4. **Start new conversations** with the "New Chat" button

## Architecture

### LangChain Flow
1. **Input**: User voice/text input
2. **Enhancement**: Text improvement via Hugging Face API
3. **Processing**: Enhanced text sent to Gemini via LangChain
4. **Response**: AI response generated and returned
5. **Storage**: Full conversation stored in MongoDB
6. **Output**: Response displayed and read aloud (for voice input)

### API Routes
- `/api/chat`: Main chat processing endpoint
- `/api/conversations`: Conversation history management

### Components
- `VoiceRecorder`: Handles voice input and transcription
- `ChatHistory`: Displays conversation messages
- `TextInput`: Text message input component
- `ApiKeyInput`: Gemini API key configuration
- `LoadingSpinner`: Loading state indicator

## Error Handling

The application includes comprehensive error handling for:
- Voice recognition failures
- API rate limits and quota exceeded
- Invalid API keys
- Network connectivity issues
- MongoDB connection errors
- Text enhancement failures (graceful fallback)

## Browser Compatibility

- **Voice Input**: Chrome, Edge, Safari (with webkit prefix)
- **Text-to-Speech**: All modern browsers
- **General Features**: All modern browsers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the browser console for error messages
2. Verify API keys are correctly configured
3. Ensure microphone permissions are granted
4. Check network connectivity

## Roadmap

- [ ] Multi-language support
- [ ] Voice cloning options
- [ ] Conversation export/import
- [ ] Advanced text enhancement models
- [ ] Real-time collaboration features
