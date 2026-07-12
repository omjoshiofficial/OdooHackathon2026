import { mockUsers } from '../mock/data';

const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

const createFakeToken = (user) =>
  btoa(JSON.stringify({ id: user.id, email: user.email, role: user.role, exp: Date.now() + 86400000 }));

export const authApi = {
  async login({ email, password }) {
    await delay();
    const user = mockUsers.find((u) => u.email === email && u.password === password);
    if (!user) throw { response: { data: { message: 'Invalid email or password.' } } };
    const token = createFakeToken(user);
    const { password: _, ...safeUser } = user;
    return { data: { token, user: safeUser } };
  },

  async logout() {
    await delay(200);
    return { data: { success: true } };
  },

  async getProfile() {
    await delay();
    const raw = localStorage.getItem('transitops_user');
    if (!raw) throw { response: { data: { message: 'Not authenticated' } } };
    const stored = JSON.parse(raw);
    const user = mockUsers.find((u) => u.id === stored.id);
    if (!user) throw { response: { data: { message: 'User not found' } } };
    const { password: _, ...safeUser } = user;
    return { data: safeUser };
  },

  async updateProfile(data) {
    await delay();
    return { data: { ...data, updatedAt: new Date().toISOString() } };
  },

  async changePassword({ currentPassword, newPassword }) {
    await delay();
    if (!currentPassword || !newPassword) throw { response: { data: { message: 'All fields required.' } } };
    return { data: { success: true } };
  },
};
