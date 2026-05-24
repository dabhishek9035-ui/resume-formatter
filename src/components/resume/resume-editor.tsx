'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { defaultResumeData } from '@/lib/resume/default-resume';
import { ResumeTemplate } from '@/components/resume/resume-template';
import type {
  AchievementEntry,
  CertificationEntry,
  CustomSectionEntry,
  EducationEntry,
  ExperienceEntry,
  ProjectEntry,
  ResumeData,
} from '@/lib/resume/types';

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function updateExperienceBullet(experience: ExperienceEntry, index: number, value: string): ExperienceEntry {
  const bullets = [...experience.bullets];
  bullets[index] = value;
  return { ...experience, bullets };
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-foreground">{children}</h2>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2 text-sm text-foreground">
      <span className="block text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function inputClassName() {
  return 'h-10 w-full border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-foreground';
}

function textareaClassName() {
  return 'min-h-24 w-full border border-border bg-background px-3 py-2 text-sm leading-6 text-foreground outline-none transition focus:border-foreground';
}

const RESUME_STORAGE_KEY = 'resume-builder:draft';

function hasText(value: string) {
  return value.trim().length > 0;
}

function fileToDataUrl(file: File) {
  return new Promise<{ name: string; type: string; dataUrl: string }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({ name: file.name, type: file.type, dataUrl: String(reader.result) });
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

function parseSkillsText(value: string) {
  return value
    .split(/\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function loadSavedResume(): ResumeData | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.localStorage.getItem(RESUME_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as ResumeData;
  } catch {
    return null;
  }
}

export function ResumeEditor() {
  const [resume, setResume] = React.useState<ResumeData>(defaultResumeData);
  const [skillsText, setSkillsText] = React.useState('');
  const [isExporting, setIsExporting] = React.useState(false);
  const [hasLoadedDraft, setHasLoadedDraft] = React.useState(false);

  React.useEffect(() => {
    const savedResume = loadSavedResume();

    if (savedResume) {
      setResume({
        ...defaultResumeData,
        ...savedResume,
        customSections: savedResume.customSections ?? defaultResumeData.customSections,
      });
    }

    setSkillsText((savedResume ?? defaultResumeData).skills.join('\n'));

    setHasLoadedDraft(true);
  }, []);

  React.useEffect(() => {
    if (!hasLoadedDraft || typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(resume));
  }, [hasLoadedDraft, resume]);

  const updatePersonalInfo = (key: keyof ResumeData['personalInfo'], value: string) => {
    setResume((current) => ({
      ...current,
      personalInfo: {
        ...current.personalInfo,
        [key]: value,
      },
    }));
  };

  const updateEducation = (id: string, key: keyof EducationEntry, value: string) => {
    setResume((current) => ({
      ...current,
      education: current.education.map((entry) => (entry.id === id ? { ...entry, [key]: value } : entry)),
    }));
  };

  const addEducation = () => {
    setResume((current) => ({
      ...current,
      education: [
        ...current.education,
        {
          id: createId('edu'),
          institution: '',
          degree: '',
          location: '',
          startDate: '',
          endDate: '',
          details: '',
        },
      ],
    }));
  };

  const removeEducation = (id: string) => {
    setResume((current) => ({
      ...current,
      education: current.education.filter((entry) => entry.id !== id),
    }));
  };

  const updateExperience = (id: string, key: keyof ExperienceEntry, value: string) => {
    setResume((current) => ({
      ...current,
      experience: current.experience.map((entry) => (entry.id === id ? { ...entry, [key]: value } : entry)),
    }));
  };

  const addExperience = () => {
    setResume((current) => ({
      ...current,
      experience: [
        ...current.experience,
        {
          id: createId('exp'),
          company: '',
          title: '',
          location: '',
          startDate: '',
          endDate: '',
          bullets: [''],
        },
      ],
    }));
  };

  const removeExperience = (id: string) => {
    setResume((current) => ({
      ...current,
      experience: current.experience.filter((entry) => entry.id !== id),
    }));
  };

  const updateExperienceBulletAt = (experienceId: string, bulletIndex: number, value: string) => {
    setResume((current) => ({
      ...current,
      experience: current.experience.map((entry) =>
        entry.id === experienceId ? updateExperienceBullet(entry, bulletIndex, value) : entry
      ),
    }));
  };

  const addExperienceBullet = (experienceId: string) => {
    setResume((current) => ({
      ...current,
      experience: current.experience.map((entry) =>
        entry.id === experienceId ? { ...entry, bullets: [...entry.bullets, ''] } : entry
      ),
    }));
  };

  const removeExperienceBullet = (experienceId: string, bulletIndex: number) => {
    setResume((current) => ({
      ...current,
      experience: current.experience.map((entry) =>
        entry.id === experienceId
          ? { ...entry, bullets: entry.bullets.filter((_, index) => index !== bulletIndex) }
          : entry
      ),
    }));
  };

  const updateProject = (id: string, key: keyof ProjectEntry, value: string) => {
    setResume((current) => ({
      ...current,
      projects: current.projects.map((entry) => (entry.id === id ? { ...entry, [key]: value } : entry)),
    }));
  };

  function updateProjectBullet(project: ProjectEntry, index: number, value: string): ProjectEntry {
    const bullets = [...(project.bullets || [])];
    bullets[index] = value;
    return { ...project, bullets };
  }

  const updateProjectBulletAt = (projectId: string, bulletIndex: number, value: string) => {
    setResume((current) => ({
      ...current,
      projects: current.projects.map((entry) => (entry.id === projectId ? updateProjectBullet(entry, bulletIndex, value) : entry)),
    }));
  };

  const addProjectBullet = (projectId: string) => {
    setResume((current) => ({
      ...current,
      projects: current.projects.map((entry) =>
        entry.id === projectId ? { ...entry, bullets: [...(entry.bullets || []), ''] } : entry
      ),
    }));
  };

  const removeProjectBullet = (projectId: string, bulletIndex: number) => {
    setResume((current) => ({
      ...current,
      projects: current.projects.map((entry) =>
        entry.id === projectId ? { ...entry, bullets: (entry.bullets || []).filter((_, index) => index !== bulletIndex) } : entry
      ),
    }));
  };

  const addCustomSection = () => {
    setResume((current) => ({
      ...current,
      customSections: [
        ...current.customSections,
        { id: createId('cust'), label: '', type: 'text', text: '' },
      ],
    }));
  };

  type CustomSectionFieldMap = {
    label: string;
    type: CustomSectionEntry['type'];
    text: string;
    files: CustomSectionEntry['files'];
  };

  const updateCustomSection = <K extends keyof CustomSectionFieldMap>(
    id: string,
    key: K,
    value: CustomSectionFieldMap[K]
  ) => {
    setResume((current) => ({
      ...current,
      customSections: current.customSections.map((entry) => (entry.id === id ? { ...entry, [key]: value } : entry)),
    }));
  };

  const removeCustomSection = (id: string) => {
    setResume((current) => ({ ...current, customSections: current.customSections.filter((s) => s.id !== id) }));
  };

  const handleCustomFiles = async (id: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const converted: Array<{ name: string; type: string; dataUrl: string }> = [];
    for (let i = 0; i < files.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const f = await fileToDataUrl(files[i]);
      converted.push(f);
    }
    updateCustomSection(id, 'files', converted);
  };

  const addProject = () => {
    setResume((current) => ({
      ...current,
      projects: [
        ...current.projects,
        {
          id: createId('proj'),
          name: '',
          role: '',
          dateRange: '',
          details: '',
          bullets: [''],
        },
      ],
    }));
  };

  const removeProject = (id: string) => {
    setResume((current) => ({
      ...current,
      projects: current.projects.filter((entry) => entry.id !== id),
    }));
  };

  const updateCertification = (id: string, key: keyof CertificationEntry, value: string) => {
    setResume((current) => ({
      ...current,
      certifications: current.certifications.map((entry) => (entry.id === id ? { ...entry, [key]: value } : entry)),
    }));
  };

  const addCertification = () => {
    setResume((current) => ({
      ...current,
      certifications: [
        ...current.certifications,
        {
          id: createId('cert'),
          name: '',
          issuer: '',
          date: '',
        },
      ],
    }));
  };

  const removeCertification = (id: string) => {
    setResume((current) => ({
      ...current,
      certifications: current.certifications.filter((entry) => entry.id !== id),
    }));
  };

  const updateAchievement = (id: string, value: string) => {
    setResume((current) => ({
      ...current,
      achievements: current.achievements.map((entry) => (entry.id === id ? { ...entry, text: value } : entry)),
    }));
  };

  const addAchievement = () => {
    setResume((current) => ({
      ...current,
      achievements: [...current.achievements, { id: createId('ach'), text: '' }],
    }));
  };

  const removeAchievement = (id: string) => {
    setResume((current) => ({
      ...current,
      achievements: current.achievements.filter((entry) => entry.id !== id),
    }));
  };

  const exportPdf = async () => {
    setIsExporting(true);

    try {
      const response = await fetch('/api/resume/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resume),
      });

      if (!response.ok) {
        throw new Error('PDF export failed.');
      }

      const pdfBlob = await response.blob();
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = pdfUrl;
      downloadLink.download = `${resume.personalInfo.fullName || 'resume'}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-6 rounded-none border border-border bg-card p-5 shadow-soft sm:p-6">
          <header className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
              Resume Editor- Live formatting of your data 
            </p>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Structured resume editor
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                  Enter resume data in a clean, ATS-friendly form and preview the output live with precise spacing,
                  hierarchy, and alignment.
                  The actual output will differ from the sample, but this editor allows you to focus on content without worrying about formatting details.
                </p>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setResume(defaultResumeData)}>
                  Reset sample
                </Button>
                <Button type="button" onClick={exportPdf} disabled={isExporting}>
                  {isExporting ? 'Generating PDF...' : 'Export PDF'}
                </Button>
              </div>
            </div>
          </header>

          <div className="space-y-6">
            <section className="space-y-4">
              <SectionLabel>Personal Info</SectionLabel>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Field label="Full Name">
                  <input
                    className="h-10 w-full border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-foreground sm:col-span-2 xl:col-span-3"
                    value={resume.personalInfo.fullName}
                    onChange={(event) => updatePersonalInfo('fullName', event.target.value)}
                  />
                </Field>
                <Field label="Headline">
                  <input
                    className={inputClassName()}
                    value={resume.personalInfo.headline}
                    onChange={(event) => updatePersonalInfo('headline', event.target.value)}
                  />
                </Field>
                <Field label="Email">
                  <input
                    className={inputClassName()}
                    value={resume.personalInfo.email}
                    onChange={(event) => updatePersonalInfo('email', event.target.value)}
                  />
                </Field>
                <Field label="Phone">
                  <input
                    className={inputClassName()}
                    value={resume.personalInfo.phone}
                    onChange={(event) => updatePersonalInfo('phone', event.target.value)}
                  />
                </Field>
                <Field label="Location">
                  <input
                    className={inputClassName()}
                    value={resume.personalInfo.location}
                    onChange={(event) => updatePersonalInfo('location', event.target.value)}
                  />
                </Field>
                <Field label="Website">
                  <input
                    className={inputClassName()}
                    value={resume.personalInfo.website}
                    onChange={(event) => updatePersonalInfo('website', event.target.value)}
                  />
                </Field>
                <Field label="LinkedIn">
                  <input
                    className="h-10 w-full border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-foreground sm:col-span-2 xl:col-span-3"
                    value={resume.personalInfo.linkedin}
                    onChange={(event) => updatePersonalInfo('linkedin', event.target.value)}
                  />
                </Field>
              </div>
            </section>

            <section className="space-y-4 rounded-none border border-border bg-background/30 p-4 sm:p-5">
              <SectionLabel>Professional Summary</SectionLabel>
              <div className="grid gap-4 lg:grid-cols-2">
                <Field label="Summary">
                  <textarea
                    className={textareaClassName()}
                    value={resume.summary}
                    onChange={(event) => setResume((current) => ({ ...current, summary: event.target.value }))}
                  />
                </Field>
                <Field label="Skills">
                  <textarea
                    className={textareaClassName()}
                    value={skillsText}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      setSkillsText(nextValue);
                      setResume((current) => ({
                        ...current,
                        skills: parseSkillsText(nextValue),
                      }));
                    }}
                  />
                </Field>
              </div>
            </section>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <SectionLabel>Education</SectionLabel>
              <Button type="button" variant="outline" size="sm" onClick={addEducation}>
                Add education
              </Button>
            </div>
            <div className="space-y-4">
              {resume.education.map((entry, index) => (
                <article key={entry.id} className="space-y-4 border border-border p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                      Education {index + 1}
                    </p>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeEducation(entry.id)}>
                      Remove
                    </Button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Institution">
                      <input className={inputClassName()} value={entry.institution} onChange={(event) => updateEducation(entry.id, 'institution', event.target.value)} />
                    </Field>
                    <Field label="Degree">
                      <input className={inputClassName()} value={entry.degree} onChange={(event) => updateEducation(entry.id, 'degree', event.target.value)} />
                    </Field>
                    <Field label="Location">
                      <input className={inputClassName()} value={entry.location} onChange={(event) => updateEducation(entry.id, 'location', event.target.value)} />
                    </Field>
                    <Field label="Details">
                      <input className={inputClassName()} value={entry.details} onChange={(event) => updateEducation(entry.id, 'details', event.target.value)} />
                    </Field>
                    <Field label="Start Year">
                      <input className={inputClassName()} value={entry.startDate} onChange={(event) => updateEducation(entry.id, 'startDate', event.target.value)} />
                    </Field>
                    <Field label="End Year">
                      <input className={inputClassName()} value={entry.endDate} onChange={(event) => updateEducation(entry.id, 'endDate', event.target.value)} />
                    </Field>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <SectionLabel>Experience</SectionLabel>
              <Button type="button" variant="outline" size="sm" onClick={addExperience}>
                Add experience
              </Button>
            </div>
            <div className="space-y-4">
              {resume.experience.map((entry, index) => (
                <article key={entry.id} className="space-y-4 border border-border p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                      Experience {index + 1}
                    </p>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeExperience(entry.id)}>
                      Remove
                    </Button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Company">
                      <input className={inputClassName()} value={entry.company} onChange={(event) => updateExperience(entry.id, 'company', event.target.value)} />
                    </Field>
                    <Field label="Title">
                      <input className={inputClassName()} value={entry.title} onChange={(event) => updateExperience(entry.id, 'title', event.target.value)} />
                    </Field>
                    <Field label="Location">
                      <input className={inputClassName()} value={entry.location} onChange={(event) => updateExperience(entry.id, 'location', event.target.value)} />
                    </Field>
                    <Field label="Date Range">
                      <div className="grid grid-cols-2 gap-3">
                        <input className={inputClassName()} value={entry.startDate} onChange={(event) => updateExperience(entry.id, 'startDate', event.target.value)} />
                        <input className={inputClassName()} value={entry.endDate} onChange={(event) => updateExperience(entry.id, 'endDate', event.target.value)} />
                      </div>
                    </Field>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                        Bullet points
                      </p>
                      <Button type="button" variant="outline" size="sm" onClick={() => addExperienceBullet(entry.id)}>
                        Add bullet
                      </Button>
                    </div>
                    <div className="space-y-3">
                        {(entry.bullets || []).map((bullet, bulletIndex) => (
                        <div key={`${entry.id}-${bulletIndex}`} className="flex gap-3">
                          <textarea
                            className={cn(textareaClassName(), 'min-h-16 flex-1')}
                            value={bullet}
                            onChange={(event) => updateExperienceBulletAt(entry.id, bulletIndex, event.target.value)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="self-start"
                            onClick={() => removeExperienceBullet(entry.id, bulletIndex)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="col-span-2 w-full space-y-4">
              <div className="flex items-center justify-between gap-4">
                <SectionLabel>Projects</SectionLabel>
                <Button type="button" variant="outline" size="sm" onClick={addProject}>
                  Add project
                </Button>
              </div>
              <div className="space-y-4">
                {resume.projects.map((entry, index) => (
                  <article key={entry.id} className="space-y-4 border border-border p-6">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                        Project {index + 1}
                      </p>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeProject(entry.id)}>
                        Remove
                      </Button>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <Field label="Project Name">
                        <input className={inputClassName()} value={entry.name} onChange={(event) => updateProject(entry.id, 'name', event.target.value)} />
                      </Field>
                      <Field label="Role">
                        <input className={inputClassName()} value={entry.role} onChange={(event) => updateProject(entry.id, 'role', event.target.value)} />
                      </Field>
                      <Field label="Date Range">
                        <input className={inputClassName()} value={entry.dateRange} onChange={(event) => updateProject(entry.id, 'dateRange', event.target.value)} />
                      </Field>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">Bullet points</p>
                          <Button type="button" variant="outline" size="sm" onClick={() => addProjectBullet(entry.id)}>
                            Add bullet
                          </Button>
                        </div>
                        <div className="w-full space-y-3">
                          {(entry.bullets || []).map((bullet, bulletIndex) => (
                            <div key={`${entry.id}-${bulletIndex}`} className="w-full space-y-2">
                              <textarea
                                className={cn(textareaClassName(), 'w-full min-w-0 resize-y')}
                                value={bullet}
                                onChange={(event) => updateProjectBulletAt(entry.id, bulletIndex, event.target.value)}
                              />
                              <Button type="button" variant="ghost" size="sm" onClick={() => removeProjectBullet(entry.id, bulletIndex)}>
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="col-span-2 w-full space-y-4">
              <div className="flex items-center justify-between gap-4">
                <SectionLabel>Certifications</SectionLabel>
                <Button type="button" variant="outline" size="sm" onClick={addCertification}>
                  Add certification
                </Button>
              </div>
              <div className="space-y-4">
                {resume.certifications.map((entry, index) => (
                  <article key={entry.id} className="space-y-4 border border-border p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                        Certification {index + 1}
                      </p>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeCertification(entry.id)}>
                        Remove
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Name">
                        <input className={inputClassName()} value={entry.name} onChange={(event) => updateCertification(entry.id, 'name', event.target.value)} />
                      </Field>
                      <Field label="Issuer">
                        <input className={inputClassName()} value={entry.issuer} onChange={(event) => updateCertification(entry.id, 'issuer', event.target.value)} />
                      </Field>
                      <Field label="Date">
                        <input className={inputClassName()} value={entry.date} onChange={(event) => updateCertification(entry.id, 'date', event.target.value)} />
                      </Field>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="col-span-2 w-full space-y-4">
              <div className="flex items-center justify-between gap-4">
                <SectionLabel>Achievements</SectionLabel>
                <Button type="button" variant="outline" size="sm" onClick={addAchievement}>
                  Add achievement
                </Button>
              </div>
              <div className="space-y-4">
                {resume.achievements.map((entry, index) => (
                  <article key={entry.id} className="space-y-4 border border-border p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                        Achievement {index + 1}
                      </p>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeAchievement(entry.id)}>
                        Remove
                      </Button>
                    </div>
                    <Field label="Achievement text">
                      <textarea
                        className={textareaClassName()}
                        value={entry.text}
                        onChange={(event) => updateAchievement(entry.id, event.target.value)}
                      />
                    </Field>
                  </article>
                ))}
              </div>
            </div>

            <div className="col-span-2 w-full space-y-4">
              <div className="flex items-center justify-between gap-4">
                <SectionLabel>Custom Sections</SectionLabel>
                <Button type="button" variant="outline" size="sm" onClick={addCustomSection}>
                  Add section
                </Button>
              </div>
              <div className="space-y-4">
                {(resume.customSections ?? []).map((section, index) => (
                  <article key={section.id} className="space-y-4 border border-border p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">Section {index + 1}</p>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeCustomSection(section.id)}>
                        Remove
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Label">
                        <input className={inputClassName()} value={section.label} onChange={(e) => updateCustomSection(section.id, 'label', e.target.value)} />
                      </Field>
                      <Field label="Type">
                        <select className={inputClassName()} value={section.type} onChange={(e) => updateCustomSection(section.id, 'type', e.target.value as CustomSectionEntry['type'])}>
                          <option value="text">Text</option>
                          <option value="image">Image</option>
                          <option value="files">Files</option>
                        </select>
                      </Field>
                      {section.type === 'text' ? (
                        <Field label="Content">
                          <textarea className={textareaClassName()} value={section.text || ''} onChange={(e) => updateCustomSection(section.id, 'text', e.target.value)} />
                        </Field>
                      ) : null}
                      {section.type === 'image' ? (
                        <Field label="Image">
                          <input type="file" accept="image/*" className={inputClassName()} onChange={(e) => handleCustomFiles(section.id, e.target.files)} />
                        </Field>
                      ) : null}
                      {section.type === 'files' ? (
                        <Field label="Files">
                          <input type="file" multiple className={inputClassName()} onChange={(e) => handleCustomFiles(section.id, e.target.files)} />
                        </Field>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6 rounded-none border border-border bg-card p-5 shadow-soft sm:p-6 xl:sticky xl:top-6 xl:h-fit">
          <header className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Live preview</p>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">ATS-friendly resume output</h2>
            <p className="text-sm leading-7 text-muted-foreground">
              This preview intentionally keeps the layout minimal, print-safe, and aligned for future PDF export.
            </p>
          </header>

          <ResumeTemplate resume={resume} />
        </aside>
      </div>
    </main>
  );
}
