CREATE TABLE "tasks" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "household_id" INTEGER REFERENCES "households"(id),
  "creator" INTEGER REFERENCES "users"(id),
  "assigned" INTEGER REFERENCES "members"(id),
  "points" SMALLINT NOT NULL 
);
