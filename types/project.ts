// types/project.ts
export interface TeamMember {
  member_id: number;
  project_id: number;
  name: string;
  linkedin: string;
}

export interface Project {
  project_id: number;
  projectName: string;
  projectDescription: string;
  yearOfSubmission: string;
  projectType: string;
  department: string;
  domain: string;
  customDomain?: string;
  projectLink: string;
  createdAt: string;
  created_by_uid: number;
  teamMembers?: TeamMember[];
}