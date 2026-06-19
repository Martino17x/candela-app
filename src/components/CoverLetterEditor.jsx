function formatearFechaLarga(fecha) {
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

const DEFAULTS = {
  empresa: '',
  puesto: '',
  fuenteContacto: '',
  areaODestinatario: '',
  ciudad: 'Córdoba Capital',
  fecha: formatearFechaLarga(new Date()),
};

export function CoverLetterEditor({ datos, onChange }) {
  const handle = (campo) => (e) => onChange({ ...datos, [campo]: e.target.value });

  const handleLimpiar = () => {
    onChange({ ...DEFAULTS, fecha: formatearFechaLarga(new Date()) });
  };

  const empresa = datos.empresa || '{{EMPRESA}}';
  const puesto = datos.puesto || '{{PUESTO}}';
  const fuente = datos.fuenteContacto || '{{FUENTE_CONTACTO}}';
  const area = datos.areaODestinatario || '{{AREA_O_DESTINATARIO}}';
  const ciudad = datos.ciudad || '{{CIUDAD}}';
  const fecha = datos.fecha || '{{FECHA}}';

  return (
    <section className="card">
      <div className="card-header-row">
        <h2 className="card-title">Carta de presentación</h2>
        <button type="button" className="btn-link" onClick={handleLimpiar}>
          Limpiar campos
        </button>
      </div>
      <p className="card-subtitle">
        Completá los datos de la postulación. El preview abajo muestra cómo va a quedar.
      </p>

      <div className="field-row">
        <div className="field">
          <label htmlFor="carta-empresa">Empresa</label>
          <input
            id="carta-empresa"
            type="text"
            value={datos.empresa}
            onChange={handle('empresa')}
            placeholder="Ej: Grupo Libertad"
          />
        </div>
        <div className="field">
          <label htmlFor="carta-puesto">Puesto</label>
          <input
            id="carta-puesto"
            type="text"
            value={datos.puesto}
            onChange={handle('puesto')}
            placeholder="Ej: Asistente administrativa"
          />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="carta-area">Área o destinatario</label>
          <input
            id="carta-area"
            type="text"
            value={datos.areaODestinatario}
            onChange={handle('areaODestinatario')}
            placeholder="Ej: Recursos Humanos"
          />
        </div>
        <div className="field">
          <label htmlFor="carta-fuente">Fuente de contacto</label>
          <input
            id="carta-fuente"
            type="text"
            value={datos.fuenteContacto}
            onChange={handle('fuenteContacto')}
            placeholder="Ej: LinkedIn"
          />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="carta-ciudad">Ciudad</label>
          <input
            id="carta-ciudad"
            type="text"
            value={datos.ciudad}
            onChange={handle('ciudad')}
            placeholder="Córdoba Capital"
          />
        </div>
        <div className="field">
          <label htmlFor="carta-fecha">Fecha</label>
          <input
            id="carta-fecha"
            type="text"
            value={datos.fecha}
            onChange={handle('fecha')}
            placeholder="19 de junio de 2026"
          />
        </div>
      </div>

      <div className="carta-preview" aria-label="Preview en vivo de la carta">
        <div className="carta-preview-asunto">
          Ref.: Postulación al puesto de <strong>{puesto}</strong>
        </div>
        <p className="carta-preview-saludo">Estimados/as de <strong>{empresa}</strong>:</p>
        <p>
          Me dirijo a ustedes para postularme al puesto de <strong>{puesto}</strong>{' '}
          publicado en <strong>{fuente}</strong>. Soy Candela González, técnica en
          Economía y Administración, con más de cinco años de experiencia en atención
          al cliente, gestión administrativa, control de stock y ventas en comercios
          físicos. Me mudé recientemente a la zona de General Paz, en Córdoba Capital,
          y cuento con disponibilidad inmediata para incorporarme.
        </p>
        <p>
          A lo largo de mi trayectoria en librerías, regalería y un emprendimiento
          propio, desarrollé habilidades en <strong>gestión de consultas, organización
          administrativa, control de inventario, reposición de mercadería y atención al
          cliente tanto presencial como por canales digitales</strong>. Trabajé con
          planillas de registro, control de caja y seguimiento de pedidos, siempre con
          foco en la eficiencia operativa y la satisfacción del cliente. Considero que
          mi perfil encaja con los requisitos del puesto y con el ritmo de trabajo de{' '}
          <strong>{empresa}</strong>.
        </p>
        <p>
          Adjunto mi currículum vitae para que conozcan más en detalle mi experiencia.
          Quedo a su disposición para ampliar cualquier información o coordinar una
          entrevista cuando lo consideren conveniente. Agradezco el tiempo dedicado a
          leer mi postulación y espero tener la oportunidad de sumarme al equipo.
        </p>
        <p className="carta-preview-cierre">Cordialmente,</p>
        <p className="carta-preview-firma">Candela González — {ciudad}, {fecha}</p>
        <p className="carta-preview-meta">
          Destinatario: {area} · {ciudad} · {fecha}
        </p>
      </div>
    </section>
  );
}

export const COVER_LETTER_DEFAULTS = DEFAULTS;
