import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { API_URL } from '../config';
export default function Alb() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/alb-requests`)
      .then(res => res.json())
      .then(res => {
        setData({
          labels: res.map(p => new Date(p.Timestamp).toLocaleTimeString()),
          datasets: [{
            label: 'Requests',
            data: res.map(p => p.Average),
            borderColor: 'purple'
          }]
        });
      });
  }, []);

  return (
    <>
      <h2>ALB Requests</h2>
      {data && <Line data={data} />}
    </>
  );
}