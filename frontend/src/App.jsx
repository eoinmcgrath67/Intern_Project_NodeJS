import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import Cpu from './pages/Cpu';
import Network from './pages/Network';
import Health from './pages/Health';
import Alb from './pages/Alb';
import Latency from './pages/Latency';

import './app.css';

function App() {
  return (
    <Router>
      <nav className="navbar">
        <div className="navbar-logo">
          ☁ AWS Monitoring Dashboard
        </div>

        <div className="navbar-links">
          <Link to="/">Dashboard</Link>
          <Link to="/cpu">CPU</Link>
          <Link to="/network">Network</Link>
          <Link to="/health">Health</Link>
          <Link to="/alb">ALB Requests</Link>
          <Link to="/latency">Latency</Link>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cpu" element={<Cpu />} />
          <Route path="/network" element={<Network />} />
          <Route path="/health" element={<Health />} />
          <Route path="/alb" element={<Alb />} />
          <Route path="/latency" element={<Latency />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;