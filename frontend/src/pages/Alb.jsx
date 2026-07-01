import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

export default function Alb() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('http://backend:3001/alb-requests')
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