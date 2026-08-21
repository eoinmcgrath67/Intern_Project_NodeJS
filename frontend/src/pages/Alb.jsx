import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

export default function Alb() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/alb-requests`)
      .then(res => res.json())
      .then(res => {
        setData({
          labels: res.map(p => new Date(p.Timestamp).toLocaleTimeString()),
          datasets: [{
            label: 'Requests',
            data: res.map(p => p.Sum),
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