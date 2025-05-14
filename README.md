# HVAC AI Assistant

A modern web application that helps HVAC technicians identify parts and get expert assistance using AI technology.

## Features

- **Part Identification**: Upload images or take photos of HVAC parts for instant AI-powered identification
- **Expert Chat**: Get real-time assistance and answers to HVAC-related questions
- **Parts Tracking**: Keep track of identified parts with quantities and pricing
- **Mobile-Friendly**: Works seamlessly on both desktop and mobile devices
- **Offline Capable**: Parts list persists in local storage
- **No Backend Required**: Runs entirely in the browser

## Requirements

- OpenAI API Key (GPT-4o with vision access required)
- Modern web browser
- Internet connection

## Setup

1. Clone this repository
2. Open `index.html` in your browser
3. Enter your OpenAI API key
4. Start using the application!

## Usage

### Part Identification Mode

1. Click the "Identify Mode" button
2. Upload an image or take a photo of an HVAC part
3. Review the AI analysis
4. Confirm if the identification is correct
5. Add the part to your tracking list with quantity

### Chat Mode

1. Click the "Chat Mode" button
2. Type your HVAC-related question
3. Get expert responses from the AI assistant

## Deployment

This application is designed to work with Cloudflare Pages:

1. Fork this repository
2. Connect to Cloudflare Pages
3. Deploy with the following settings:
   - Framework preset: None (static site)
   - Build command: None required
   - Build output directory: /
   - Environment variables: None required

## Security

- API keys are stored securely in browser local storage
- No server-side storage of sensitive information
- All API calls are made directly from the client to OpenAI

## Technical Stack

- HTML5
- CSS3 with modern features (Flexbox, Grid, Custom Properties)
- Vanilla JavaScript (ES6+)
- OpenAI GPT-4o API
- Marked.js for Markdown rendering

## Local Development

Simply open `index.html` in your browser. No build process or development server required.

## License

MIT License - Feel free to use and modify as needed.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
