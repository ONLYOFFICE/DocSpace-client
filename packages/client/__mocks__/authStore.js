export const authStore = {
  auth: {
    isAuthenticated: true,
    user: {
      id: "user-1",
      displayName: "Test User",
      email: "test@example.com"
    }
  },
  setAuth: jest.fn(),
  logout: jest.fn()
};
