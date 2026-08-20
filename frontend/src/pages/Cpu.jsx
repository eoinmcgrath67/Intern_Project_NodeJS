import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import InstanceSelector from '../components/InstanceSelector';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export default function Cpu() {
  const [instances, setInstances] = useState([]);
  const [selected, setSelected] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('http://demo-lb-1007612560.eu-west-1.elb.amazonaws.com/instances')
      .then(res => res.json())
      .then(d => {
        setInstances(d);
        setSelected(d[0].id);
      });
  }, []);

  useEffect(() => {
    if (!selected) return;

    fetch(`http://demo-lb-1007612560.eu-west-1.elb.amazonaws.com/cpu?instanceId=${selected}`)
      .then(res => res.json())
      .then(res => {
        setData({
          labels: res.map(p => new Date(p.Timestamp).toLocaleTimeString()),
          datasets: [{
            label: 'CPU %',
            data: res.map(p => p.Average),
            borderColor: 'blue'
          }]
        });
      });
  }, [selected]);

  return (
    <>
      <h2>CPU Usage</h2>
      <InstanceSelector instances={instances} selected={selected} setSelected={setSelected} />
      {data && <Line data={data} />}
    </>
  );
}