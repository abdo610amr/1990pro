"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Address, Order } from "@/types";
import { authApi } from "@/lib/api-client";
import type { BackendUser } from "@/lib/backend-types";

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  addresses: Address[];
  orders: Order[];
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  addAddress: (address: Omit<Address, "id">) => Promise<void>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  hydrate: () => Promise<void>;
}

function mapUser(user: BackendUser): User {
  return {
    id: String(user.id),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    avatar: user.avatar ?? undefined,
  };
}

function mapAddresses(addresses: Array<Record<string, unknown>>): Address[] {
  return addresses.map((address) => ({
    id: String(address.id),
    label: String(address.label ?? "Address"),
    firstName: String(address.firstName ?? ""),
    lastName: String(address.lastName ?? ""),
    street: String(address.street ?? ""),
    city: String(address.city ?? ""),
    state: String(address.state ?? ""),
    zipCode: String(address.zipCode ?? ""),
    country: String(address.country ?? ""),
    phone: String(address.phone ?? ""),
    isDefault: address.isDefault === true,
  }));
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      addresses: [],
      orders: [],

      login: async (email, password) => {
        try {
          const result = await authApi.login(email, password);
          set({
            user: mapUser(result.user),
            token: result.token,
            isAuthenticated: true,
            addresses: mapAddresses(result.user.addresses),
          });
          return true;
        } catch {
          return false;
        }
      },

      register: async (data) => {
        try {
          const result = await authApi.register(data);
          set({
            user: mapUser(result.user),
            token: result.token,
            isAuthenticated: true,
            addresses: mapAddresses(result.user.addresses),
          });
          return true;
        } catch {
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          addresses: [],
          orders: [],
        });
      },

      updateProfile: async (data) => {
        const { token } = get();
        if (!token) return;
        const user = await authApi.updateProfile(token, data);
        set({ user: mapUser(user) });
      },

      addAddress: async (address) => {
        const { token } = get();
        if (!token) return;
        await authApi.addAddress(token, address);
        set({ addresses: mapAddresses(await authApi.addresses(token)) });
      },

      updateAddress: async (id, data) => {
        const { token } = get();
        if (!token) return;
        await authApi.updateAddress(token, id, data);
        set({ addresses: mapAddresses(await authApi.addresses(token)) });
      },

      removeAddress: async (id) => {
        const { token } = get();
        if (!token) return;
        await authApi.deleteAddress(token, id);
        set({ addresses: mapAddresses(await authApi.addresses(token)) });
      },

      hydrate: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const user = await authApi.me(token);
          set({
            user: mapUser(user),
            isAuthenticated: true,
            addresses: mapAddresses(user.addresses),
          });
        } catch {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            addresses: [],
          });
        }
      },
    }),
    { name: "1990-auth" }
  )
);
