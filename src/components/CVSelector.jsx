const OPCIONES = [
  { id: 'cv-administrativa-recepcionista', label: 'Administrativa / Recepcionista' },
  { id: 'cv-atencion-cliente-customer-service', label: 'Atención al Cliente / Customer Service' },
  { id: 'cv-comercial-ventas-stock', label: 'Comercial / Ventas / Stock' },
];

export function CVSelector({ selectedCV, onSelect }) {
  return (
    <section className="card">
      <h2 className="card-title">Elegí el CV</h2>
      <p className="card-subtitle">El preview se actualiza al toque.</p>

      <div className="cv-options" role="radiogroup" aria-label="Variantes de CV">
        {OPCIONES.map((op) => (
          <label
            key={op.id}
            className={`cv-option ${selectedCV === op.id ? 'cv-option--active' : ''}`}
          >
            <input
              type="radio"
              name="cv-selector"
              value={op.id}
              checked={selectedCV === op.id}
              onChange={() => onSelect(op.id)}
            />
            <span>{op.label}</span>
          </label>
        ))}
      </div>
    </section>
  );
}

export { OPCIONES as CV_OPCIONES };
