import { InferSelectModel } from "drizzle-orm";
import { projects } from "@/lib/db/schema";
import { getAllProjects, getFilterData } from "@/server-action/project";
import ProjectsWrapper from "@/components/repeto/ProjectsWrapper";

export const dynamic = 'force-dynamic';

type DbProject = InferSelectModel<typeof projects>;

export default async function Home() {
  try {
    const [projectsResult, filtersResult] = await Promise.all([
      getAllProjects(),
      getFilterData()
    ]);

    const projects: DbProject[] = projectsResult.success && projectsResult.data ? projectsResult.data as DbProject[] : [];
    const filters = filtersResult || [];

    return <ProjectsWrapper initialProjects={projects} initialFilters={filters} />;
  } catch (error) {
    console.error('Error loading data:', error);
    return <div>Error loading data. Please try again later.</div>;
  }
}
