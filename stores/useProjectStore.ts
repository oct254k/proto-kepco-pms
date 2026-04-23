'use client';

import { create } from 'zustand';
import { Project } from '@/types';

interface ProjectState {
  selectedProject: Project | null;
  setSelectedProject: (p: Project | null) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  selectedProject: null,
  setSelectedProject: (p) => set({ selectedProject: p }),
}));
