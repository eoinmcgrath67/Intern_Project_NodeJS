import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { API_URL } from '../config';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export default function Dashboard() {
  const [instances, setInstances] = useState([]);
  const [selected, setSelected] = useState('');

  const [cpuData, setCpuData] = useState(null);
  const [networkData, setNetworkData] = useState(null);

  // Load instances
  useEffect(() => {
    fetch(`${API_URL}/instances`)
      .then(res => res.json())
      .then(data => {
        setInstances(data);
        if (data.length > 0) {
          setSelected(data[0].id);
        }
      });
  }, []);

  // Load metrics
  useEffect(() => {
    if (!selected) return;

    // CPU
    fetch(`${API_URL}/cpu?instanceId=${selected}`)
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
              borderColor: 'blue'
            }
          ]
        });
      });

    // Network
    fetch(`${API_URL}/network?instanceId=${selected}`)
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
              borderColor: 'green'
            },
            {
              label: 'Network Out',
              data: data.outData.map(p => p.Average),
              borderColor: 'red'
            }
          ]
        });
      });

  }, [selected]);

  return (
    <div>
      <h2>Dashboard Overview</h2>

      {/* ✅ Instance Selector */}
      <div style={{ marginBottom: '20px' }}>
        <label>Select Instance: </label>
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

      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
      }}>

        
        <div style={{ border: '1px solid #ccc', padding: '15px' }}>
          <h3>CPU Usage</h3>
          {cpuData ? <Line data={cpuData} /> : <p>Loading...</p>}
        </div>

        
        <div style={{ border: '1px solid #ccc', padding: '15px' }}>
          <h3>Network</h3>
          {networkData ? <Line data={networkData} /> : <p>Loading...</p>}
        </div>

      </div>
    </div>
  );
}
