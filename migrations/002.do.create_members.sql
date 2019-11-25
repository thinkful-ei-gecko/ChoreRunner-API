CREATE TABLE "members"(
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "parent" INTEGER REFERENCES "users"(id)
);