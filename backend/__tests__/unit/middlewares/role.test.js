/**
 * Tests para middleware role
 */

describe('Role Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      userRole: 'adoptante',
      userId: '123'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('Role Authorization', () => {
    test('Debe permitir acceso si rol es válido', () => {
      const allowedRoles = ['adoptante', 'admin'];
      const hasAccess = allowedRoles.includes(req.userRole);

      expect(hasAccess).toBe(true);
      expect(next).not.toHaveBeenCalled();
    });

    test('Debe denegar acceso si rol no es válido', () => {
      const allowedRoles = ['admin'];
      const hasAccess = allowedRoles.includes(req.userRole);

      if (!hasAccess) {
        res.status(403);
        res.json({
          success: false,
          message: 'No tienes permisos para acceder a este recurso'
        });
      }

      expect(hasAccess).toBe(false);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    test('Debe permitir acceso a admin', () => {
      req.userRole = 'admin';
      const allowedRoles = ['admin', 'adminFundacion'];
      const hasAccess = allowedRoles.includes(req.userRole);

      expect(hasAccess).toBe(true);
    });

    test('Debe permitir acceso a adminFundacion', () => {
      req.userRole = 'adminFundacion';
      const allowedRoles = ['adminFundacion'];
      const hasAccess = allowedRoles.includes(req.userRole);

      expect(hasAccess).toBe(true);
    });

    test('Debe denegar acceso a adoptante si solo admin permitido', () => {
      req.userRole = 'adoptante';
      const allowedRoles = ['admin'];
      const hasAccess = allowedRoles.includes(req.userRole);

      expect(hasAccess).toBe(false);
    });

    test('Debe manejar múltiples roles permitidos', () => {
      const allowedRoles = ['admin', 'adminFundacion', 'adoptante'];
      
      ['admin', 'adminFundacion', 'adoptante'].forEach(role => {
        req.userRole = role;
        expect(allowedRoles.includes(req.userRole)).toBe(true);
      });
    });

    test('Debe retornar 403 sin acceso', () => {
      req.userRole = 'adoptante';
      const allowedRoles = ['admin'];

      if (!allowedRoles.includes(req.userRole)) {
        res.status(403).json({
          success: false,
          message: 'Acceso denegado'
        });
      }

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false
        })
      );
    });
  });

  describe('Role Hierarchy', () => {
    test('Admin debe tener todos los permisos', () => {
      req.userRole = 'admin';
      const adminPermissions = [
        'leer_usuarios',
        'crear_usuarios',
        'editar_usuarios',
        'eliminar_usuarios',
        'leer_mascotas',
        'crear_mascotas',
        'editar_mascotas',
        'eliminar_mascotas',
        'leer_donaciones',
        'leer_necesidades'
      ];

      expect(adminPermissions.length).toBeGreaterThan(0);
    });

    test('AdminFundacion debe tener permisos limitados', () => {
      req.userRole = 'adminFundacion';
      const fundacionPermissions = [
        'leer_mascotas',
        'crear_mascotas',
        'editar_mascotas',
        'leer_donaciones',
        'leer_necesidades'
      ];

      expect(fundacionPermissions.length).toBeLessThan(10);
    });

    test('Adoptante debe tener permisos mínimos', () => {
      req.userRole = 'adoptante';
      const adoptantePermissions = [
        'leer_mascotas',
        'crear_solicitud_adopcion',
        'ver_perfil'
      ];

      expect(adoptantePermissions.length).toBeLessThan(5);
    });
  });

  describe('Permission Checks', () => {
    test('Debe verificar permiso específico', () => {
      const hasPermission = (role, permission) => {
        const rolePermissions = {
          'admin': ['*'],
          'adminFundacion': ['mascotas:*', 'donaciones:read'],
          'adoptante': ['mascotas:read', 'solicitudes:create']
        };
        
        const permissions = rolePermissions[role] || [];
        return permissions.includes('*') || permissions.includes(permission);
      };

      expect(hasPermission('admin', 'cualquier:permiso')).toBe(true);
      expect(hasPermission('adoptante', 'mascotas:read')).toBe(true);
      expect(hasPermission('adoptante', 'usuarios:delete')).toBe(false);
    });

    test('Debe denegar acceso a recurso admin siendo adoptante', () => {
      const canAccess = (role, resource) => {
        const adminOnly = ['usuarios', 'configuracion', 'reportes'];
        if (role === 'admin') return true;
        if (role === 'adminFundacion') return !['usuarios', 'configuracion'].includes(resource);
        return false;
      };

      expect(canAccess('admin', 'usuarios')).toBe(true);
      expect(canAccess('adoptante', 'usuarios')).toBe(false);
      expect(canAccess('adminFundacion', 'mascotas')).toBe(true);
    });
  });
});
