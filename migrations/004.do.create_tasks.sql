CREATE TABLE "tasks" (
  "id" SERIAL PRIMARY KEY,
  "household_id" INTEGER REFERENCES "households"(id),
  "creator" INTEGER REFERENCES "users"(id),
  "assigned" INTEGER REFERENCES "members"(id)
);