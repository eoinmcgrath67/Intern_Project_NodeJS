export default function InstanceSelector({ instances, selected, setSelected }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label>Select Instance: </label>
      <select value={selected} onChange={(e) => setSelected(e.target.value)}>
        {instances.map(inst => (
          <option key={inst.id} value={inst.id}>
            {inst.name}
          </option>
        ))}
      </select>
    </div>
  );
}
