import api from "./api";

export const loginUser = async ({ email, password }) => {
  const response = await api.auth.login({
    email,
    password,
  });

  if (!response.success) {
    throw new Error(response.message || "Login failed");
  }

  return response.data.user;
};

export const registerUser = async ({ fullName, email, password, role }) => {
  const response = await api.auth.register({
    hoTen: fullName,
    email,
    matKhau: password,
    vaiTro: role,
  });

  if (!response.success) {
    throw new Error(response.message || "Register failed");
  }

  return response.data.user;
};
