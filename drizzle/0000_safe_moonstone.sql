CREATE TABLE IF NOT EXISTS "dropdown_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"option_value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"project_id" serial PRIMARY KEY NOT NULL,
	"project_name" text NOT NULL,
	"project_description" text NOT NULL,
	"year_of_submission" integer NOT NULL,
	"project_type" text NOT NULL,
	"department" text NOT NULL,
	"domain" text NOT NULL,
	"custom_domain" text,
	"project_link" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by_uid" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team_members" (
	"member_id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" text NOT NULL,
	"linkedin" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"uid" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_uid_users_uid_fk" FOREIGN KEY ("created_by_uid") REFERENCES "users"("uid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_members" ADD CONSTRAINT "team_members_project_id_projects_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
