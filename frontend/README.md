# Smart Attendance System - Client

Modern, responsive React application for the Smart Attendance System with beautiful UI/UX.

## Features

✨ **Modern UI/UX**
- Glassmorphism design with vibrant gradients
- Smooth animations and transitions
- Dark/Light theme support
- Responsive design for all devices

🔐 **Authentication**
- Secure login/registration for students and teachers
- Protected routes with authentication
- Password strength indicator
- JWT token-based authentication

📊 **Dashboard**
- Real-time attendance metrics
- Interactive charts (Line & Pie charts)
- Quick action buttons
- Role-based views (Student/Teacher/Admin)

📱 **Attendance Scanner**
- QR code generation for teachers
- Session code entry for students
- Real-time attendance marking
- Copy-to-clipboard functionality

🎨 **Enhanced Components**
- Loading spinners
- Error boundaries
- Toast notifications
- 404 Not Found page
- Floating action button
- Theme toggle

## Tech Stack

- React 18.2
- React Router DOM 6.30
- Recharts 3.8 (Charts)
- Axios (API calls)
- CSS3 with custom properties

## Getting Started

### Prerequisites
- Node.js 14+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── Login.js
│   │   └── Register.js
│   ├── dashboard/
│   │   ├── Dashboard.js
│   │   └── ProfileAvatar.js
│   ├── services/
│   │   └── exportUtils.js
│   ├── Activity.js
│   ├── AttendanceScanner.js
│   ├── Confetti.js
│   ├── Curriculum.js
│   ├── ErrorBoundary.js
│   ├── FloatingActionButton.js
│   ├── Home.js
│   ├── LoadingSpinner.js
│   ├── NotFound.js
│   ├── ProtectedRoute.js
│   ├── Students.js
│   ├── ThemeContext.js
│   ├── ThemeToggle.js
│   └── ToastContext.js
├── App.js
├── App.css
├── index.js
└── index.css
```

## Key Improvements Made

### Performance
- Optimized animations with GPU acceleration
- Lazy loading for better initial load time
- Efficient re-renders with React best practices

### UX Enhancements
- Loading states for all async operations
- Copy-to-clipboard for session codes
- Better error messages and validation
- Password strength indicator
- Smooth page transitions

### Security
- Protected routes requiring authentication
- Error boundaries to catch runtime errors
- Input validation and sanitization

### Accessibility
- Semantic HTML elements
- ARIA labels for interactive elements
- Keyboard navigation support
- High contrast ratios for readability

## Environment Variables

The app uses a proxy configuration in `package.json`:
```json
"proxy": "http://localhost:5000"
```

This proxies API requests to the backend server.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code style
2. Write meaningful commit messages
3. Test thoroughly before submitting

## License

ISC
