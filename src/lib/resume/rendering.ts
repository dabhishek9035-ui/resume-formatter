import type { ResumeData } from './types';

function clean(value: string) {
  return value.trim();
}

function hasText(value: string) {
  return clean(value).length > 0;
}

export function normalizeLines(value: string) {
  return value
    .split('\n')
    .map((line) => clean(line))
    .filter(Boolean);
}

export function normalizeBullets(values: string[]) {
  return values.map((value) => clean(value)).filter(Boolean);
}

export function formatDateRange(startDate: string, endDate: string) {
  const start = clean(startDate);
  const end = clean(endDate);

  if (!start && !end) {
    return '';
  }

  if (!start) {
    return end;
  }

  if (!end) {
    return start;
  }

  return `${start} - ${end}`;
}

export function formatContactLine(resume: ResumeData) {
  return [
    resume.personalInfo.location,
    resume.personalInfo.email,
    resume.personalInfo.phone,
    resume.personalInfo.website,
    resume.personalInfo.linkedin,
  ]
    .map((value) => clean(value))
    .filter(Boolean)
    .join(' | ');
}

export function formatEducationLine(resume: ResumeData['education'][number]) {
  return [resume.location, resume.startDate, resume.endDate].map((value) => clean(value)).filter(Boolean).join(' | ');
}

export function formatSkillsLine(skills: string[]) {
  return normalizeBullets(skills).join('\n');
}

export function getResumeChecks(resume: ResumeData) {
  const checks: Array<{ label: string; ok: boolean; detail: string }> = [];

  checks.push({
    label: 'Summary present',
    ok: hasText(resume.summary),
    detail: hasText(resume.summary) ? 'Summary is ready for ATS parsing.' : 'Add a short summary at the top.',
  });

  checks.push({
    label: 'Core contact fields',
    ok: hasText(resume.personalInfo.fullName) && hasText(resume.personalInfo.email),
    detail: hasText(resume.personalInfo.fullName) && hasText(resume.personalInfo.email)
      ? 'Name and email are available.'
      : 'Make sure name and email are filled in.',
  });

  const experienceBulletCount = resume.experience.reduce((count, entry) => count + normalizeBullets(entry.bullets).length, 0);
  checks.push({
    label: 'Experience detail',
    ok: experienceBulletCount > 0,
    detail: experienceBulletCount > 0 ? 'Experience bullets will render cleanly.' : 'Add at least one experience bullet.',
  });

  return checks;
}
