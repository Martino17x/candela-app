export function ContactForm({ datos, onChange }) {
  const handle = (campo) => (e) => onChange({ ...datos, [campo]: e.target.value });

  return (
    <section className="card">
      <h2 className="card-title">Datos de contacto</h2>
      <p className="card-subtitle">
        Editá tus datos. Se guardan automáticamente en este navegador.
      </p>

      <div className="field">
        <label htmlFor="contact-nombre">Nombre completo</label>
        <input
          id="contact-nombre"
          type="text"
          value={datos.nombre}
          onChange={handle('nombre')}
          autoComplete="name"
        />
      </div>

      <div className="field">
        <label htmlFor="contact-titulo">Título profesional</label>
        <input
          id="contact-titulo"
          type="text"
          value={datos.tituloProfesional}
          onChange={handle('tituloProfesional')}
          placeholder="Ej: Administración | Atención al Cliente | Control de Stock"
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="contact-telefono">Teléfono</label>
          <input
            id="contact-telefono"
            type="tel"
            value={datos.telefono}
            onChange={handle('telefono')}
            placeholder="(3549) 000000"
          />
        </div>

        <div className="field">
          <label htmlFor="contact-email">Email</label>
          <input
            id="contact-email"
            type="email"
            value={datos.email}
            onChange={handle('email')}
            autoComplete="email"
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="contact-zona">Zona</label>
        <input
          id="contact-zona"
          type="text"
          value={datos.zona}
          onChange={handle('zona')}
        />
      </div>

      <div className="field">
        <label htmlFor="contact-linkedin">LinkedIn <span className="muted">(opcional)</span></label>
        <input
          id="contact-linkedin"
          type="url"
          value={datos.linkedin}
          onChange={handle('linkedin')}
          placeholder="https://linkedin.com/in/candela-gonzalez"
        />
      </div>
    </section>
  );
}
