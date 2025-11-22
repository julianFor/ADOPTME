// jest.setup.js
// Este archivo se ejecuta antes de cualquier test
// Aquí podemos configurar mocks globales, etc.

// Desactivar logs de consola durante tests
// global.console.log = jest.fn();
// global.console.warn = jest.fn();

// Mock global de mongoose
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    connect: jest.fn().mockResolvedValue({}),
    disconnect: jest.fn().mockResolvedValue({})
  };
});

// Configurar timeout global
jest.setTimeout(10000);

// Cleanup después de tests
afterAll(async () => {
  jest.clearAllMocks();
});
