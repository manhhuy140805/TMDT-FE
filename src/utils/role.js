export const getStoredUser = () => {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Error parsing stored user:", error);
    return null;
  }
};

export const getUserRole = (user) => {
  if (!user) return null;
  return user.vaiTro || user.role || null;
};

const normalizeRole = (role) => {
  if (!role) return "";
  return role.toString().trim().toLowerCase();
};

export const isEmployerRole = (role) => {
  const normalized = normalizeRole(role);
  return normalized === "nguoithue" || normalized === "employer";
};

export const isFreelancerRole = (role) => {
  const normalized = normalizeRole(role);
  return normalized === "freelancer";
};

export const isSupervisorRole = (role) => {
  const normalized = normalizeRole(role);
  return normalized === "donvigiamsat" || normalized === "supervisor";
};

export const isAdminRole = (role) => {
  const normalized = normalizeRole(role);
  return normalized === "admin";
};
