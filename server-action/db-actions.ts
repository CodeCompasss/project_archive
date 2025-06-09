'use server';

import { getDb } from '@/lib/db';
import { projects, users, dropdown_options, team_members } from '@/lib/db/schema';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { Project, Member } from '@/app/admin/ManageProjects/page'; // Importing Project and Member interfaces

// --- Project Actions ---

export async function getProjects(
  year?: number,
  projectType?: string,
  department?: string,
  domain?: string,
  sort?: "all" | "latest" | "oldest" | "this_week"
) {
  const db = getDb();
  try {
    const conditions = [];

    if (year) {
      conditions.push(eq(projects.year_of_submission, year));
    }
    if (projectType) {
      conditions.push(eq(projects.project_type, projectType));
    }
    if (department) {
      conditions.push(eq(projects.department, department));
    }
    if (domain) {
      conditions.push(eq(projects.domain, domain));
    }

    let orderByClause: any[] = [];
    if (sort === "latest") {
      orderByClause.push(desc(projects.created_at));
    } else if (sort === "oldest") {
      orderByClause.push(asc(projects.created_at));
    } else if (sort === "this_week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      conditions.push(sql`${projects.created_at} >= ${oneWeekAgo.toISOString()}`);
      orderByClause.push(desc(projects.created_at));
    }

    const result = await db.query.projects.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: orderByClause.length > 0 ? orderByClause : undefined,
      with: {
        teamMembers: true,
      },
    });
    return result.map((p) => ({
      id: p.project_id,
      title: p.project_name,
      description: p.project_description,
      year: p.year_of_submission,
      domain: p.domain,
      type: p.project_type,
      department: p.department,
      liveLink: p.project_link,
      teamMembers: p.teamMembers || [],
    }));
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new Error('Failed to fetch projects.');
  }
}

export async function addProject(formData: Omit<Project, 'id'>) {
  const db = getDb();
  try {
    const { teamMembers, ...projectData } = formData;
    const [newProject] = await db.insert(projects).values({
      project_name: projectData.title,
      project_description: projectData.description,
      year_of_submission: projectData.year,
      project_type: projectData.type,
      department: projectData.department,
      domain: projectData.domain,
      project_link: projectData.liveLink,
      created_by_uid: 1, // Placeholder: Replace with actual user ID from authentication
    }).returning({ project_id: projects.project_id });

    if (newProject.project_id && teamMembers && teamMembers.length > 0) {
      for (const member of teamMembers) {
        await db.insert(team_members).values({
          project_id: newProject.project_id,
          name: member.name,
          linkedin: member.linkedin,
        });
      }
    }
    return { success: true, message: 'Project added successfully!' };
  } catch (error) {
    console.error('Error adding project:', error);
    throw new Error('Failed to add project.');
  }
}

