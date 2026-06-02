export function getToken() {
  return localStorage.getItem("english_token") || localStorage.getItem("token");
}

export function getAuthUser() {
  try {
    const token = getToken();
    if (!token) return null;

    const payload = JSON.parse(atob(token.split(".")[1]));
    const role = (payload.scope || payload.role || "").toLowerCase();

    return {
      username: payload.sub || payload.username || "User",
      role,
    };
  } catch {
    return null;
  }
}

export function isTeacherRole(role) {
  return String(role || "").includes("teacher");
}

export function isAdminRole(role) {
  return String(role || "").includes("admin");
}

export function isTeacherAccount(user) {
  return isTeacherRole(user?.role);
}

export const TEACHER_HOME_PATH = "/teacher";
export const STUDENT_HOME_PATH = "/danh-sach-khoa-hoc";

export function isTeacherAreaPath(pathname = "") {
  return pathname.startsWith("/teacher");
}

export function isAdminAreaPath(pathname = "") {
  return pathname.startsWith("/admin");
}

export function isStudentAreaPath(pathname = "") {
  return !isTeacherAreaPath(pathname) && !isAdminAreaPath(pathname);
}

export function isTeacherFromProfile(profile) {
  return String(profile?.role || "").toLowerCase().includes("teacher");
}
