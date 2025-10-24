# Hotel Frontend - Modern React Application

A modern, responsive hotel management frontend built with React, Mantine UI, and optimized architecture.

## 🚀 Features

- **Modern UI**: Built with Mantine UI components for a professional look
- **State Management**: Zustand for lightweight, efficient state management
- **Form Validation**: Yup schema validation with Mantine forms
- **API Integration**: Centralized API client with interceptors
- **Responsive Design**: Mobile-first approach with Mantine's responsive system
- **Type Safety**: Comprehensive validation schemas
- **Performance**: Optimized with React hooks and efficient re-renders

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts for global state
├── hooks/              # Custom React hooks
│   ├── useNewReservation.js
│   └── useReservationQuery.js
├── pages/              # Page components
├── schema/             # Yup validation schemas
│   └── auth.js
├── services/           # API and external services
│   └── api/
│       └── apiClient.js
├── stores/             # Zustand state stores
│   ├── authStore.js
│   └── reservationStore.js
├── styles/             # Global styles
├── theme.js            # Mantine theme configuration
└── utils/              # Utility functions
```

## 🛠️ Technologies Used

- **React 19** - Latest React with concurrent features
- **Mantine UI** - Modern React components library
- **Zustand** - Lightweight state management
- **Yup** - Schema validation
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Day.js** - Date manipulation

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 📦 Key Dependencies

```json
{
  "@mantine/core": "^8.3.5",
  "@mantine/hooks": "^8.3.5",
  "@mantine/form": "^8.3.5",
  "@mantine/notifications": "^8.3.5",
  "@mantine/modals": "^8.3.5",
  "@mantine/dates": "^8.3.5",
  "zustand": "^5.0.0",
  "yup": "^1.4.0",
  "@hookform/resolvers": "^3.3.0",
  "@tanstack/react-query": "^5.0.0",
  "@tabler/icons-react": "^2.0.0",
  "dayjs": "^1.11.0"
}
```

## 🏗️ Architecture

### State Management
- **Zustand Stores**: Lightweight, type-safe state management
- **React Context**: For component tree state sharing
- **React Query**: Server state caching and synchronization

### API Layer
- **Centralized Client**: Single axios instance with interceptors
- **Error Handling**: Global error handling with notifications
- **Authentication**: Automatic token management

### Form Handling
- **Mantine Forms**: Built-in form state management
- **Yup Validation**: Comprehensive schema validation
- **Real-time Feedback**: Instant validation feedback

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Dark/Light Theme**: Theme switching capability
- **Accessibility**: WCAG compliant components
- **Loading States**: Skeleton loaders and progress indicators
- **Notifications**: Toast notifications for user feedback
- **Modals**: Confirmation dialogs and forms

## 🔧 Development

### Code Structure
- **Hooks**: Custom hooks for reusable logic
- **Services**: API calls and external integrations
- **Schemas**: Validation schemas for forms
- **Stores**: Global state management
- **Components**: Reusable UI components

### Best Practices
- **Component Composition**: Small, focused components
- **Custom Hooks**: Logic separation and reusability
- **Error Boundaries**: Graceful error handling
- **Performance**: Memoization and optimization
- **Type Safety**: Comprehensive validation

## 🚀 Deployment

The app is ready for production deployment:

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## 📱 Features

### Authentication
- Secure login with JWT tokens
- Automatic token refresh
- Protected routes
- Session management

### Reservations
- Create new reservations
- View reservation details
- Update reservation status
- Search and filter reservations

### Guest Management
- Guest information management
- Check-in/Check-out process
- Digital key generation
- Feedback collection

## 🔒 Security

- JWT token authentication
- Automatic token refresh
- Secure API communication
- Input validation and sanitization
- XSS protection

## 📊 Performance

- **Code Splitting**: Lazy loading of components
- **Memoization**: React.memo and useMemo for optimization
- **Bundle Optimization**: Tree shaking and minification
- **Caching**: React Query for server state caching
- **Lazy Loading**: Route-based code splitting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.