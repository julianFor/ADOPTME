export const CERT_LAYOUT = {
  base: { width: 1600, height: 1000 },

  campos: {
    // Primera línea punteada (nombre del adoptante)
    adoptante: { x: 0.5, y: 0.288, w: 0.7, align: 'center', font: '700 70px "Dancing Script"' },

    // Segunda línea punteada (nombre de la mascota)
    mascota:   { x: 0.5, y: 0.405, w: 0.7, align: 'center', font: '700 70px "Dancing Script"' },

    // Dotted top-right (a la derecha de "Fecha:")
    fecha:     { x: 0.865, y: 0.1, w: 0.23, align: 'center', font: '700 28px "Dancing Script"' },

    // Firma del adoptante: sobre la línea punteada izquierda inferior
    // (debajo del párrafo, a la izquierda de la huellita)
    firmaBox:  { x: 0.268, y: 0.602, w: 0.16, h: 0.1 }, // centra y escala la firma dentro de esta caja
  }
};
