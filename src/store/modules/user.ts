import { create } from "zustand";

export type UserRole = 'seeker' | 'hr';

interface StoreType {
  id: string;
  token: string;
  role: UserRole | null;
  setUserInfo: (info: { token: string; role: UserRole }) => void;
  clearUserInfo: () => void;
}

const useUserStore = create<StoreType>((set) => ({
  id: "",
  token: localStorage.getItem("token") || "",
  role: (localStorage.getItem("role") as UserRole) || null,
  setUserInfo: ({ token, role }) => {
    set({ token, role });
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
  },
  clearUserInfo: () => {
    set({ token: "", role: null });
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  },
}));

export default useUserStore;
