BEGIN;

TRUNCATE
  "tasks",
  "households",
  "members",
  "users";

INSERT INTO "users"("id", "username", "password", "name")
VALUES
  (
    1,
    'admin',
    --pass
    '$2a$12$5CDxmf52iovOcAO9MVciv.6Wo7nId1olc4LOSURaKTnDvXLimQbkS',
    'dunder'
  );

  --update the sequence
      SELECT setval('tasks_id_seq', (SELECT MAX(id) from "tasks"));
    SELECT setval('households_id_seq', (SELECT MAX(id) from "households"));
        SELECT setval('members_id_seq', (SELECT MAX(id) from "members"));
  SELECT setval('users_id_seq', (SELECT MAX(id) from "users"));


COMMIT;