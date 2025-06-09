'use server';

import { getDb, DB } from '@/lib/db';
import { projects, users, team_members } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

type DbInstance = ReturnType<typeof getDb>;

export async function getFilterData() {
  const db: DbInstance = getDb();
  try {
    const allProjects = await db.query.projects.findMany();
    return [
      {
        title: "Year of Submission",
        options: [...new Set(allProjects.map((p: typeof projects.$inferSelect) => p.year_of_submission.toString()))]
      },
      {
        title: "Project Type",
        options: [...new Set(allProjects.map((p: typeof projects.$inferSelect) => p.project_type))]
      },
      {
        title: "Department",
        options: [...new Set(allProjects.map((p: typeof projects.$inferSelect) => p.department))]
      },
      {
        title: "Domain",
        options: [...new Set(allProjects.map((p: typeof projects.$inferSelect) => p.domain))]
      }
    ];
  } catch (error) {
    console.error('Error getting filter data:', error);
    return [];
  }
}

export async function deleteProject(projectId: number, userId: number) {
  const db: DbInstance = getDb();
  try {
    // Check if user is admin
    const user = await db.query.users.findFirst({
      where: eq(users.uid, userId),
    });

    if (!user?.is_admin) {
      throw new Error('Unauthorized: Only admins can delete projects');
    }

    // Delete team members first (due to foreign key constraint)
    await db.delete(team_members).where(eq(team_members.project_id, projectId));
    
    // Delete the project
    await db.delete(projects).where(eq(projects.project_id, projectId));
    revalidatePath('/projects');
    return { success: true };
  } catch (error) {
    console.error('Error deleting project:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function updateProject(
  projectId: number,
  userId: number,
  data: {
    project_name?: string;
    project_description?: string;
    year_of_submission?: number;
    project_type?: string;
    department?: string;
    domain?: string;
    custom_domain?: string | null;
    project_link?: string;
  }
) {
  const db: DbInstance = getDb();
  try {
    // Check if user is admin
    const user = await db.query.users.findFirst({
      where: eq(users.uid, userId),
    });

    if (!user?.is_admin) {
      throw new Error('Unauthorized: Only admins can update projects');
    }

    // Update the project
    await db
      .update(projects)
      .set(data)
      .where(eq(projects.project_id, projectId));

    revalidatePath('/projects');
    return { success: true };
  } catch (error) {
    console.error('Error updating project:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getProject(projectId: number) {
  const db: DbInstance = getDb();
  try {
    // Get project with team members using relations
    const project = await db.query.projects.findFirst({
      where: eq(projects.project_id, projectId),
      with: {
        teamMembers: true
      }
    });

    return { success: true, data: project };
  } catch (error) {
    console.error('Error fetching project:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getAllProjects() {
  const db: DbInstance = getDb();
  try {
    // Fetch projects with their team members using the relations
    const allProjects = await db.query.projects.findMany({
      with: {
        teamMembers: true
      }
    });
    
    return { 
      success: true, 
      data: allProjects.map((p: typeof projects.$inferSelect & { created_at: Date; teamMembers: any[] }) => ({
        ...p,
        createdAt: p.created_at.toString(),
        yearOfSubmission: p.year_of_submission.toString(),
        projectType: p.project_type,
        projectLink: p.project_link,
        customDomain: p.custom_domain || "",
        projectName: p.project_name,
        projectDescription: p.project_description,
        teamMembers: p.teamMembers || [] // Include team members
      }))
    };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function createProject(data: {
  projectName: string;
  projectDescription: string;
  yearOfSubmission: string;
  projectType: string;
  department: string;
  domain: string;
  customDomain?: string;
  projectLink: string;
  members: { name: string; linkedin: string }[];
  userId: number;
}) {
  const db: DbInstance = getDb();
  try {
    console.log('createProject function received userId:', data.userId);
    // Check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.uid, data.userId),
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Insert the project
    const [newProject] = await db.insert(projects).values({
      project_name: data.projectName,
      project_description: data.projectDescription,
      year_of_submission: parseInt(data.yearOfSubmission),
      project_type: data.projectType,
      department: data.department || 'Not Specified',
      domain: data.domain,
      custom_domain: data.customDomain || null,
      project_link: data.projectLink,
      created_at: new Date(),
      created_by_uid: user.uid,
    }).returning();

    // Insert team members
    for (const member of data.members) {
      await db.insert(team_members).values({
        project_id: newProject.project_id,
        name: member.name,
        linkedin: member.linkedin,
      });
    }

    revalidatePath('/projects');
    return { success: true, data: newProject };
  } catch (error) {
    console.error('Error creating project:', error);
    return { success: false, error: (error as Error).message };
  }
}