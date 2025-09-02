# CodeXFlow

Transform your ideas and code into beautiful diagrams using AI

![Homepage](homepage.png)

## Overview

CodeXFlow is a powerful web application that leverages AI to automatically generate professional diagrams from your code and ideas. Whether you're documenting software architecture, explaining algorithms, or visualizing system flows, CodeXFlow makes it effortless to create clear, beautiful diagrams.

## Features

### 🚀 **Dual Input Modes**

#### Code to Flowchart
Transform any code into a visual flowchart that shows the execution flow, decision points, and logic structure.

![Code to Diagram](code2diagram.png)

**Supported Languages:**
- JavaScript/TypeScript
- Python
- Java
- C/C++
- Go
- Rust
- PHP
- Ruby
- Swift
- Kotlin
- C#

#### Ideas to Sequence Diagram
Convert your natural language descriptions into detailed sequence diagrams that illustrate interactions between different components.

![Ideas to Diagram](ideas2diagram.png)

### 📊 **Smart Diagram Generation**

- **AI-Powered Analysis**: Uses advanced LLM models to understand your code logic and ideas
- **Automatic Layout**: Intelligently positions elements for optimal readability
- **Real-time Generation**: Fast processing with visual feedback
- **Dark/Light Theme**: Seamless theme switching for comfortable viewing

### 💾 **Comprehensive History Management**

Keep track of all your generated diagrams with separate, organized history sections.

![Diagram History](diagram-history.png)

**History Features:**
- **Separate Histories**: Code flowcharts and sequence diagrams are tracked independently
- **Quick Preview**: View diagrams without leaving the history panel
- **One-Click Restore**: Instantly restore any previous diagram
- **Smart Organization**: Chronological ordering with timestamps
- **Bulk Management**: Clear entire history or remove individual items

### 📥 **Multiple Export Formats**

Download your diagrams in various formats for different use cases:

- **PNG**: High-quality raster images perfect for documentation and presentations
  - 2x resolution for crisp quality
  - Dark theme optimized with white text
  - Professional styling
- **Mermaid**: Raw `.mermaid` files for integration with documentation tools
  - Compatible with GitHub, GitLab, and documentation platforms
  - Pure mermaid syntax without markdown wrappers
  - Ready for version control
- **XML**: Draw.io compatible format for further editing
  - Open directly in diagrams.net
  - Editable and customizable
  - Professional diagramming workflows

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for responsive design
- **Visualization**: D3.js for interactive diagrams
- **AI Integration**: Google Gemini AI for intelligent analysis
- **State Management**: React hooks with local storage persistence
- **UI Components**: Radix UI for accessible components

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/codexflow.git
   cd codexflow
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Google Gemini API key:
   ```
   GOOGLE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Creating a Code Flowchart

1. **Select the "Code" tab** in the input section
2. **Paste your code** or start typing in the editor
3. **Click "Generate Flowchart"** to create the diagram
4. **Download** in your preferred format (PNG, Mermaid, XML)

### Creating a Sequence Diagram

1. **Select the "Ideas" tab** in the input section
2. **Describe your system interaction** in natural language
3. **Click "Generate Sequence Diagram"** to visualize the flow
4. **Export** your diagram in multiple formats

### Managing History

- **View Past Diagrams**: Click on the history tabs below the main interface
- **Preview**: Click the code icon to view a diagram in detail
- **Restore**: Click the arrow icon to reload a previous diagram
- **Delete**: Click the X icon to remove individual items
- **Clear All**: Use the "Clear" button to empty the entire history

## Configuration

### API Settings

Configure your AI model preferences in the Settings page:

- **API Key**: Set or validate your Google Gemini API key
- **Model Selection**: Choose from available AI models
- **Timeout Settings**: Adjust request timeout limits

### Theme Preferences

- **System**: Follow your OS theme preference
- **Light**: Force light mode
- **Dark**: Force dark mode (optimized for diagrams)

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on:

- Code style and conventions
- Submitting pull requests
- Reporting issues
- Feature requests

## Development

### Project Structure

```
codexflow/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── settings/          # Settings page
│   └── page.tsx           # Main application
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── diagrams/         # Diagram components
│   └── *.tsx             # Feature components
├── lib/                   # Utility libraries
│   └── hooks/            # Custom React hooks
└── public/               # Static assets
```

### Key Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript checking
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: Check our [Wiki](https://github.com/your-username/codexflow/wiki)
- **Issues**: Report bugs on [GitHub Issues](https://github.com/your-username/codexflow/issues)
- **Discussions**: Join our [GitHub Discussions](https://github.com/your-username/codexflow/discussions)

## Roadmap

- [ ] Real-time collaboration
- [ ] More export formats (SVG, PDF)
- [ ] Custom diagram themes
- [ ] API integration for third-party tools
- [ ] Mobile app development
- [ ] Enterprise features

---

**Built with ❤️ by the CodeXFlow Team**

*Transform your code and ideas into beautiful diagrams with the power of AI*
