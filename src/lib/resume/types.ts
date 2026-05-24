export type FieldId = string;

export interface PersonalInfo {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
}

export interface EducationEntry {
  id: FieldId;
  institution: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  details: string;
}

export interface ExperienceEntry {
  id: FieldId;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface ProjectEntry {
  id: FieldId;
  name: string;
  role: string;
  dateRange: string;
  details: string;
}

export interface AttachmentFile {
  name: string;
  type: string;
  dataUrl: string;
}

export interface CustomSectionEntry {
  id: FieldId;
  label: string;
  type: 'text' | 'image' | 'files';
  text?: string;
  files?: AttachmentFile[];
}

export interface CertificationEntry {
  id: FieldId;
  name: string;
  issuer: string;
  date: string;
}

export interface AchievementEntry {
  id: FieldId;
  text: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills: string[];
  projects: ProjectEntry[];
  customSections: CustomSectionEntry[];
  certifications: CertificationEntry[];
  achievements: AchievementEntry[];
}
