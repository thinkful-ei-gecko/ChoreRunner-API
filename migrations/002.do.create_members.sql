CREATE TABLE "members"(
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "users_id" INTEGER REFERENCES "users"(id),
  "household_id" INTEGER REFERENCES "households"(id)
);