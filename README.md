# Random_Captcha_Geneartor

## Crazy Random Captcha

A small, embeddable, and very silly "crazy" captcha generator you can inject into personal projects. It creates varied challenges to verify a human user: canvas-distorted text, emoji selection, small math puzzles, and a slider/pattern.

Usage

- Include `src/crazy-captcha.js` in a page.
- Create a container element and call `CrazyCaptcha.attach(container, options)`.
- Use `captcha.on('verified', token => ...)` or `captcha.verify()` to check.

API

- attach(container, options)
- refresh()
- verify(answer)

See `example.html` for a demo.

### React demo (Vite)

This repository includes a small React + Vite demo that wraps the original `src/crazy-captcha.js` inside a React component.

Install and run:

1. Install dependencies:

   npm install

2. Run development server:

   npm run dev

3. Open the URL shown by Vite (usually http://localhost:5173).

Notes

- The captcha logic remains client-side and is intended for personal / demo use. For production use you should add server-side token signing and verification.