export async function getProjectById(id: number) {
  const db = getDb();
  try {
    const result = await db.query.projects.findFirst({
      where: eq(projects.project_id, id),
      with: {
        teamMembers: true,
      },
    });
    if (result) {
      return {
        id: result.project_id,
        title: result.project_name,
        description: result.project_description,
        year: result.year_of_submission,
        domain: result.domain,
        type: result.project_type,
        department: result.department,
        liveLink: result.project_link,
        teamMembers: result.teamMembers || [],
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching project with ID ${id}:`, error);
    throw new Error(`Failed to fetch project with ID ${id}.`);
  }
}

export async function updateProject(id: number, formData: Omit<Project, 'id' | 'teamMembers'>) {
  const db = getDb();
  try {
    await db
      .update(projects)
      .set({
        project_name: formData.title,
        project_description: formData.description,
        year_of_submission: formData.year,
        project_type: formData.type,
        department: formData.department,
        domain: formData.domain,
        project_link: formData.liveLink,
      })
      .where(eq(projects.project_id, id));

    return { success: true, message: 'Project updated successfully!' };
  } catch (error) {
    console.error(`Error updating project with ID ${id}:`, error);
    throw new Error(`Failed to update project with ID ${id}.`);
  }
}

export async function deleteProject(id: number) {
  const db = getDb();
  try {
    // Delete associated team members first due to foreign key constraints
    await db.delete(team_members).where(eq(team_members.project_id, id));
    await db.delete(projects).where(eq(projects.project_id, id));
    return { success: true, message: `Project with ID: ${id} deleted successfully.` };
  } catch (error) {
    console.error(`Error deleting project with ID ${id}:`, error);
    throw new Error(`Failed to delete project with ID ${id}.`);
  }
}

// --- Team Member Actions ---

export async function addTeamMember(projectId: number, name: string, linkedin: string) {
  const db = getDb();
  try {
    await db.insert(team_members).values({
      project_id: projectId,
      name: name,
      linkedin: linkedin,
    });
    return { success: true, message: 'Team member added successfully!' };
  } catch (error) {
    console.error('Error adding team member:', error);
    throw new Error('Failed to add team member.');
  }
}

export async function updateTeamMember(memberId: number, name: string, linkedin: string) {
  const db = getDb();
  try {
    await db.update(team_members).set({ name: name, linkedin: linkedin }).where(eq(team_members.member_id, memberId));
    return { success: true, message: 'Team member updated successfully!' };
  } catch (error) {
    console.error('Error updating team member:', error);
    throw new Error('Failed to update team member.');
  }
}

export async function deleteTeamMember(memberId: number) {
  const db = getDb();
  try {
    await db.delete(team_members).where(eq(team_members.member_id, memberId));
    return { success: true, message: 'Team member deleted successfully!' };
  } catch (error) {
    console.error('Error deleting team member:', error);
    throw new Error('Failed to delete team member.');
  }
}

export async function getUserIdByEmail(email: string) {
  const db = getDb();
  try {
    console.log(`Attempting to get userId for email: ${email}`);
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    console.log(`Found user for email ${email}:`, user ? user.uid : 'Not found');
    return user ? user.uid : null;
  } catch (error) {
    console.error(`Error fetching user ID for email ${email}:`, error);
    throw new Error(`Failed to fetch user ID for email ${email}.`);
  }
}

export async function getUniqueYears() {
  const db = getDb();
  try {
    const result = await db.selectDistinct({ year: projects.year_of_submission }).from(projects);
    return result.map(row => row.year);
  } catch (error) {
    console.error('Error fetching unique years:', error);
    throw new Error('Failed to fetch unique years.');
  }
}

export async function getUniqueProjectTypes() {
  const db = getDb();
  try {
    const result = await db.selectDistinct({ type: projects.project_type }).from(projects);
    return result.map(row => row.type);
  } catch (error) {
    console.error('Error fetching unique project types:', error);
    throw new Error('Failed to fetch unique project types.');
  }
}

export async function getUniqueDepartments() {
  const db = getDb();
  try {
    const result = await db.selectDistinct({ department: projects.department }).from(projects);
    return result.map(row => row.department);
  } catch (error) {
    console.error('Error fetching unique departments:', error);
    throw new Error('Failed to fetch unique departments.');
  }
}

export async function getUniqueDomains() {
  const db = getDb();
  try {
    const result = await db.selectDistinct({ domain: projects.domain }).from(projects);
    return result.map(row => row.domain);
  } catch (error) {
    console.error('Error fetching unique domains:', error);
    throw new Error('Failed to fetch unique domains.');
  }
}

export async function getUserProjectsCount(userId: string) {
  const db = getDb();
  try {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
      console.error('Invalid userId provided to getUserProjectsCount:', userId);
      return 0;
    }
    const result = await db.select({ count: sql<number>`count(*)` }).from(projects).where(eq(projects.created_by_uid, numericUserId));
    return result[0]?.count || 0;
  } catch (error) {
    console.error('Error fetching user projects count:', error);
    throw new Error('Failed to fetch user projects count.');
  }
}

export async function addDropdownOption(category: string, optionValue: string) {
  const db = getDb();
  try {
    const [newOption] = await db.insert(dropdown_options).values({
      category: category,
      option_value: optionValue,
    }).returning();
    return { success: true, data: newOption };
  } catch (error) {
    console.error('Error adding dropdown option:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteDropdownOption(category: string, optionValue: string) {
  const db = getDb();
  try {
    const deletedRows = await db.delete(dropdown_options)
      .where(and(eq(dropdown_options.category, category), eq(dropdown_options.option_value, optionValue)))
      .returning({ id: dropdown_options.id }); // Return the ID of deleted rows

    if (deletedRows.length === 0) {
      return { success: false, error: "Option not found or already deleted." };
    }
    return { success: true, message: "Dropdown option deleted successfully!" };
  } catch (error) {
    console.error('Error deleting dropdown option:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getDropdownOptions(category: string) {
  const db = getDb();
  try {
    if (category === "all") {
      const allOptions = await db.query.dropdown_options.findMany();
      return allOptions.map(option => ({
        id: option.id,
        category: option.category,
        option_value: option.option_value
      }));
    } else {
      const options = await db.query.dropdown_options.findMany({
        where: eq(dropdown_options.category, category),
      });
      return options.map(option => ({
        id: option.id,
        category: option.category,
        option_value: option.option_value
      }));
    }
  } catch (error) {
    console.error(`Error fetching dropdown options for category ${category}:`, error);
    throw new Error(`Failed to fetch dropdown options for category ${category}.`);
  }
}

// --- Dropdown Options Actions ---
// ... existing code ...
