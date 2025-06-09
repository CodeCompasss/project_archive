"use client";

import ProjectCard from "./ProjectCard";
import { projects } from "@/lib/db/schema";
import { InferSelectModel } from "drizzle-orm";

type DbProject = InferSelectModel<typeof projects>;

interface ProjectWithMembers extends DbProject {
  projectName: string;
  projectDescription: string;
  yearOfSubmission: string;
  projectType: string;
  domain: string;
  customDomain: string | undefined;
  projectLink: string;
  createdAt: string;
  teamMembers?: {
    member_id: number;
    project_id: number;
    name: string;
    linkedin: string;
  }[];
}

interface ProjectGridProps {
  projects: DbProject[];
  activeTab: string;
  filters: Record<string, string[]>;
}

const ProjectGrid = ({ projects: initialProjects, activeTab, filters }: ProjectGridProps) => {
  let filteredProjects = initialProjects.map(project => ({
    ...project,
    projectName: project.project_name,
    projectDescription: project.project_description,
    yearOfSubmission: project.year_of_submission.toString(),
    projectType: project.project_type,
    domain: project.domain,
    customDomain: project.custom_domain,
    projectLink: project.project_link,
    createdAt: project.created_at.toISOString(),
  })) as ProjectWithMembers[];

  // Apply Tab Filters
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  switch (activeTab) {
    case "All":
      break;

    case "Latest":
      filteredProjects = filteredProjects
        .filter((p) => new Date(p.created_at) >= oneMonthAgo)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      break;

    case "Oldest":
      filteredProjects = filteredProjects.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      break;

    case "This Week":
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filteredProjects = filteredProjects.filter(
        (p) => new Date(p.created_at) >= oneWeekAgo
      );
      break;
  }

  // Apply Filters
  if (Object.keys(filters).length > 0) {
    Object.entries(filters).forEach(([key, values]) => {
      if (values.length > 0) {
        if (key === "Domain") {
          filteredProjects = filteredProjects.filter((p) =>
            values.includes(p.domain) || values.includes("Others")
          );
        } else if (key === "Department") {
          filteredProjects = filteredProjects.filter((p) =>
            values.includes(p.department)
          );
        } else if (key === "Year of Submission") {
          filteredProjects = filteredProjects.filter((p) =>
            values.includes(p.yearOfSubmission)
          );
        } else if (key === "Project Type") {
          filteredProjects = filteredProjects.filter((p) =>
            values.includes(p.projectType)
          );
        }
      }
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6 animate-fadeIn">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project, index) => (
            <div
              key={index}
              className="opacity-0 animate-slideUp"
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
            >
              <ProjectCard project={project} />
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No projects available.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectGrid;
