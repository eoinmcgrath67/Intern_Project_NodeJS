import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip
} from 'chart.js';

import './dashboard.css';
import { chartOptions } from '../chartOptions';

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip
);

export default function Dashboard() {
  const [instances, setInstances] = useState([]);
  const [selected, setSelected] = useState('');

  const [cpuData, setCpuData] = useState(null);
  const [networkData, setNetworkData] = useState(null);

  useEffect(() => {
    fetch('/instances')
      .then(res => res.json())
      .then(data => {
        setInstances(data);

        if (data.length > 0) {
          setSelected(data[0].id);
        }
      });
  }, []);

  useEffect(() => {
    if (!selected) return;

    fetch(`/cpu?instanceId=${selected}`)
      .then(res => res.json())
      .then(data => {
        setCpuData({
          labels: data.map(p =>
            new Date(p.Timestamp).toLocaleTimeString()
          ),
          datasets: [
            {
              label: 'CPU (%)',
              data: data.map(p => p.Average),
              borderColor: '#38bdf8',
              backgroundColor: '#38bdf8',
              tension: 0.4
            }
          ]
        });
      });

    fetch(`/network?instanceId=${selected}`)
      .then(res => res.json())
      .then(data => {
        setNetworkData({
          labels: data.inData.map(p =>
            new Date(p.Timestamp).toLocaleTimeString()
          ),
          datasets: [
            {
              label: 'Network In',
              data: data.inData.map(p => p.Average),
              borderColor: '#22c55e',
              backgroundColor: '#22c55e',
              tension: 0.4
            },
            {
              label: 'Network Out',
              data: data.outData.map(p => p.Average),
              borderColor: '#ef4444',
              backgroundColor: '#ef4444',
              tension: 0.4
            }
          ]
        });
      });
  }, [selected]);


  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">
        AWS Monitoring Dashboard
      </h1>

      <div className="stats-row">
        <div className="stat-card">
          <h4>Instances</h4>
          <p>{instances.length}</p>
        </div>

        <div className="stat-card">
          <h4>Environment</h4>
          <p>DEV</p>
        </div>

        <div className="stat-card">
          <h4>Load Balancer</h4>
          <p>ALB</p>
        </div>

        <div className="stat-card">
          <h4>Status</h4>
          <p>✅</p>
        </div>
      </div>

      <div className="selector">
        <label>Select Instance:</label>

        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {instances.map(inst => (
            <option key={inst.id} value={inst.id}>
              {inst.name}
            </option>
          ))}
        </select>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h2>CPU Usage</h2>

          {cpuData ? (
            <Line data={cpuData} options={chartOptions} />
          ) : (
            <p>Loading...</p>
          )}
        </div>

        <div className="chart-card">
          <h2>Network Usage</h2>

          {networkData ? (
            <Line data={networkData} options={chartOptions} />
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
}