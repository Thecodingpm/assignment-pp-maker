# Assignment Presentation Maker

A comprehensive web application for creating, editing, and collaborating on assignment presentations with real-time features and AI-powered tools.

## Features

### 🎨 **Rich Text Editor**
- Advanced text formatting (bold, italic, underline, strikethrough)
- Font family selection with 50+ options
- Font size control (8px - 72px) with smooth increments
- Text color picker
- Text alignment (left, center, right)
- Clear formatting options

### 🤝 **Real-Time Collaboration**
- Live collaborative editing
- Multiple users can edit simultaneously
- Cursor tracking and presence indicators
- Conflict resolution and synchronization
- Invite system for team collaboration

### 🚀 **AI-Powered Tools**
- GPT integration for content generation
- AI-powered search and suggestions
- Smart content assistance
- Automated formatting suggestions

### 📱 **Modern UI/UX**
- Responsive design for all devices
- Dark/Light theme toggle
- Intuitive toolbar interface
- Drag-and-drop functionality
- Real-time auto-save

### 🔐 **Admin System**
- Secure admin authentication
- Template management
- User management
- System monitoring

### 🌐 **Multi-Language Support**
- Translation services
- Language switching
- Internationalization ready

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Editor**: Lexical (Facebook's rich text editor)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Real-time**: Firebase Realtime Database
- **AI**: OpenAI GPT API
- **Deployment**: Vercel ready

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account
- OpenAI API key (optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Thecodingpm/assignment-pp-maker.git
cd assignment-pp-maker
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env.local` file with your configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
OPENAI_API_KEY=your_openai_key
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Creating Presentations
1. Navigate to the editor
2. Use the toolbar for formatting
3. Add text, images, and media
4. Collaborate with team members
5. Export your presentation

### Font Size Control
- **Default size**: 12px on page load
- **Increase/Decrease**: Use +/- buttons for 1px increments
- **Range**: 8px to 72px
- **Smart application**: Only affects new text at cursor position

### Collaboration
1. Create or join a presentation
2. Share invite links with team members
3. Edit simultaneously in real-time
4. See live cursor movements and changes

## Project Structure

```
assignment-pp-maker/
├── app/                    # Next.js app directory
│   ├── components/        # React components
│   ├── admin/            # Admin system
│   ├── api/              # API routes
│   ├── firebase/         # Firebase configuration
│   └── utils/            # Utility functions
├── public/               # Static assets
├── docs/                 # Documentation
└── config files          # Configuration files
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the setup guides

## Roadmap

- [ ] Enhanced media support
- [ ] Advanced collaboration features
- [ ] Mobile app development
- [ ] Integration with learning management systems
- [ ] Advanced AI features

---

**Built with ❤️ using Next.js and modern web technologies**
