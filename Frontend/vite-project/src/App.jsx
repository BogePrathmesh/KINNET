import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'
import LandingPage from './pages/landing.jsx';
import Authentication from './pages/Authentication.jsx'
import { AuthProvider } from './contexts/Authcontext.jsx';
import VideoMeet from './pages/VideoMeet.jsx'
import HomeComponent from './pages/home.jsx';

function App() {

  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <Routes>

            <Route path='' element={<LandingPage />} />
            <Route path='/auth' element={<Authentication />} />

            <Route path='/home' element={<HomeComponent/>} />

            <Route path = '/:url' element={<VideoMeet/>} />

          </Routes>
        </AuthProvider>
      </Router>
    </div>
  )
}

export default App
