CREATE TABLE "tasks" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "household_id" INTEGER REFERENCES "households"(id),
  "user_id" INTEGER REFERENCES "users"(id),
  "member_id" INTEGER REFERENCES "members"(id),
  "points" SMALLINT NOT NULL 
);
