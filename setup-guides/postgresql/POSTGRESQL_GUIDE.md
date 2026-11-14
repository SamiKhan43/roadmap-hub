# PostgreSQL Setup Guide

This guide explains how to set up PostgreSQL for a project, connect to it from VS Code or `psql`, configure an application, inspect its schema and data, and make and restore backups. The examples use replaceable project names so the same process works for different applications and stacks.

## 1. Understand the connection

PostgreSQL is a database server. An application or database client connects to a server and selects a database using these settings:

| Setting | What it means | Example for a local project |
|---|---|---|
| Host | Address of the PostgreSQL server | `localhost` from your computer; a Compose service name from another container |
| Port | PostgreSQL's listening port | `5432` |
| Database | The database your project uses | `myapp_dev` |
| Username | The database role used to connect | `myapp_user` |
| Password | The role's secret credential | Stored locally, never committed |

A PostgreSQL server can contain multiple databases, and a database can contain many schemas and tables. Use a separate database for each project or environment when you need their data and migrations isolated.

## 2. Choose how to run PostgreSQL

For local development, PostgreSQL can run directly on your computer or in Docker. Docker is useful when you want a consistent PostgreSQL version without installing the server on your host. Give each project its own database and application role. When projects need separate PostgreSQL versions or settings, give them separate Compose projects and volumes too.

### Start a local container with Docker

Choose unique container, database, and volume names for your project. This starts PostgreSQL with an administrator role; you will create a separate application role in section 6. Replace the example password with a strong local-only value. Do not reuse these example credentials outside a disposable local environment.

```bash
docker volume create myapp_postgres_data

docker run --name myapp-postgres \
  -e POSTGRES_DB=myapp_dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD='replace-with-a-local-password' \
  -p 5432:5432 \
  -v myapp_postgres_data:/var/lib/postgresql/data \
  -d postgres:16
```

The official image creates the database and role when it initializes a new data directory. Changing `POSTGRES_DB`, `POSTGRES_USER`, or `POSTGRES_PASSWORD` later does not rewrite an existing database or role in a volume. Change database credentials with SQL and update your application's secret configuration.

If port `5432` is already in use, publish another host port, for example `-p 5433:5432`, and use port `5433` when connecting from your computer. The PostgreSQL port inside the container remains `5432`.

### Use Docker Compose for a project

For repeatable project setup, add a Compose file to the project. This example reads local settings from a `.env` file and stores the database data in a named volume. `POSTGRES_USER` is the database administrator created by the official image, not the user your application should use.

Create `.env` in the project root:

```dotenv
POSTGRES_DB=myapp_dev
POSTGRES_USER=postgres
POSTGRES_PASSWORD=replace-with-a-local-password
POSTGRES_PORT=5432
DATABASE_USER=myapp_user
DATABASE_PASSWORD=replace-with-a-different-local-password
```

Create `compose.yaml`:

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: ${POSTGRES_DB:?Set POSTGRES_DB in .env}
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD in .env}
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \"$${POSTGRES_USER}\" -d \"$${POSTGRES_DB}\""]
      interval: 5s
      timeout: 5s
      retries: 10

volumes:
  postgres_data:
