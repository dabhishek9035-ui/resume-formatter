import type { ResumeData } from './types';

export const defaultResumeData: ResumeData = {
  personalInfo: {
    fullName: '',
    headline: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
  },
  summary: '',
  education: [],
  experience: [],
  skills: [],
  projects: [],
  customSections: [],
  certifications: [],
  achievements: [],
};
