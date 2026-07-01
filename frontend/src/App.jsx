import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import Cpu from './pages/Cpu';
import Network from './pages/Network';
import Health from './pages/Health';
import Alb from './pages/Alb';
import Latency from './pages/Latency';

function App() {
  return (
    <Router>
      <nav style={{
        padding: '15px',
        background: '#222',
        display: 'flex',
        gap: '20px'
      }}>
        <Link to="/" style={{ color: 'white' }}>Dashboard</Link>
        <Link to="/cpu" style={{ color: 'white' }}>CPU</Link>
        <Link to="/network" style={{ color: 'white' }}>Network</Link>
        <Link to="/health" style={{ color: 'white' }}>Health</Link>
        <Link to="/alb" style={{ color: 'white' }}>ALB</Link>
        <Link to="/latency" style={{ color: 'white' }}>Latency</Link>
      </nav>

      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cpu" element={<Cpu />} />
          <Route path="/network" element={<Network />} />
          <Route path="/health" element={<Health />} />
          <Route path="/alb" element={<Alb />} />
          <Route path="/latency" element={<Latency />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;