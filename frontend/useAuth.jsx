import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (email, password) => {
    // Giả lập đăng nhập thành công với bất kỳ email/pass nào
    const mockUser = {
      name: 'Độ Mixi',
      email: email,
      avatar: 'Đ',
      goal: 'Giảm cân & Tăng cơ',
      calories: 1800
    };
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    return true;
  };

  const register = (name, email) => {
    const mockUser = { name, email, avatar: name[0], goal: 'Sống khoẻ', calories: 2000 };
    setUser(mockUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);