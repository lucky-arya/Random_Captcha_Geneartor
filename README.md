# Random Captcha Generator

A basic captcha generator built with React that generates random alphanumeric captchas for user verification.

## Features

- 🎲 Random alphanumeric captcha generation (6 characters)
- 🔄 Refresh button to generate new captcha
- ✅ Real-time validation
- 🎨 Beautiful, modern UI with gradient styling
- ⚡ Built with React and Vite for fast development

## Installation

1. Clone the repository:
```bash
git clone https://github.com/lucky-arya/Random_Captcha_Geneartor.git
cd Random_Captcha_Geneartor
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Development Mode

Run the application in development mode:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### Build for Production

Build the application for production:
```bash
npm run build
```

The build files will be in the `dist` directory.

### Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

## How It Works

1. The application generates a random 6-character alphanumeric captcha on page load
2. Users enter the captcha text in the input field
3. Click "Verify" to validate the input
4. Get instant feedback on whether the captcha was entered correctly
5. Use the refresh button (↻) to generate a new captcha anytime

## Technologies Used

- React 19
- Vite 7
- CSS3 (with animations and gradients)

## Project Structure

```
Random_Captcha_Geneartor/
├── src/
│   ├── App.jsx          # Main captcha component
│   ├── App.css          # Component styles
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
└── package.json         # Project dependencies
```

## License

ISC
