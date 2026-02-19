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
  setUserInfo: ({ token, role }) => {
    set({ token, role });
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    
    // Set default profile based on role if not already set
    if (role === 'seeker') {
      const defaultSeeker = {
        username: '求职者小王',
        company: '普通用户',
        email: 'seeker_wang@example.com',
        phone: '13900139000'
      };
      set({ profile: defaultSeeker });
      localStorage.setItem("username", defaultSeeker.username);
      localStorage.setItem("company", defaultSeeker.company);
      localStorage.setItem("email", defaultSeeker.email);
      localStorage.setItem("phone", defaultSeeker.phone);
    } else {
      const defaultHr = {
        username: 'HR Admin',
        company: '咕咕嘎嘎科技有限公司',
        email: 'hr_admin@gugugaga.com',
        phone: '13800138000'
      };
      set({ profile: defaultHr });
      localStorage.setItem("username", defaultHr.username);
      localStorage.setItem("company", defaultHr.company);
      localStorage.setItem("email", defaultHr.email);
      localStorage.setItem("phone", defaultHr.phone);
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
