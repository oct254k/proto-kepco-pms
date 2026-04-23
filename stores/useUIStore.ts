'use client';

import { create } from 'zustand';

interface UIState {
  drawerOpen: boolean;
  drawerContent: React.ReactNode | null;
  modalOpen: boolean;
  modalContent: React.ReactNode | null;
  openDrawer: (content?: React.ReactNode) => void;
  closeDrawer: () => void;
  openModal: (content?: React.ReactNode) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  drawerOpen: false,
  drawerContent: null,
  modalOpen: false,
  modalContent: null,
  openDrawer: (content) => set({ drawerOpen: true, drawerContent: content }),
  closeDrawer: () => set({ drawerOpen: false }),
  openModal: (content) => set({ modalOpen: true, modalContent: content }),
  closeModal: () => set({ modalOpen: false }),
}));
