import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

export default function Latency() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('http://demo-lb-1007612560.eu-west-1.elb.amazonaws.com/latency')
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