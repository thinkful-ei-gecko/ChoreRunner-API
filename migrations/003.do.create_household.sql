CREATE TABLE "households" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "house_code" TEXT NOT NULL UNIQUE,
  "owner_id" INTEGER references "users"(id)
    ON DELETE CASCADE NOT NULL,
  "member_id" INTEGER REFERENCES "members"(id)
);