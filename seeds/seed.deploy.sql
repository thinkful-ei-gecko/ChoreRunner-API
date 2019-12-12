BEGIN;

TRUNCATE
  "tasks",
  "levels_members",
  "levels",
  "members",
  "households",
  "users";

--Sign into Marge's account
INSERT INTO "users"("id", "username", "password", "name")
VALUES
  (
    1,
    'margeincharge',
    --pass
    '$2a$12$5CDxmf52iovOcAO9MVciv.6Wo7nId1olc4LOSURaKTnDvXLimQbkS',
    'Marge'
  );

INSERT INTO "households"("id", "name", "user_id")
VALUES
  (1, 'Simpson', 1),
  (2, 'Hill', 1),

--For the Simpson family, approve Lisa's tasks and reassign Bart's tasks.
INSERT INTO "members"("id", "name", "username", "password", "user_id", "household_id", "total_score")
VALUES
  --All passwords set to pass.
  (1, 'Bart', 'bartman', '$2a$12$5CDxmf52iovOcAO9MVciv.6Wo7nId1olc4LOSURaKTnDvXLimQbkS', 1, 1, 0),
  (2, 'Lisa', 'bleedinggums', '$2a$12$5CDxmf52iovOcAO9MVciv.6Wo7nId1olc4LOSURaKTnDvXLimQbkS', 1, 1, 60),
  (3, 'Maggie', 'binky', '$2a$12$5CDxmf52iovOcAO9MVciv.6Wo7nId1olc4LOSURaKTnDvXLimQbkS', 1, 2, 20),
  (4, 'Homer', 'simpsoneh', '$2a$12$5CDxmf52iovOcAO9MVciv.6Wo7nId1olc4LOSURaKTnDvXLimQbkS', 1, 2, 10);

INSERT INTO "tasks"("id", "title", "household_id", "user_id", "member_id", "points", "status")
VALUES
---Bart tasks
  (1, 'Walk the pig', 1, 1, 1, 5, 'completed'),
  (2, 'Water tomacco plants', 1, 1, 1, 5, 'completed'),
  (3, 'Bleach Homer''s pink shirts', 1, 1, 1, 10, 'completed'),
---Lisa tasks
  (4, 'Feed Snowball II', 1, 1, 2, 5, 'approved'),
  (5, 'Bury Snowball I', 1, 1, 2, 5, 'approved'),
  (5, 'Take ', 1, 1, 2, 10, 'approved');

INSERT INTO "levels"("id", "badge")
VALUES
  (1, 'Badge1'),
  (2, 'Badge2'),
  (3, 'Badge3'),
  (4, 'Badge4'),
  (5, 'Badge5'),
  (6, 'Badge6'),
  (7, 'Badge7'),
  (8, 'Badge8'),
  (9, 'Badge9'),
  (10, 'Badge10');

  --update the sequence
SELECT setval('tasks_id_seq', (SELECT MAX(id) from "tasks"));
SELECT setval('members_id_seq', (SELECT MAX(id) from "members"));
SELECT setval('households_id_seq', (SELECT MAX(id) from "households"));
SELECT setval('users_id_seq', (SELECT MAX(id) from "users"));
SELECT setval('levels_id_seq', (SELECT MAX(id) from "levels"));


COMMIT;

-- run script: psql -U dunder_mifflin -d chorerunner -f ./seeds/seed.tables.sql