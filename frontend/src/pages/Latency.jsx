import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { chartOptions } from '../chartOptions';

export default function Latency() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/latency`)
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
      <Line data={data} options={chartOptions} />
    </>
  );
}