CREATE TABLE "api_key" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"hashed_key" text NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "api_key_hashed_key_unique" UNIQUE("hashed_key")
);
--> statement-breakpoint
CREATE TABLE "public_key" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"key" text NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "public_key_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "app" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp,
	CONSTRAINT "app_org_name_unique" UNIQUE("organization_id","name")
);
--> statement-breakpoint
ALTER TABLE "app" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "app_feature_flag_connection" (
	"app_id" uuid NOT NULL,
	"feature_flag_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "app_feature_flag_connection_app_id_feature_flag_id_organization_id_pk" PRIMARY KEY("app_id","feature_flag_id","organization_id")
);
--> statement-breakpoint
ALTER TABLE "app_feature_flag_connection" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "app_user_segment_connection" (
	"app_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_segment_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "app_user_segment_connection_app_id_organization_id_user_segment_id_pk" PRIMARY KEY("app_id","organization_id","user_segment_id")
);
--> statement-breakpoint
ALTER TABLE "app_user_segment_connection" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "environment" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp,
	CONSTRAINT "environment_org_name_unique" UNIQUE("organization_id","name")
);
--> statement-breakpoint
ALTER TABLE "environment" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "feature_flag" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"default_value" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp,
	CONSTRAINT "feature_flag_org_name_unique" UNIQUE("organization_id","name")
);
--> statement-breakpoint
ALTER TABLE "feature_flag" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "feature_flag_value" (
	"organization_id" uuid NOT NULL,
	"feature_flag_id" uuid NOT NULL,
	"environment_id" uuid NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "feature_flag_value_organization_id_feature_flag_id_environment_id_pk" PRIMARY KEY("organization_id","feature_flag_id","environment_id")
);
--> statement-breakpoint
ALTER TABLE "feature_flag_value" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_segment" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp,
	CONSTRAINT "user_segment_org_name_unique" UNIQUE("organization_id","name")
);
--> statement-breakpoint
ALTER TABLE "user_segment" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "account" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"inviter_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"active_organization_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" uuid PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "api_key" ADD CONSTRAINT "api_key_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_key" ADD CONSTRAINT "public_key_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app" ADD CONSTRAINT "app_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_feature_flag_connection" ADD CONSTRAINT "app_feature_flag_connection_app_id_app_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."app"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_feature_flag_connection" ADD CONSTRAINT "app_feature_flag_connection_feature_flag_id_feature_flag_id_fk" FOREIGN KEY ("feature_flag_id") REFERENCES "public"."feature_flag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_feature_flag_connection" ADD CONSTRAINT "app_feature_flag_connection_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_user_segment_connection" ADD CONSTRAINT "app_user_segment_connection_app_id_app_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."app"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_user_segment_connection" ADD CONSTRAINT "app_user_segment_connection_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_user_segment_connection" ADD CONSTRAINT "app_user_segment_connection_user_segment_id_user_segment_id_fk" FOREIGN KEY ("user_segment_id") REFERENCES "public"."user_segment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "environment" ADD CONSTRAINT "environment_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flag" ADD CONSTRAINT "feature_flag_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flag_value" ADD CONSTRAINT "feature_flag_value_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flag_value" ADD CONSTRAINT "feature_flag_value_feature_flag_id_feature_flag_id_fk" FOREIGN KEY ("feature_flag_id") REFERENCES "public"."feature_flag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flag_value" ADD CONSTRAINT "feature_flag_value_environment_id_environment_id_fk" FOREIGN KEY ("environment_id") REFERENCES "public"."environment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_segment" ADD CONSTRAINT "user_segment_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "app_organization_isolation" ON "app" AS PERMISSIVE FOR ALL TO public USING (organization_id = current_setting('app.current_organization_id', true)::uuid) WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "app_feature_flag_connection_organization_isolation" ON "app_feature_flag_connection" AS PERMISSIVE FOR ALL TO public USING (organization_id = current_setting('app.current_organization_id', true)::uuid) WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "app_user_segment_connection_organization_isolation" ON "app_user_segment_connection" AS PERMISSIVE FOR ALL TO public USING (organization_id = current_setting('app.current_organization_id', true)::uuid) WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "environment_organization_isolation" ON "environment" AS PERMISSIVE FOR ALL TO public USING (organization_id = current_setting('app.current_organization_id', true)::uuid) WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "feature_flag_organization_isolation" ON "feature_flag" AS PERMISSIVE FOR ALL TO public USING (organization_id = current_setting('app.current_organization_id', true)::uuid) WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "feature_flag_value_organization_isolation" ON "feature_flag_value" AS PERMISSIVE FOR ALL TO public USING (organization_id = current_setting('app.current_organization_id', true)::uuid) WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "user_segment_organization_isolation" ON "user_segment" AS PERMISSIVE FOR ALL TO public USING (organization_id = current_setting('app.current_organization_id', true)::uuid) WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);--> statement-breakpoint

ALTER TABLE "app" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "app_feature_flag_connection" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "app_user_segment_connection" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "environment" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "feature_flag" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "feature_flag_value" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_segment" FORCE ROW LEVEL SECURITY;