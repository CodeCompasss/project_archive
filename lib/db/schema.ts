import { pgTable, serial, text, boolean, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  uid: serial('uid').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  is_admin: boolean('is_admin').default(false).notNull(),
});

export const projects = pgTable('projects', {
  project_id: serial('project_id').primaryKey(),
  project_name: text('project_name').notNull(),
  project_description: text('project_description').notNull(),
  year_of_submission: integer('year_of_submission').notNull(),
  project_type: text('project_type').notNull(),
  department: text('department').notNull(),
  domain: text('domain').notNull(),
  custom_domain: text('custom_domain'),
  project_link: text('project_link').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  created_by_uid: integer('created_by_uid').references(() => users.uid).notNull(),
});

export const team_members = pgTable('team_members', {
  member_id: serial('member_id').primaryKey(),
  project_id: integer('project_id').references(() => projects.project_id).notNull(),
  name: text('name').notNull(),
  linkedin: text('linkedin').notNull(),
});

export const dropdown_options = pgTable('dropdown_options', {
  id: serial('id').primaryKey(),
  category: text('category').notNull(),
  option_value: text('option_value').notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  creator: one(users, {
    fields: [projects.created_by_uid],
    references: [users.uid],
  }),
  teamMembers: many(team_members),
}));

export const teamMembersRelations = relations(team_members, ({ one }) => ({
  project: one(projects, {
    fields: [team_members.project_id],
    references: [projects.project_id],
  }),
})); 