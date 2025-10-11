import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import EventPage from './components/EventPage';
import EventForm from './components/EventForm';
import Leaderboard from './components/Leaderboard';
import ChatAnswersForm from './components/ChatAnswersForm';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<EventPage />} />
          <Route path="/form" element={<EventForm />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/chatanswers" element={<ChatAnswersForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
