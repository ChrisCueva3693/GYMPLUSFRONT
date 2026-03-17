import { useEffect } from 'react';

const PrivacyPolicy = () => {
  useEffect(() => {
    document.title = 'Política de Privacidad — GYM Plus';
    window.scrollTo(0, 0);
  }, []);

  const sectionStyle = {
    marginBottom: '2rem',
  };

  const headingStyle = {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: '0.75rem',
  };

  const textStyle = {
    color: '#94a3b8',
    lineHeight: '1.8',
    fontSize: '0.95rem',
  };

  const listStyle = {
    ...textStyle,
    paddingLeft: '1.5rem',
    listStyleType: 'disc',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#f8fafc',
        padding: '0',
      }}
    >
      {/* Header */}
      <header
        style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
          padding: '1.25rem 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #7c3aed, #4c1d95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '0.85rem',
              color: 'white',
            }}
          >
            G+
          </div>
          <span
            style={{ fontWeight: '700', fontSize: '1.15rem', color: '#e2e8f0' }}
          >
            GYM Plus
          </span>
        </div>
      </header>

      {/* Content */}
      <main
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '3rem 2rem 4rem',
        }}
      >
        <h1
          style={{
            fontSize: '2.2rem',
            fontWeight: '800',
            background: 'linear-gradient(90deg, #a78bfa, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem',
          }}
        >
          Política de Privacidad
        </h1>
        <p
          style={{
            color: '#64748b',
            fontSize: '0.9rem',
            marginBottom: '2.5rem',
          }}
        >
          Última actualización: 12 de marzo de 2026
        </p>

        {/* --- Secciones --- */}

        <div style={sectionStyle}>
          <h2 style={headingStyle}>1. Introducción</h2>
          <p style={textStyle}>
            GYM Plus (&quot;nosotros&quot;, &quot;nuestro&quot; o &quot;la aplicación&quot;) se compromete a
            proteger la privacidad de sus usuarios. Esta Política de Privacidad
            describe cómo recopilamos, usamos, almacenamos y protegemos su
            información personal cuando utiliza nuestra aplicación móvil y
            servicios relacionados.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>2. Información que Recopilamos</h2>
          <p style={textStyle}>
            Recopilamos los siguientes tipos de información para proporcionarle
            nuestros servicios:
          </p>
          <ul style={listStyle}>
            <li>
              <strong style={{ color: '#cbd5e1' }}>
                Información de cuenta:
              </strong>{' '}
              nombre de usuario, nombre completo y número de identificación
              (cédula) proporcionado por su gimnasio al registrarle.
            </li>
            <li>
              <strong style={{ color: '#cbd5e1' }}>
                Credenciales de acceso:
              </strong>{' '}
              nombre de usuario y contraseña, almacenados de forma segura
              mediante cifrado en el dispositivo.
            </li>
            <li>
              <strong style={{ color: '#cbd5e1' }}>Datos biométricos:</strong>{' '}
              utilizamos Face ID o Touch ID únicamente para facilitar el inicio
              de sesión rápido. Los datos biométricos son procesados
              exclusivamente por el sistema operativo de su dispositivo; GYM Plus
              no almacena ni transmite datos biométricos.
            </li>
            <li>
              <strong style={{ color: '#cbd5e1' }}>
                Información del gimnasio:
              </strong>{' '}
              nombre del gimnasio y sucursal a la que pertenece, para
              personalizar su experiencia.
            </li>
            <li>
              <strong style={{ color: '#cbd5e1' }}>
                Datos de uso del asistente IA:
              </strong>{' '}
              los mensajes que envía al Coach IA (asistente virtual) son
              procesados por servicios de inteligencia artificial para generar
              respuestas personalizadas. Se envía su identificador de usuario y
              nombre para contextualizar las respuestas.
            </li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>3. Cómo Usamos su Información</h2>
          <ul style={listStyle}>
            <li>Autenticar su identidad y proveer acceso seguro a la app.</li>
            <li>
              Mostrar rutinas de ejercicio y planes de entrenamiento asignados
              por su gimnasio.
            </li>
            <li>
              Ofrecer recomendaciones personalizadas de ejercicios y nutrición a
              través del Coach IA.
            </li>
            <li>
              Verificar el estado de su membresía con su gimnasio afiliado.
            </li>
            <li>Mejorar la calidad de nuestros servicios y experiencia de usuario.</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>4. Almacenamiento y Seguridad</h2>
          <p style={textStyle}>
            Su información se almacena de manera segura utilizando las
            siguientes medidas:
          </p>
          <ul style={listStyle}>
            <li>
              Las credenciales de inicio de sesión se almacenan utilizando{' '}
              <strong style={{ color: '#cbd5e1' }}>
                almacenamiento cifrado (Keychain en iOS, EncryptedSharedPreferences en Android)
              </strong>{' '}
              en su dispositivo.
            </li>
            <li>
              La comunicación entre la aplicación y nuestros servidores se
              realiza mediante <strong style={{ color: '#cbd5e1' }}>HTTPS</strong>{' '}
              con cifrado TLS.
            </li>
            <li>
              Los tokens de autenticación (JWT) se almacenan localmente y tienen
              un tiempo de expiración limitado.
            </li>
            <li>
              No compartimos su información personal con terceros, excepto para
              el procesamiento del Coach IA como se describe en la sección 2.
            </li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>5. Servicios de Terceros</h2>
          <p style={textStyle}>
            Nuestra aplicación utiliza los siguientes servicios de terceros:
          </p>
          <ul style={listStyle}>
            <li>
              <strong style={{ color: '#cbd5e1' }}>
                Servicios de IA (Coach IA):
              </strong>{' '}
              Los mensajes del asistente virtual son procesados a través de
              servicios de inteligencia artificial para generar respuestas. Los
              datos enviados incluyen el mensaje, su identificador de usuario y
              nombre.
            </li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>6. Sus Derechos</h2>
          <p style={textStyle}>Usted tiene derecho a:</p>
          <ul style={listStyle}>
            <li>
              <strong style={{ color: '#cbd5e1' }}>Acceder</strong> a la
              información personal que tenemos almacenada sobre usted.
            </li>
            <li>
              <strong style={{ color: '#cbd5e1' }}>Eliminar su cuenta</strong>{' '}
              y todos los datos asociados desde la sección de perfil dentro de
              la aplicación.
            </li>
            <li>
              <strong style={{ color: '#cbd5e1' }}>Revocar permisos</strong>{' '}
              biométricos en cualquier momento desde la configuración de su
              dispositivo.
            </li>
            <li>
              <strong style={{ color: '#cbd5e1' }}>Cerrar sesión</strong> en
              cualquier momento, lo cual elimina las credenciales almacenadas
              localmente.
            </li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>7. Retención de Datos</h2>
          <p style={textStyle}>
            Sus datos personales se retienen mientras mantenga una cuenta activa
            con su gimnasio afiliado. Al solicitar la eliminación de su cuenta,
            todos sus datos serán eliminados de nuestros servidores en un plazo
            máximo de 30 días. Los datos almacenados localmente en su dispositivo
            se eliminan inmediatamente al cerrar sesión o eliminar la aplicación.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>8. Menores de Edad</h2>
          <p style={textStyle}>
            GYM Plus no está dirigido a menores de 13 años. No recopilamos
            intencionalmente información de menores de 13 años. Si un padre o
            tutor legal descubre que un menor ha proporcionado información
            personal, puede contactarnos para solicitar su eliminación.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>9. Aviso sobre Contenido de Salud y Fitness</h2>
          <p style={textStyle}>
            Las rutinas de ejercicio, recomendaciones de entrenamiento y consejos
            nutricionales proporcionados por GYM Plus y su Coach IA son de
            carácter <strong style={{ color: '#cbd5e1' }}>informativo y orientativo</strong>.
            No constituyen asesoría médica profesional. Consulte siempre con un
            profesional de la salud antes de iniciar cualquier programa de
            ejercicios o dieta, especialmente si tiene condiciones médicas
            preexistentes.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>10. Cambios a esta Política</h2>
          <p style={textStyle}>
            Nos reservamos el derecho de modificar esta Política de Privacidad en
            cualquier momento. Cualquier cambio será publicado en esta página con
            una fecha de actualización revisada. Le recomendamos revisar esta
            política periódicamente.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>11. Contacto</h2>
          <p style={textStyle}>
            Si tiene preguntas o inquietudes sobre esta Política de Privacidad o
            sobre el tratamiento de sus datos personales, puede contactarnos a
            través de:
          </p>
          <ul style={listStyle}>
            <li>
              <strong style={{ color: '#cbd5e1' }}>Correo electrónico:</strong>{' '}
              soporte@gymplus.app
            </li>
            <li>
              <strong style={{ color: '#cbd5e1' }}>En la aplicación:</strong>{' '}
              A través de la sección de Configuración en su perfil.
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: '3rem',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(148, 163, 184, 0.15)',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              color: '#475569',
              fontSize: '0.85rem',
            }}
          >
            © 2026 GYM Plus. Todos los derechos reservados.
          </p>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
