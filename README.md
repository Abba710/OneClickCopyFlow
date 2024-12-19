# OneClickCopyFlow

## Overview

OneClickCopyFlow is a Chrome extension that enhances code interaction on Stack Overflow by providing seamless code copying and AI-powered explanation features. The project consists of two main components:

1. A Chrome extension for frontend interaction
2. A Node.js server that processes code explanations using AI

## Features

### Extension Features

- **Smart Code Copying**: Copy individual code blocks with a single click
- **Bulk Copy**: Copy all code blocks on the page using "alt+shift+c" shortcut
- **AI-Powered Explanations**: Get instant explanations for any code block
- **Clean UI**: Uses Shadow DOM for isolated styling and seamless integration
- **Progress Notifications**: Real-time feedback for all operations

### Server Features

- **OpenAI Integration**: Leverages advanced AI models for code analysis
- **Redis Caching**: Efficient response caching and rate limiting
- **Clustered Processing**: Utilizes all CPU cores for better performance
- **Secure Configuration**: Environment-based configuration management

## Installation

### Extension Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/OneClickCopyFlow.git
   cd OneClickCopyFlow
   ```

2. Load in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer Mode"
   - Click "Load unpacked" and select the extension directory

### Server Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment:
   Create `.env` file in the server directory:

   ```plaintext
   OPENAI_API_KEY=your_key_here
   ```

3. Install Redis:
   - Download from [Redis website](https://redis.io/download)
   - Follow installation instructions for your OS

## Running the Application

1. Start Redis:

   ```bash
   cd "redis path"
   .\redis-server
   ```

2. Launch the server:
   ```bash
   node server.js
   ```
   Server will be available at `http://localhost:3000`

## Project Structure

### Extension Files

- `manifest.json`: Extension configuration
- `content-script.js`: Main extension logic
- `content-script.css`: Extension styling
- `background.js`: Background processes
- `notification/`: Notification components

### Server Files

- `src/my-server/`
  - `server.js`: Main server application
  - `.env`: Environment configuration
  - `.env.sample`: Configuration template

## Technical Implementation

### AI Integration

```javascript
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  baseURL: "https://api.zukijourney.com/v1",
  apiKey: process.env.OPENAI_API_KEY,
});
```

### Extension Architecture

- Uses Shadow DOM for isolated styling
- Implements custom event listeners for code block interaction
- Manages state through background processes

## Dependencies

### Core Libraries

- **OpenAI API**: AI-powered code analysis
- **Express**: Web server framework
- **Redis**: Caching and rate limiting
- **CORS**: Cross-origin resource sharing

### Development Tools

- **dotenv**: Environment management
- **express-rate-limit**: Request limiting
- **marked**: Markdown processing
- **cluster**: Process management

## Acknowledgments

This project utilizes several open-source libraries and tools:

- **AI API**: [GitHub - cool-ai-stuff](https://github.com/zukixa/cool-ai-stuff/)
- **Express**: [GitHub - Express](https://github.com/expressjs/express)
- **CORS**: [GitHub - CORS](https://github.com/expressjs/cors)
- **Redis**: [GitHub - ioredis](https://github.com/luin/ioredis)

## Troubleshooting

### Common Issues

- **Extension Not Working**: Verify Chrome extension is enabled and permissions are granted
- **Server Connection Failed**: Check if Redis and Node.js server are running
- **API Limits**: If you hit rate limits, wait or upgrade your API plan

### Server Issues

- Ensure Redis is running and accessible
- Verify environment variables are correctly set
- Check console for detailed error messages

## License

This project is licensed under the GNU General Public License - see the LICENSE file for details.
