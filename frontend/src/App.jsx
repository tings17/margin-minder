import './App.css'
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { isAuthenticated } from './api'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './components/common/ProtectedRoute'
import Navbar from './components/common/Navbar'
import NewAnnotationPage from './pages/NewAnnotationPage'
import BookForm from './components/books/BookForm'
import AnnotationPage from './pages/AnnotationPage'
import BookPage from './pages/BookPage'
import ScrollToTop from './components/common/ScrollToTop'


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const status = await isAuthenticated();
        setIsLoggedIn(status);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();

    const handleAuthChange = (event) => {
      setIsLoggedIn(event.detail?.isAuthenticated ?? false);
    };

    window.addEventListener("auth-change", handleAuthChange);

    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      {isLoggedIn && <Navbar />}
      <ScrollToTop />

      <div className='app-container'>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route path="/books/" element={
            <ProtectedRoute isAuthenticated={isLoggedIn}>
              <BookPage />
            </ProtectedRoute>
          } />

          <Route path="/books/new/" element={
            <ProtectedRoute isAuthenticated={isLoggedIn}>
              <BookForm />
            </ProtectedRoute>
          } />

          <Route path="/books/:bookId/new/" element={
            <ProtectedRoute isAuthenticated={isLoggedIn}>
              <NewAnnotationPage />
            </ProtectedRoute>
          } />

          <Route path="/books/:bookId/annotations/" element={
            <ProtectedRoute isAuthenticated={isLoggedIn}>
              <AnnotationPage />
            </ProtectedRoute>
          } />

          <Route path="/annotations/all/" element={
            <ProtectedRoute isAuthenticated={isLoggedIn}>
              <AnnotationPage />
            </ProtectedRoute>
          } />

          <Route
          path="/"
          element={<Navigate to={isLoggedIn ? "/books" : "/login"} replace />}
          />

          <Route
          path="*"
          element={<Navigate to={isLoggedIn ? "/books" : "/login"} replace />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
