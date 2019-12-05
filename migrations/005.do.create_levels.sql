DROP TABLE IF EXISTS "levels";
DROP TABLE IF EXISTS "levels_members";

CREATE TABLE "levels" (
  "id" SERIAL PRIMARY KEY,
  "badge" TEXT NOT NULL
);


CREATE TABLE "levels_members" (
  "id" INTEGER PRIMARY KEY,
  "member_id" INTEGER REFERENCES "members"(id) ON DELETE CASCADE NOT NULL,
  "level_id" INTEGER REFERENCES "levels"(id) ON DELETE CASCADE NOT NULL
);