```

Add `.env` to `.gitignore`. You may commit a `.env.example` containing non-secret setting names and safe placeholders so other developers know what to configure. Never commit a real password.

Start and inspect the service:

```bash
docker compose up -d
docker compose ps
docker compose logs --tail 50 db
```

Stop the service without deleting its data:

```bash
docker compose down
```

The named volume keeps database files when the container is recreated. `docker compose down -v` removes the volume and permanently deletes its database data; only use it when you intentionally want a clean reset.

### Know which host name to use

The connection host depends on where the client runs:

| Client location | Host | Port |
|---|---|---|
| VS Code, `psql`, or application running on your computer | `localhost` | The published host port, usually `5432` |
| Another service in the same Compose project | The Compose service name, such as `db` | `5432` |

`localhost` inside an application container refers to that container, not the database container. From a different Compose project, the services need a shared Docker network or another reachable database address.

## 3. Connect from VS Code

VS Code does not include a PostgreSQL client by default. You can use a PostgreSQL extension such as SQLTools with its PostgreSQL driver, or another maintained database extension.

1. Install the database extension and its PostgreSQL driver if it needs one.
2. Create a connection for your project.
3. Enter the host, port, database, username, and password from your local configuration.
4. Save the password in the extension's secret storage or enter it when prompted. Avoid storing it in a committed workspace settings file.
5. Connect, expand the database and schema, and open a query editor.

For a local Docker database, use `localhost` and the published host port. Use the same database, user, and password configured for the project.

## 4. Connect with psql

`psql` is PostgreSQL's interactive command-line client. You can install it on your computer or run it from the official PostgreSQL container.

### Run psql from the database container

For Docker Compose, connect as the administrator to the project database:

```bash
docker compose exec db psql -U postgres -d myapp_dev
```

For a standalone container, substitute the container name:

```bash
docker exec -it myapp-postgres psql -U postgres -d myapp_dev
```

Replace the example service/container and database names with the values for your project. The commands above connect as the administrator; use the application role after creating it in section 6. Once connected, these psql commands are useful:

| Command | Purpose |
|---|---|
| `\l` | List databases |
| `\du` | List roles |
| `\c myapp_dev` | Connect to a database |
| `\dn` | List schemas |
| `\dt` | List tables in the current schema |
| `\dt *.*` | List tables in all schemas |
| `\d table_name` | Describe a table |
| `\conninfo` | Show connection details |
| `\?` | List psql commands |
| `\q` | Exit psql |

If `psql` is installed on your computer, connect with:

```bash
psql -h localhost -p 5432 -U myapp_user -d myapp_dev
```

The client prompts for the password. Avoid putting a password directly in a shell command, because command history or process information may expose it.

## 5. Configure your application

Keep connection settings outside source code. A project can use separate environment values like these:

```dotenv
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=myapp_dev
DATABASE_USER=myapp_user
DATABASE_PASSWORD=replace-with-a-local-password
```

Map the application variables to the role and database you created, and set `DATABASE_PASSWORD` to the password you entered for that role. When the application runs in the same Compose project, set `DATABASE_HOST=db` rather than `localhost`. Keep `.env` out of version control and use your deployment platform's secret manager for deployed environments.

Applications and database libraries commonly accept a connection URL of this form:

```text
postgresql://myapp_user:password@localhost:5432/myapp_dev
```

A Python application using SQLAlchemy with Psycopg 3 can use:

```text
postgresql+psycopg://myapp_user:password@localhost:5432/myapp_dev
```

For example, install Psycopg 3 in a Python project that uses it:

```bash
python -m pip install "psycopg[binary]"
```

Use the database driver and configuration pattern appropriate to your framework. If a password contains reserved URL characters, use a library's URL builder or percent-encode the credentials rather than concatenating an unescaped URL.

## 6. Create a separate application role

The official PostgreSQL Docker image creates the role named by `POSTGRES_USER` as a database superuser. Keep that administrative role for setup and maintenance; do not configure your application to connect as it.

Connect as the administrator to the database created for your project:

```bash
docker compose exec db psql -U postgres -d myapp_dev
```

For a standalone container, use:

```bash
docker exec -it myapp-postgres psql -U postgres -d myapp_dev
```

In the psql prompt, create a regular login role and set its password using psql's secure password prompt:

```text
CREATE ROLE myapp_user WITH LOGIN;
\password myapp_user
ALTER DATABASE myapp_dev OWNER TO myapp_user;
```

Replace the role and database names. `CREATE ROLE` is for a new project role; it fails if that role already exists. `\password` is a psql command and will prompt you twice without echoing the password. `ALTER DATABASE` gives the application role ownership of its own development database so migration tooling can create and change its schema.

For production, consider separate roles for running the application and applying migrations. Grant each role only the permissions it needs, and manage credentials through a secret manager.

## 7. Apply your project's schema

PostgreSQL creates a database, but it does not know which tables your application needs. Define those tables using your project's migration tool or SQL schema files.

If a project has a SQL file such as `schema.sql`, run it from the project directory:

```bash
psql -h localhost -p 5432 -U myapp_user -d myapp_dev -f schema.sql
```

For a database running in Compose, you can pass the SQL file into `psql` in the service container. The example uses the database owner role created above. In projects with a separate migration role, use that role instead:

```bash
docker compose exec -T db psql -U myapp_user -d myapp_dev < schema.sql
```

Do not assume a schema file exists or apply an unrelated project's schema. Use the migrations or schema definitions that belong to the application you are setting up.

## 8. Inspect the database and run SQL

Check which database and role you are using:

```sql
SELECT current_database(), current_user;
```

List tables in the default `public` schema:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

Inspect columns for a table by substituting its name:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'table_name'
ORDER BY ordinal_position;
```

