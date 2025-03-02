import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { isAuthenticated } from './api'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './components/common/ProtectedRoute'
import Navbar from './components/common/Navbar'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'


const BookList = () => <div>Book List Page</div>;
const BookDetail = () => <div>Book Detail Page</div>;
const CreateBook = () => <div>Create Book Page</div>;
const AnnotationList = () => <div>Annotation List Page</div>;
const AnnotationDetail = () => <div>Annotation Detail Page</div>;
const CreateAnnotation = () => <div>Create Annotation Page</div>;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());

  useEffect(() => {
    const checkAuth = () => {
      console.log('Auth state:', isAuthenticated());
      setIsLoggedIn(isAuthenticated());
    };

    checkAuth();

    window.addEventListener("auth-change", checkAuth);

    return () => {
      window.removeEventListener("auth-change", checkAuth);
    };
  }, []);

  return (
    <Router>
      {isLoggedIn && <Navbar />}

      <div className='app-container'>
        <Routes>
          {/* Auth routes*/}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route path="/books" element={
            <ProtectedRoute>
              <BookList />
            </ProtectedRoute>
          } />

          <Route path="/books/new" element={
            <ProtectedRoute>
              <CreateBook />
            </ProtectedRoute>
          } />

          <Route path="/books/:bookId" element={
            <ProtectedRoute>
              <BookDetail />
            </ProtectedRoute>
          } />

          <Route path="/annotations" element={
            <ProtectedRoute>
              <AnnotationList />
            </ProtectedRoute>
          } />

          <Route path="/annotations/new" element={
            <ProtectedRoute>
              <CreateAnnotation />
            </ProtectedRoute>
          } />

          <Route path="/annotations/:annotationId" element={
            <ProtectedRoute>
              <AnnotationDetail />
            </ProtectedRoute>
          } />

          {/* Default route */}
          <Route
          path="/"
          element={<Navigate to={isLoggedIn ? "/books" : "/login"} replace />}
          />

          {/* Catch all for unknown routes */}
          <Route
          path="*"
          element={<Navigate to={isLoggedIn ? "/books" : "/login"} replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
