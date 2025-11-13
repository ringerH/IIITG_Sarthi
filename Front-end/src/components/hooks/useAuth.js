import api from "../../api/config";

export function useAuth() {
  const loginWithGoogle = async (credential) => {
    try {
      // credential is the ID token returned by Google's OAuth
      const res = await api.post("/auth/google", { tokenId: credential });
      // store user/token in localStorage for client-side usage
      if (res.data && res.data.token) {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem("user", JSON.stringify(res.data));
        }
      }
      return res.data;
    } catch (err) {
      // normalize error
      const payload = err?.response?.data || err;
      throw payload;
    }
  };

  return { loginWithGoogle };
}
