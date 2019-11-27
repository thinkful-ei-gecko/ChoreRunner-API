CREATE TABLE "members"(
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "username" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "user_id" INTEGER REFERENCES "users"(id),
  "household_id" INTEGER REFERENCES "households"(id)
);