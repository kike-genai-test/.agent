jest.mock('../../db/database', () => ({
  prepare: jest.fn(),
}));

import { SociosService } from './socios.service';
import { AppError } from '../middleware/error.middleware';

const db = jest.requireMock('../../db/database') as { prepare: jest.Mock };

describe('SociosService', () => {
  let service: SociosService;
  let stmtMock: { get: jest.Mock; run: jest.Mock; all: jest.Mock };

  beforeEach(() => {
    service = new SociosService();
    stmtMock = { get: jest.fn(), run: jest.fn(), all: jest.fn() };
    jest.clearAllMocks();
    db.prepare.mockReturnValue(stmtMock);
  });

  const fakeSocio = {
    id: 1, apellidos: 'García', nombres: 'Juan',
    nro_doc: '12345678', domicilio: 'Av. Test 123', telefono: '555-0001',
    activo: 1, created_at: '2024-01-01', updated_at: '2024-01-01',
  };

  describe('findAll', () => {
    it('returns all active socios without search', () => {
      stmtMock.all.mockReturnValue([fakeSocio]);
      const result = service.findAll();
      expect(result).toHaveLength(1);
      expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('FROM socios'));
    });

    it('filters by search term', () => {
      stmtMock.all.mockReturnValue([fakeSocio]);
      const result = service.findAll('García');
      expect(result).toHaveLength(1);
      expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('LIKE ?'));
    });
  });

  describe('findById', () => {
    it('returns socio when found', () => {
      stmtMock.get.mockReturnValue(fakeSocio);
      const result = service.findById(1);
      expect(result).toEqual(fakeSocio);
    });

    it('throws AppError 404 when not found', () => {
      stmtMock.get.mockReturnValue(undefined);
      expect(() => service.findById(999)).toThrow(AppError);
    });
  });

  describe('create', () => {
    it('inserts socio and returns it', () => {
      stmtMock.run.mockReturnValue({ lastInsertRowid: 1 });
      stmtMock.get.mockReturnValue(fakeSocio);

      const result = service.create({ apellidos: 'García', nombres: 'Juan' });
      expect(result).toEqual(fakeSocio);
      expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO socios'));
    });
  });

  describe('update', () => {
    it('updates and returns socio', () => {
      // First call: findById in update validates existence
      // Second call: findById at the end to return updated
      stmtMock.get
        .mockReturnValueOnce(fakeSocio)
        .mockReturnValueOnce({ ...fakeSocio, apellidos: 'Gar-Updated' });
      stmtMock.run.mockReturnValue({});

      const result = service.update(1, { apellidos: 'Gar-Updated' }) as typeof fakeSocio;
      expect((result as typeof fakeSocio).apellidos).toBe('Gar-Updated');
    });

    it('throws 400 when no fields to update', () => {
      stmtMock.get.mockReturnValue(fakeSocio);
      expect(() => service.update(1, {})).toThrow(AppError);
    });
  });

  describe('delete', () => {
    it('soft-deletes socio', () => {
      stmtMock.get.mockReturnValue(fakeSocio);
      stmtMock.run.mockReturnValue({});
      expect(() => service.delete(1)).not.toThrow();
      expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('activo = 0'));
    });
  });
});
