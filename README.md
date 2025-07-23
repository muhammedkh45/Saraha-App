# Saraha/NGL-Inspired Anonymous Messaging App

This project is inspired by popular anonymous messaging applications like **Saraha** and **NGL**. It allows users to send and receive anonymous messages securely.

## Features
- **User Authentication & Authorization**
- **Email Confirmation**: Users must confirm their email addresses via a verification link sent using **Nodemailer**.
- **Security**: Sensitive information (like secrets and credentials) is stored securely in a `.env` file.
- **Notes API**: Create, update, delete, and retrieve notes (see project folders for details).
- **Anonymous Messaging**: Inspired by Saraha and NGL, users can send and receive anonymous messages.

## API Documentation
- Full API documentation is available on Postman: [View Postman Docs](https://documenter.getpostman.com/view/45701183/2sB34ijKUL)

## Project Structure
- `src/` - Main source code
- `service/` - Email and verification services
- See each folder for more features and details.

## Getting Started
1. Clone the repository
2. Run `npm install`
3. Set up your `.env` file with the required secrets (see `.env.example` if available)
4. Start the server with `npm start` or `npm run dev`

---

For more details on endpoints and usage, refer to the [Postman documentation](https://documenter.getpostman.com/view/45701183/2sB34ijKUL). 
