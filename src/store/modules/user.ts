import { create } from "zustand";

export type UserRole = 'seeker' | 'hr';

interface UserProfile {
  username: string;
  company?: string;
  email?: string;
  phone?: string;
}

interface StoreType {
  id: string;
  token: string;
  role: UserRole | null;
  profile: UserProfile;
  setUserInfo: (info: { token: string; role: UserRole }) => void;
  setId: (id: string) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  clearUserInfo: () => void;
}

const useUserStore = create<StoreType>((set) => ({
  id: "",
  token: localStorage.getItem("token") || "",
  role: (localStorage.getItem("role") as UserRole) || null,
  profile: {
    username: localStorage.getItem("username") || "HR Admin",
    company: localStorage.getItem("company") || "咕咕嘎嘎科技有限公司",
    email: localStorage.getItem("email") || "",
    phone: localStorage.getItem("phone") || "",
  },
  setId: (id) => set({ id }),
  setUserInfo: (userInfo) => {
    set((state) => ({ ...state, ...userInfo }));
    if (userInfo.token) {
      localStorage.setItem('token', userInfo.token);
    }
  },
  updateProfile: (newProfile) =>
    set((state) => {
      const updatedProfile = { ...state.profile, ...newProfile };
      if (newProfile.username) localStorage.setItem("username", newProfile.username);
      if (newProfile.company) localStorage.setItem("company", newProfile.company);
      if (newProfile.email) localStorage.setItem("email", newProfile.email);
      if (newProfile.phone) localStorage.setItem("phone", newProfile.phone);
      return { profile: updatedProfile };
    }),
  clearUserInfo: () => {
    set({ token: "", role: null, profile: { username: "", company: "", email: "", phone: "" } });
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("company");
    localStorage.removeItem("email");
    localStorage.removeItem("phone");
  },
}));

export default useUserStore;
