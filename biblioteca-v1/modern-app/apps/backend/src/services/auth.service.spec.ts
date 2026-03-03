jest.mock('../../db/database', () => ({
  prepare: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('test.jwt.token'),
}));

import { AuthService } from './auth.service';
import { AppError } from '../middleware/error.middleware';

const db = jest.requireMock('../../db/database') as { prepare: jest.Mock };
const bcrypt = jest.requireMock('bcryptjs') as { compare: jest.Mock };

describe('AuthService', () => {
  let service: AuthService;
  let stmtMock: { get: jest.Mock; run: jest.Mock; all: jest.Mock };

  beforeEach(() => {
    service = new AuthService();
    stmtMock = { get: jest.fn(), run: jest.fn(), all: jest.fn() };
    db.prepare.mockReturnValue(stmtMock);
    jest.clearAllMocks();
    db.prepare.mockReturnValue(stmtMock);
  });

  describe('login', () => {
    const fakeUser = {
      id: 1, username: 'admin', password: 'hashed_pw', rol: 'admin', activo: 1,
    };

    it('returns token and user on valid credentials', async () => {
      stmtMock.get.mockReturnValue(fakeUser);
      bcrypt.compare.mockResolvedValue(true);

      const result = await service.login({ username: 'admin', password: 'admin123' });

      expect(result.token).toBe('test.jwt.token');
      expect(result.usuario.username).toBe('admin');
      expect(result.usuario.rol).toBe('admin');
    });

    it('throws 401 when user not found', async () => {
      stmtMock.get.mockReturnValue(undefined);

      await expect(service.login({ username: 'x', password: 'y' }))
        .rejects.toBeInstanceOf(AppError);
    });

    it('throws 401 when password is wrong', async () => {
      stmtMock.get.mockReturnValue(fakeUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(service.login({ username: 'admin', password: 'wrong' }))
        .rejects.toBeInstanceOf(AppError);
    });

    it('AppError has statusCode 401', async () => {
      stmtMock.get.mockReturnValue(undefined);
      try {
        await service.login({ username: 'x', password: 'y' });
      } catch (err) {
        expect((err as AppError).statusCode).toBe(401);
      }
    });
  });
});
