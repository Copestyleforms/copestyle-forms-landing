# Páginas legales: Términos, Privacidad y Tratamiento de Datos

## Contexto

El landing de Copestyle Forms (`index.html`) tiene un footer con links "Legal" que hoy apuntan a `#`. El producto captura datos personales (correo, WhatsApp) en 3 formularios (hero, guía, CTA final) y, en la app, datos operativos (fotos, firmas, geolocalización). Se requiere contenido legal real y consentimiento explícito en los formularios, conforme a la Ley Estatutaria 1581 de 2012 y el Decreto 1377 de 2013 (Colombia).

**Responsable del tratamiento:** Andrés Felipe Álvarez — NIT 1037575073-0 — correo copestyledigital@gmail.com

**Terceros a mencionar:** API de WhatsApp Business / Meta (envío de PDFs). No se usa analítica de terceros (Google Analytics, etc.) ni pasarela de pago de terceros documentada; el texto queda genérico en esos puntos.

## Alcance

1. Tres páginas HTML nuevas en la raíz del proyecto, reutilizando el sistema de diseño existente (`css/reset.css`, `layout.css`, `components.css`, `animations.css`):
   - `terminos-de-servicio.html`
   - `politica-de-privacidad.html`
   - `tratamiento-de-datos.html`
2. Nav y footer idénticos a `index.html`, con la diferencia de que los links de sección (`#funciones`, etc.) apuntan a `index.html#funciones` para volver al home, y los 3 links "Legal" del footer quedan cruzados entre las 3 páginas nuevas (y también se actualizan en `index.html`).
3. Bloque de estilos nuevo para tipografía de contenido legal (encabezados numerados, listas, espaciado de lectura), añadido a `css/components.css` como una sección `.legal-doc` — sin crear un archivo CSS nuevo.
4. Checkbox de consentimiento obligatorio en los 3 `.demo-form` (`hero-form`, `guide-form`, `cta-form`): "Acepto la Política de tratamiento de datos" con link a `tratamiento-de-datos.html`. Estilo nuevo mínimo en `components.css`. Validación en `js/forms.js`: bloquear envío y mostrar error si no está marcado.

## Contenido por página

### Términos de servicio
Qué es Copestyle Forms; planes y forma de pago (instalación única + mensualidad, sin permanencia forzosa); uso aceptable; propiedad intelectual del software y de las plantillas; disponibilidad/soporte según plan; limitación de responsabilidad; terminación del servicio; cambios a los términos; ley aplicable (Colombia); contacto.

### Política de privacidad
Qué datos se recogen (leads del landing: correo/WhatsApp vía formularios; datos operativos de la app: fotos, firmas, geolocalización, respuestas de formularios, membrete/logo del cliente); finalidad de cada uno; con quién se comparte (API de WhatsApp Business/Meta, proveedor de hosting); conservación; medidas de seguridad; menores de edad (servicio no dirigido a menores); cookies (solo técnicas, sin analítica de terceros actualmente); derechos del titular (remite a Tratamiento de Datos); cambios a la política; contacto.

### Tratamiento de datos (Aviso de Privacidad — Habeas Data)
Identificación del responsable (razón social, NIT, correo); finalidades específicas por tipo de dato (contacto de leads vs. datos operativos de campo); derechos del Art. 8 Ley 1581 (conocer, actualizar, rectificar, solicitar prueba de autorización, ser informado del uso, revocar autorización/solicitar supresión, acceder gratuitamente, presentar quejas ante la SIC); procedimiento para ejercer derechos vía correo electrónico; plazos legales (consultas: 10 días hábiles, prorrogables 5 días; reclamos: 15 días hábiles, prórroga de 8 días si se notifica); vigencia de la base de datos (mientras dure la relación comercial + plazos legales de conservación); autorización expresa (checkbox en formularios); contacto.

## Fuera de alcance
- No se integra ninguna pasarela de pago real ni analítica; el texto queda redactado de forma genérica donde aplique.
- No se modifica el backend de leads (`copestyle-leads-backend`), solo la validación de front-end en `forms.js`.
