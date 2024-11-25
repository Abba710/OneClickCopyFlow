# Code Explanation and Copying Extension

This browser extension allows users to interact with code on the website https://stackoverflow.com/. It provides the following features:

- Copy individual code blocks to the clipboard.
- Explain code blocks by sending them to a server for processing and displaying the explanation.
- Copy all code on the page with a single keyboard shortcut ("alt+shift+c").
- Notifications to inform users about the progress of processes (e.g., code copying or processing).

## Acknowledgments

This project was inspired by a YouTube video explaining [brief description of the video]. A big thanks to the creators for their valuable insights!

You can find the video here: [Video URL](https://www.youtube.com/watch?v=OWdHDGgt0zo)

Additionally, I would like to acknowledge the following libraries and authors for their contributions:

- **GPT4js**: A library for interacting with the GPT-4 model, licensed under the **GNU General Public License**. [GitHub - GPT4js](https://github.com/zachey01/gpt4free.js/)
- **express**: A web framework for Node.js, licensed under the **MIT License**. [GitHub - Express](https://github.com/expressjs/express)
- **cors**: A package for enabling Cross-Origin Resource Sharing, licensed under the **MIT License**. [GitHub - CORS](https://github.com/expressjs/cors)
- **marked**: A library for converting Markdown to HTML, licensed under the **MIT License**. [GitHub - Marked](https://github.com/markedjs/marked)
- **express-rate-limit**: A middleware for rate-limiting requests, licensed under the **MIT License**. [GitHub - express-rate-limit](https://github.com/nfriedly/express-rate-limit)
- **cluster**: A built-in Node.js module for managing multiple server processes, licensed under the **MIT License**. [Node.js - Cluster](https://nodejs.org/api/cluster.html)
- **os**: A built-in Node.js module for operating system-related utility methods, licensed under the **MIT License**. [Node.js - OS](https://nodejs.org/api/os.html)
- **ioredis**: A library for interacting with Redis, licensed under the **MIT License**. [GitHub - ioredis](https://github.com/luin/ioredis)

## Features

- **Copy code**: A "Copy" button is added to each code block, allowing users to easily copy code to the clipboard.
- **Explain code**: A "Explain" button is added to each code block, which sends the code to the server for processing. The server's response is displayed on the button, and a notification is shown.
- **Copy all**: A command listener allows the user to copy all the code on the page at once.
- **Shadow DOM**: The extension uses the Shadow DOM to isolate the styles and functionality of each code block, so they do not interfere with the rest of the page.

## Installation

1. Download or clone this repository.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer Mode** in the top-right corner.
4. Click **Load unpacked** and select the folder with the extension files.
5. The extension is now installed and ready to use!

## Required Dependencies

This extension works with a **Redis** server that is required to process code explanations. **Redis** is used to store and manage data for the extension.

### Running Redis and the Server

Before using the extension, make sure to start both the **Redis** server and your **code explanation server**. Here's how to do it:

1. **Install Redis**:

   - Download Redis and follow its installation instructions from the official [Redis website](https://redis.io/download).

2. **Start Redis**:

   - Launch Redis by running the following command:
     ```bash
     .\redis-server.exe
     ```

3. **Start the Explanation Server**:

   - Ensure that the server used for code explanation is up and running. You can start the local server by executing:
     ```bash
     node server.js
     ```

4. **Verify the Setup**:
   - Once both services are running, the extension should be able to communicate with them for processing and explaining the code.

## How It Works

### Interacting with Code

- When the page loads, the extension looks for all `<pre>` elements containing code.
- For each code block, a Shadow DOM is created, and two buttons are added: "Copy" and "Explain".
- The **Copy** button copies the code from the `<code>` tag to the clipboard.
- The **Explain** button sends the code to the server for processing and displays a notification once the explanation is ready.

### Copy All Code

- The extension listens for the user command (`copy-all`), which copies the content of all code blocks on the page to the clipboard.

### Notifications

- Notifications are shown during the following processes:
  - **Copying code**: When the code is copied to the clipboard.
  - **Explaining code**: When the code is sent to the server for processing and when the explanation is returned.

## File Structure

- `content-script.js`: The main script that handles interactions with the code blocks, including copying and explaining the code.
- `content-script.css`: Styles used for formatting elements inside the Shadow DOM.
- `notification/`: Folder containing notifications (e.g., `execute.js`, `began.js`, `completion.js`).
- `manifest.json`: Configuration file for the extension, including permissions and commands.

## Usage

- **Copy code**: Click the "Copy" button next to any code block.
- **Explain code**: Click the "Explain" button next to any code block to send it to the server for processing.
- **Copy all**: Use the registered keyboard shortcut (defined in the manifest) to copy all code on the page.

## Troubleshooting

- **If the code explanation is not working**: Make sure that both Redis and the server are running properly. Check the console for any error messages.
- **If the copy functionality is not working**: Ensure the page contains `<pre>` elements with code and that the extension is enabled.
