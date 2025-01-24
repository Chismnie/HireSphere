import { create } from "zustand";

interface StoreType {
  id: string,
  token: string
}

const useUserStore = create<StoreType>((set) => ({
  id: "",
  token: "",
  changeId: (newId: string) => set({ id: newId }),
  changeToken: (newToken: string) => {
    set({ token: newToken });
    localStorage.setItem("token", newToken);
  },
}));

export default useUserStore;