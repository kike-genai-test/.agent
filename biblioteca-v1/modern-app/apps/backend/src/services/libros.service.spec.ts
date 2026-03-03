jest.mock('../../db/database', () => ({
  prepare: jest.fn(),
}));

import { LibrosService } from './libros.service';
import { AppError } from '../middleware/error.middleware';

const db = jest.requireMock('../../db/database') as { prepare: jest.Mock };

describe('LibrosService', () => {
  let service: LibrosService;
  let stmtMock: { get: jest.Mock; run: jest.Mock; all: jest.Mock };

  const fakeLibro = {
    id: 1, titulo: 'Don Quijote', autor: 'Cervantes',
    estado: 'disponible', socio_id: null,
    fecha_prestamo: null, fecha_devolucion: null, dias: 0,
    socio_apellidos: null, socio_nombres: null, activo: 1,
  };

  const fakePrestado = { ...fakeLibro, estado: 'prestado', socio_id: 2 };

  beforeEach(() => {
    service = new LibrosService();
    stmtMock = { get: jest.fn(), run: jest.fn(), all: jest.fn() };
    jest.clearAllMocks();
    db.prepare.mockReturnValue(stmtMock);
  });

  describe('findAll', () => {
    it('returns all active books', () => {
      stmtMock.all.mockReturnValue([fakeLibro]);
      const result = service.findAll();
      expect(result).toHaveLength(1);
    });

    it('filters by estado', () => {
      stmtMock.all.mockReturnValue([fakeLibro]);
      service.findAll(undefined, 'disponible');
      expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('estado = ?'));
    });

    it('filters by search term', () => {
      stmtMock.all.mockReturnValue([fakeLibro]);
      service.findAll('Quijote');
      expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('LIKE ?'));
    });
  });

  describe('findById', () => {
    it('returns libro when found', () => {
      stmtMock.get.mockReturnValue(fakeLibro);
      expect(service.findById(1)).toEqual(fakeLibro);
    });

    it('throws 404 when not found', () => {
      stmtMock.get.mockReturnValue(undefined);
      expect(() => service.findById(99)).toThrow(AppError);
    });
  });

  describe('create', () => {
    it('inserts and returns new libro', () => {
      stmtMock.run.mockReturnValue({ lastInsertRowid: 1 });
      stmtMock.get.mockReturnValue(fakeLibro);
      const result = service.create({ titulo: 'Don Quijote', autor: 'Cervantes' });
      expect(result).toEqual(fakeLibro);
    });
  });

  describe('update', () => {
    it('updates titulo and returns libro', () => {
      stmtMock.get
        .mockReturnValueOnce(fakeLibro)
        .mockReturnValueOnce({ ...fakeLibro, titulo: 'Nuevo Título' });
      stmtMock.run.mockReturnValue({});
      const result = service.update(1, { titulo: 'Nuevo Título' }) as typeof fakeLibro;
      expect(result.titulo).toBe('Nuevo Título');
    });

    it('throws 400 when no fields provided', () => {
      stmtMock.get.mockReturnValue(fakeLibro);
      expect(() => service.update(1, {})).toThrow(AppError);
    });
  });

  describe('delete', () => {
    it('soft-deletes libro', () => {
      stmtMock.get.mockReturnValue(fakeLibro);
      stmtMock.run.mockReturnValue({});
      expect(() => service.delete(1)).not.toThrow();
      expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('activo = 0'));
    });
  });

  describe('devolver', () => {
    it('marks prestado libro as disponible', () => {
      stmtMock.get
        .mockReturnValueOnce(fakePrestado)
        .mockReturnValueOnce({ ...fakeLibro, estado: 'disponible' });
      stmtMock.run.mockReturnValue({});
      const result = service.devolver(1) as typeof fakeLibro;
      expect(result.estado).toBe('disponible');
    });

    it('throws 400 when already disponible', () => {
      stmtMock.get.mockReturnValue(fakeLibro); // estado = 'disponible'
      expect(() => service.devolver(1)).toThrow(AppError);
    });
  });
});
