/**
 * Types for the resume-master v1.3.0 projection returned by POST /v1/resume.
 * exhibitSlug is not part of this surface — the service strips it.
 */

/** ISO-8601 calendar date (YYYY-MM-DD) or timestamp accepted as cutOffDate. */
export type IsoDate = string;

/**
 * resume-master API client whose policy filtered the projection.
 * The portfolio website uses the portfolio API key.
 */
export type ClientId = string;

/** Slice selector sent as `mode`. Accepted values are defined by the service. */
export type SliceMode = string;

export interface GetResumeOptions {
  projectIds?: string[];
  workIds?: string[];
  keywords?: string[];
  mode?: SliceMode;
  cutOffDate?: IsoDate;
}

export interface ResumeBasics {
  name?: string;
  label?: string;
  image?: string;
  email?: string;
  phone?: string;
  url?: string;
  summary?: string;
  location?: {
    address?: string;
    postalCode?: string;
    city?: string;
    countryCode?: string;
    region?: string;
  };
  profiles?: Array<{
    network?: string;
    username?: string;
    url?: string;
  }>;
}

export interface WorkEntry {
  id: string;
  name?: string;
  position?: string;
  url?: string;
  startDate?: IsoDate;
  endDate?: IsoDate;
  summary?: string;
  highlights?: string[];
  location?: string;
  description?: string;
}

export interface ProjectEntry {
  id: string;
  name: string;
  description?: string;
  highlights?: string[];
  keywords?: string[];
  url?: string;
  roles?: string[];
  entity?: string;
  type?: string;
  startDate?: IsoDate;
  endDate?: IsoDate;
  challenge?: string;
  approach?: string;
  impact?: string;
}

export interface ReferenceEntry {
  name: string;
  reference: string;
  title?: string;
  snippets?: string[];
  /** Matches `work[].id` (for example "ks2-technologies" or "redspace"). */
  workId?: string;
}

export interface SkillEntry {
  name?: string;
  level?: string;
  keywords?: string[];
}

export interface EducationEntry {
  institution?: string;
  url?: string;
  area?: string;
  studyType?: string;
  startDate?: IsoDate;
  endDate?: IsoDate;
  score?: string;
  courses?: string[];
}

export interface InterestEntry {
  name?: string;
  keywords?: string[];
}

export interface ProjectionMeta {
  clientId?: ClientId;
  mode?: SliceMode;
  cutOffDate?: IsoDate;
  generatedAt?: string;
  version?: string;
}

export interface ProjectedResume {
  basics?: ResumeBasics;
  work?: WorkEntry[];
  education?: EducationEntry[];
  skills?: SkillEntry[];
  interests?: InterestEntry[];
  references?: ReferenceEntry[];
  projects?: ProjectEntry[];
  meta?: ProjectionMeta;
}

export const DEFAULT_RESUME_SERVICE_URL: "https://resume-master-nu.vercel.app";

export function getResume(
  apiKey: string,
  options?: GetResumeOptions,
  baseUrl?: string,
): Promise<ProjectedResume>;
