import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { API_URL } from '../config';

export default function Latency() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/latency`)
      .then(res => res.json())
      .then(res => {
        setData({
          labels: res.map(p => new Date(p.Timestamp).toLocaleTimeString()),
          datasets: [{
            label: 'Latency',
            data: res.map(p => p.Average),
            borderColor: 'orange'
          }]
        });
      });
  }, []);

  return (
    <>
      <h2>Latency</h2>
      {data && <Line data={data} />}
    </>
  );
}