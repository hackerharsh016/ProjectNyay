import { describe, it, expect, vi } from 'vitest';
import { RoleService } from './role.service';
import prisma from '../../src/lib/prisma';

vi.mock('../../src/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

describe('RoleService.evaluateAccess', () => {
  it('throws error for invalid requirement format', async () => {
    await expect(RoleService.evaluateAccess('user1', 'ADMIN')).rejects.toThrow(
      "Invalid requirement format. Must start with 'role:' or 'perm:'"
    );
  });

  it('returns true if user has ADMIN role (wildcard)', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'user1',
      roles: [{ role: { name: 'ADMIN', permissions: [] } }]
    } as never);

    const result = await RoleService.evaluateAccess('user1', 'perm:case:approve');
    expect(result).toBe(true);
  });

  it('returns true if user has exact role requested', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'user2',
      roles: [{ role: { name: 'MODERATOR', permissions: [] } }]
    } as never);

    const result = await RoleService.evaluateAccess('user2', 'role:MODERATOR');
    expect(result).toBe(true);
  });

  it('returns false if user does not have exact role requested', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'user3',
      roles: [{ role: { name: 'CITIZEN', permissions: [] } }]
    } as never);

    const result = await RoleService.evaluateAccess('user3', 'role:MODERATOR');
    expect(result).toBe(false);
  });

  it('returns true if user role has exact permission requested', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'user4',
      roles: [
        { 
          role: { 
            name: 'REPORTER', 
            permissions: [{ permission: { name: 'case:create_verified' } }] 
          } 
        }
      ]
    } as never);

    const result = await RoleService.evaluateAccess('user4', 'perm:case:create_verified');
    expect(result).toBe(true);
  });

  it('returns true if user role has wildcard permission', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'user5',
      roles: [
        { 
          role: { 
            name: 'SOME_ROLE', 
            permissions: [{ permission: { name: '*' } }] 
          } 
        }
      ]
    } as never);

    const result = await RoleService.evaluateAccess('user5', 'perm:anything');
    expect(result).toBe(true);
  });

  it('returns false if user role does not have requested permission', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'user6',
      roles: [
        { 
          role: { 
            name: 'CITIZEN', 
            permissions: [{ permission: { name: 'case:create' } }] 
          } 
        }
      ]
    } as never);

    const result = await RoleService.evaluateAccess('user6', 'perm:case:approve');
    expect(result).toBe(false);
  });
});
