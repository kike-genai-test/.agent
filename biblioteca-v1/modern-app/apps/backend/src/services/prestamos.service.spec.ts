jest.mock('../../db/database', () => ({
  prepare: jest.fn(),
}));

import { PrestamosService } from './prestamos.service';
import { AppError } from '../middleware/error.middleware';

const db = jest.requireMock('../../db/database') as { prepare: jest.Mock };

describe('PrestamosService', () => {
  let service: PrestamosService;
  let stmtMock: { get: jest.Mock; run: jest.Mock; all: jest.Mock };

  const fakeLibroDisponible = { id: 1, estado: 'disponible', activo: 1 };
  const fakeSocio           = { id: 2, activo: 1 };
  const fakeResultado = {
    id: 1, titulo: 'Don Q', autor: 'Cervantes', estado: 'prestado',
    socio_id: 2, fecha_prestamo: '2024-01-01', fecha_devolucion: '2024-01-15', dias: 14,
    socio_apellidos: 'García', socio_nombres: 'Juan',
  };

  beforeEach(() => {
    service = new PrestamosService();
    stmtMock = { get: jest.fn(), run: jest.fn(), all: jest.fn() };
    jest.clearAllMocks();
    db.prepare.mockReturnValue(stmtMock);
  });

  describe('create', () => {
    it('creates prestamo when all conditions are met', () => {
      stmtMock.get
        .mockReturnValueOnce(fakeLibroDisponible) // libro check
        .mockReturnValueOnce(fakeSocio)           // socio check
        .mockReturnValueOnce({ cnt: 0 })          // pending loans
        .mockReturnValueOnce(fakeResultado);      // final SELECT
      stmtMock.run.mockReturnValue({});

      const result = service.create({ libro_id: 1, socio_id: 2, dias: 14 });
      expect(result).toEqual(fakeResultado);
    });

    it('throws 404 when libro not found', () => {
      stmtMock.get.mockReturnValueOnce(undefined);
      expect(() => service.create({ libro_id: 99, socio_id: 2, dias: 14 })).toThrow(AppError);
    });

    it('throws 400 when libro is prestado', () => {
      stmtMock.get.mockReturnValueOnce({ ...fakeLibroDisponible, estado: 'prestado' });
      expect(() => service.create({ libro_id: 1, socio_id: 2, dias: 14 })).toThrow(AppError);
    });

    it('throws 404 when socio not found', () => {
      stmtMock.get
        .mockReturnValueOnce(fakeLibroDisponible)
        .mockReturnValueOnce(undefined); // socio not found
      expect(() => service.create({ libro_id: 1, socio_id: 99, dias: 14 })).toThrow(AppError);
    });

    it('throws 400 when socio has 3 pending loans', () => {
      stmtMock.get
        .mockReturnValueOnce(fakeLibroDisponible)
        .mockReturnValueOnce(fakeSocio)
        .mockReturnValueOnce({ cnt: 3 }); // max reached
      expect(() => service.create({ libro_id: 1, socio_id: 2, dias: 14 })).toThrow(AppError);
    });
  });

  describe('findAll', () => {
    it('returns all active prestamos', () => {
      stmtMock.all.mockReturnValue([fakeResultado]);
      const result = service.findAll();
      expect(result).toHaveLength(1);
      expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining("estado = 'prestado'"));
    });
  });
});
