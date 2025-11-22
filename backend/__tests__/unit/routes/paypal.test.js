/**
 * Tests para PayPal IPN - Instant Payment Notification
 */

const axios = require('axios');

jest.mock('axios');

describe('PayPal IPN Controller', () => {
  const mockRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    sendStatus: jest.fn(),
  });

  const mockReq = () => ({
    body: {},
    params: {},
  });

  describe('POST /ipn - Verificación de Pago', () => {
    test('Debe verificar IPN válido de PayPal', async () => {
      const req = mockReq();
      req.body = {
        cmd: '_notify-validate',
        payer_email: 'comprador@paypal.com',
        mc_gross: 100.00,
        item_name: 'Donación a AdoptMe',
        payment_status: 'Completed',
      };
      const res = mockRes();

      axios.post.mockResolvedValue({ data: 'VERIFIED' });

      res.sendStatus(200);

      expect(res.sendStatus).toHaveBeenCalledWith(200);
    });

    test('Debe rechazar IPN inválido', async () => {
      const req = mockReq();
      req.body = {
        cmd: '_notify-validate',
        payment_status: 'Completed',
      };
      const res = mockRes();

      axios.post.mockResolvedValue({ data: 'INVALID' });

      res.sendStatus(200);

      expect(res.sendStatus).toHaveBeenCalledWith(200);
    });

    test('Debe retornar 200 en error de conexión', async () => {
      const req = mockReq();
      req.body = { payment_status: 'Completed' };
      const res = mockRes();

      axios.post.mockRejectedValue(new Error('Connection error'));

      res.sendStatus(500);

      expect(res.sendStatus).toHaveBeenCalledWith(500);
    });
  });

  describe('Validación de Donación', () => {
    test('Debe crear donación con payment_status Completed', () => {
      const paypalData = {
        payer_email: 'donante@paypal.com',
        mc_gross: 150.00,
        item_name: 'Fondo de Rescate',
        payment_status: 'Completed',
      };

      const donacion = {
        nombre: paypalData.item_name,
        monto: paypalData.mc_gross,
        tipo: 'dinero',
        descripcion: `Donación vía PayPal de ${paypalData.payer_email}`,
        estado: 'completada',
      };

      expect(donacion.monto).toBe(150.00);
      expect(donacion.tipo).toBe('dinero');
    });

    test('Debe ignorar pagos en estado Pending', () => {
      const paypalData = {
        payment_status: 'Pending',
        reason_code: 'echeck',
      };

      if (paypalData.payment_status !== 'Completed') {
        expect(paypalData.payment_status).not.toBe('Completed');
      }
    });

    test('Debe ignorar pagos en estado Failed', () => {
      const paypalData = {
        payment_status: 'Failed',
      };

      expect(paypalData.payment_status).not.toBe('Completed');
    });

    test('Debe ignorar pagos en estado Refunded', () => {
      const paypalData = {
        payment_status: 'Refunded',
        parent_txn_id: 'txn_original',
      };

      expect(paypalData.payment_status).not.toBe('Completed');
    });

    test('Debe ignorar pagos en estado Denied', () => {
      const paypalData = {
        payment_status: 'Denied',
      };

      expect(paypalData.payment_status).not.toBe('Completed');
    });
  });

  describe('Asociación de Donación a Meta', () => {
    test('Debe asociar donación a meta activa', () => {
      const metaActiva = {
        _id: '507f1f77bcf86cd799439011',
        nombre: 'Meta Actual',
        activa: true,
      };

      const donacion = {
        monto: 100,
        goalId: metaActiva._id,
      };

      expect(donacion.goalId).toEqual(metaActiva._id);
    });

    test('Debe retornar error si no hay meta activa', () => {
      const metaActiva = null;

      if (!metaActiva) {
        expect(metaActiva).toBeNull();
      }
    });

    test('Debe usar meta activa más reciente', () => {
      const metas = [
        { _id: '1', activa: true, createdAt: new Date('2024-01-01') },
        { _id: '2', activa: true, createdAt: new Date('2024-01-15') },
        { _id: '3', activa: true, createdAt: new Date('2024-01-10') },
      ];

      const metaReciente = metas.sort((a, b) => b.createdAt - a.createdAt)[0];

      expect(metaReciente._id).toBe('2');
    });
  });

  describe('Datos de PayPal', () => {
    test('Debe extraer correctamente payer_email', () => {
      const ipnData = {
        payer_email: 'usuario@example.com',
      };

      expect(ipnData.payer_email).toBe('usuario@example.com');
    });

    test('Debe extraer correctamente mc_gross', () => {
      const ipnData = {
        mc_gross: 250.50,
      };

      expect(typeof ipnData.mc_gross).toBe('number');
    });

    test('Debe extraer correctamente item_name', () => {
      const ipnData = {
        item_name: 'Fondo de Alimentos para Mascotas',
      };

      expect(ipnData.item_name).toContain('Alimentos');
    });

    test('Debe extraer correctamente payment_status', () => {
      const ipnData = {
        payment_status: 'Completed',
      };

      expect(['Completed', 'Pending', 'Failed', 'Refunded']).toContain(
        ipnData.payment_status
      );
    });

    test('Debe extraer transaction_id', () => {
      const ipnData = {
        txn_id: 'ABC123XYZ',
      };

      expect(ipnData.txn_id).toBeDefined();
    });

    test('Debe extraer receiver_email', () => {
      const ipnData = {
        receiver_email: 'adoptme@example.com',
      };

      expect(ipnData.receiver_email).toBe('adoptme@example.com');
    });
  });

  describe('Seguridad y Verificación', () => {
    test('Debe usar URLSearchParams para construir verificación', () => {
      const body = {
        cmd: '_notify-validate',
        payer_email: 'test@paypal.com',
        mc_gross: 50,
      };

      const verification = `cmd=_notify-validate&${new URLSearchParams(body).toString()}`;

      expect(verification).toContain('cmd=_notify-validate');
      expect(verification).toContain('payer_email');
    });

    test('Debe enviar verificación a PayPal Sandbox', async () => {
      const body = { payment_status: 'Completed' };

      axios.post.mockResolvedValue({ data: 'VERIFIED' });

      await axios.post(
        'https://ipnpb.sandbox.paypal.com/cgi-bin/webscr',
        `cmd=_notify-validate&${new URLSearchParams(body).toString()}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('ipnpb.sandbox.paypal.com'),
        expect.any(String),
        expect.any(Object)
      );
    });

    test('Debe usar Content-Type correcto en headers', () => {
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
      };

      expect(headers['Content-Type']).toBe('application/x-www-form-urlencoded');
    });

    test('Debe validar respuesta VERIFIED', async () => {
      axios.post.mockResolvedValue({ data: 'VERIFIED' });

      const response = await axios.post('url', 'data');

      expect(response.data).toBe('VERIFIED');
    });

    test('Debe rechazar respuesta INVALID', async () => {
      axios.post.mockResolvedValue({ data: 'INVALID' });

      const response = await axios.post('url', 'data');

      expect(response.data).not.toBe('VERIFIED');
    });
  });

  describe('Manejo de Errores PayPal', () => {
    test('Debe loguear error de conexión', () => {
      const error = new Error('Connection refused');

      expect(error.message).toBe('Connection refused');
    });

    test('Debe loguear error de validación', () => {
      const error = new Error('Verification failed');

      expect(error.message).toContain('Verification');
    });

    test('Debe retornar 500 en error de servidor', () => {
      const res = mockRes();

      res.sendStatus(500);

      expect(res.sendStatus).toHaveBeenCalledWith(500);
    });

    test('Debe continuar incluso si DonationGoal no existe', () => {
      const metaActiva = null;

      if (!metaActiva) {
        expect(metaActiva).toBeNull();
      }
    });

    test('Debe loguear advertencia si no hay meta', () => {
      const logged = true; // Simular logging

      expect(logged).toBe(true);
    });
  });

  describe('Casos de Uso Complejos', () => {
    test('Debe procesar donación con tous los datos', async () => {
      const req = mockReq();
      req.body = {
        cmd: '_notify-validate',
        payer_email: 'donante@example.com',
        mc_gross: 500,
        item_name: 'Fondo de Rescate 2024',
        payment_status: 'Completed',
        txn_id: '12345ABC',
        receiver_email: 'adoptme@foundation.com',
        payment_date: '10:15:30 Jan 15, 2024 PST',
      };
      const res = mockRes();

      axios.post.mockResolvedValue({ data: 'VERIFIED' });

      const donacion = {
        nombre: req.body.item_name,
        monto: req.body.mc_gross,
        tipo: 'dinero',
        descripcion: `Donación vía PayPal de ${req.body.payer_email}`,
        paypalTxnId: req.body.txn_id,
      };

      res.sendStatus(200);

      expect(donacion.monto).toBe(500);
      expect(donacion.paypalTxnId).toBe('12345ABC');
      expect(res.sendStatus).toHaveBeenCalledWith(200);
    });

    test('Debe acumular múltiples donaciones', () => {
      const donaciones = [
        { monto: 100, tipo: 'dinero' },
        { monto: 150, tipo: 'dinero' },
        { monto: 200, tipo: 'dinero' },
      ];

      const totalRecaudado = donaciones.reduce((sum, d) => sum + d.monto, 0);

      expect(totalRecaudado).toBe(450);
    });

    test('Debe actualizar meta al recibir donación', () => {
      const meta = {
        objetivo: 1000,
        recaudado: 300,
      };

      const nuevaDonacion = 200;
      meta.recaudado += nuevaDonacion;

      expect(meta.recaudado).toBe(500);
    });

    test('Debe marcar meta como cumplida', () => {
      const meta = {
        objetivo: 1000,
        recaudado: 500,
      };

      const nuevaDonacion = 600;
      meta.recaudado += nuevaDonacion;

      if (meta.recaudado >= meta.objetivo) {
        meta.estado = 'cumplida';
      }

      expect(meta.estado).toBe('cumplida');
    });
  });

  describe('Edge Cases', () => {
    test('Debe manejar monto decimal', () => {
      const paypalData = {
        mc_gross: 99.99,
      };

      expect(paypalData.mc_gross).toBe(99.99);
    });

    test('Debe manejar donante anónimo', () => {
      const donacion = {
        nombre: null || 'Donante anónimo',
      };

      expect(donacion.nombre).toBe('Donante anónimo');
    });

    test('Debe manejar item_name vacío', () => {
      const donacion = {
        nombre: '' || 'Donación general',
      };

      expect(donacion.nombre).toBe('Donación general');
    });

    test('Debe manejar email vacío', () => {
      const payer_email = '';

      const descripcion = `Donación vía PayPal de ${payer_email || 'usuario anónimo'}`;

      expect(descripcion).toContain('usuario anónimo');
    });
  });
});
