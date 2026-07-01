import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

export default function Health() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('http://backend:3001/health')
      .then(res => res.json())
      .then(res => {
        setData({
          labels: res.healthy.map(p => new Date(p.Timestamp).toLocaleTimeString()),
          datasets: [
            { label: 'Healthy', data: res.healthy.map(p => p.Average), borderColor: 'green' },
            { label: 'Unhealthy', data: res.unhealthy.map(p => p.Average), borderColor: 'red' }
          ]
        });
      });
  }, []);

  return (
    <>
      <h2>Health</h2>
      {data && <Line data={data} />}
    </>
  );
}