Read a small sample after substituting an existing table:

```sql
SELECT *
FROM table_name
LIMIT 20;
```

`table_name` is a placeholder, not a literal table that PostgreSQL creates for you. Query only tables that are part of your application's schema.

To try a change safely, use a transaction and inspect its result before committing:

```sql
BEGIN;

-- Run a small test change here, then inspect the affected rows.

ROLLBACK;
```

`ROLLBACK` discards changes made in the transaction. Use `COMMIT` only when you intend to keep the changes. Be especially careful with `UPDATE` and `DELETE`; verify their `WHERE` condition before execution.

## 9. Back up and restore a database

A Docker volume helps data survive container replacement, but it is not a backup. A backup should be stored separately from the database and periodically tested by restoring it.

### Create a custom-format backup

With `pg_dump` installed on your computer:

```bash
pg_dump -h localhost -p 5432 -U myapp_user -d myapp_dev \
  -Fc --no-owner --no-acl \
  -f myapp_dev.dump
```

With Docker Compose, use `pg_dump` inside the database service and save the output on your computer:

```bash
docker compose exec -T db pg_dump -U myapp_user -d myapp_dev \
  -Fc --no-owner --no-acl \
  > myapp_dev.dump
```

The `-Fc` option creates a custom archive that can be restored using `pg_restore`. A backup may contain private or personal data; protect it like the live database.

### Restore to a new database for verification

First create a separate, empty restore-test database. Connect as an administrative role if your application role is not permitted to create databases:

```bash
createdb -h localhost -p 5432 -U postgres -O myapp_user myapp_restore_test
```

Restore into it:

```bash
pg_restore -h localhost -p 5432 -U myapp_user -d myapp_restore_test \
  --no-owner --no-acl myapp_dev.dump
```

Connect to the restored database and verify the expected schema and representative data:

```bash
psql -h localhost -p 5432 -U myapp_user -d myapp_restore_test
```

Then in psql:

```text
\dt
\d table_name
```

Use table names from your own application. Restore tests should use a separate database, not overwrite the database you are currently developing against.

If the database does not exist and you need to restore a complete archive, `pg_restore --create` can create it from the archive's database name. Review the command and target carefully before using it. Never restore over data you need to keep.

## 10. Common connection problems

| Problem | What to check |
|---|---|
| Connection refused | Check that the PostgreSQL container/service is running and the host port is published. |
| Port is already in use | Choose a different host port and use it in the client configuration. |
| Password authentication failed | Check the username and password against the role in the database; changing container environment variables does not update an initialized volume. |
| Database does not exist | Check the database name and confirm it was created in the server you reached. |
| Table does not exist | Confirm the selected database and schema, then apply this project's migrations/schema. |
| Works on host, not in app container | Use the Compose database service name as the host from another container, not `localhost`. |
| Data disappeared after reset | Check whether the named volume was removed. Restore from a separate backup if available. |

Useful Docker Compose checks:

```bash
docker compose ps
docker compose logs --tail 50 db
docker compose exec db pg_isready -U myapp_user -d myapp_dev
```

## 11. Before using PostgreSQL in a project

- Confirm the application and database use the intended host, port, database, and role.
- Keep credentials outside source code and out of version control.
- Apply the schema and migrations that belong to this project.
- Use an application role rather than an administrator role.
- Test database operations and error handling using the project's own code and schema.
- Make a backup and verify that it can be restored to a separate database.
- Use separate databases or servers for development, testing, and production as appropriate; never use real production credentials in a local project.

PostgreSQL installation is only the first step. Each application still needs its own schema, migrations, connection settings, permissions, and backup plan.
