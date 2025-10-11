import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import EventPage from './components/EventPage';
import EventForm from './components/EventForm';
import Leaderboard from './components/Leaderboard';
import ChatAnswersForm from './components/ChatAnswersForm';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        <Layout>
          <Routes>
            <Route path="/" element={<EventPage />} />
            <Route 
              path="/form" 
              element={
                <ProtectedRoute>
                  <EventForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/leaderboard" 
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chatanswers" 
              element={
                <ProtectedRoute>
                  <ChatAnswersForm />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
