import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import InstanceSelector from '../components/InstanceSelector';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export default function Network() {
  const [instances, setInstances] = useState([]);
  const [selected, setSelected] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/instances').then(res => res.json()).then(d => {
      setInstances(d);
      setSelected(d[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;

    fetch(`/network?instanceId=${selected}`)
      .then(res => res.json())
      .then(res => {
        setData({
          labels: res.inData.map(p => new Date(p.Timestamp).toLocaleTimeString()),
          datasets: [
            { label: 'In', data: res.inData.map(p => p.Average), borderColor: 'green' },
            { label: 'Out', data: res.outData.map(p => p.Average), borderColor: 'red' }
          ]
        });
      });
  }, [selected]);

  return (
    <>
      <h2>Network</h2>
      <InstanceSelector instances={instances} selected={selected} setSelected={setSelected} />
      {data && <Line data={data} />}
    </>
  );
}