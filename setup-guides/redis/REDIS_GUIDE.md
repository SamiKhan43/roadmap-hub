# Redis Setup Guide

Install Redis, run the server, connect a client, and verify your setup.

This guide uses **Ubuntu Linux** for the main walkthrough. It also points to the current Redis instructions for macOS and Windows. You will finish with a working Redis server, a few CLI commands, and a small Python program that reads and writes a value.

## 1. Understand Redis before installing

**Redis** is an in-memory data store. It keeps data in the server's memory so applications can read and update it quickly. Redis supports several data structures; in this guide, we will start with simple string keys and values.

A backend application often needs to retrieve the same information repeatedly. For example, it might repeatedly calculate a user's session state or fetch a popular product. Redis can hold a temporary copy so the application does not need to repeat more expensive work each time.

Redis is commonly used for:

- **Caching:** keeping temporary copies of data that can be loaded again from a primary database.
- **Sessions:** storing short-lived information about a signed-in session.
- **Temporary state:** storing verification codes, counters, rate-limit data, or short-lived application settings.
- **Queues and coordination:** supporting background jobs and other communication patterns.

Redis is not automatically a replacement for PostgreSQL or another primary database. If your application needs relational queries, durable records, joins, and transactions across business data, keep those responsibilities in a database designed for them. Redis is useful when its speed, data structures, or expiration features solve a real problem; a small application may not need it yet.

### Redis server and Redis client

These are two different programs:

- **Redis server** (`redis-server`) is the process that stores data and listens for connections, usually on port `6379`.
- **Redis client** (`redis-cli`, or a library inside your application) connects to the server and sends commands.

Your Python application does not run the Redis server itself. It uses a client library to communicate with a Redis server that is already running.

## 2. Prerequisites

You need:

- A computer with an internet connection and permission to install software.
- Basic terminal knowledge: opening a terminal, running a command, and reading its output.
- Python 3 for the Python section. You do not need Python to use Redis from the CLI.

### Check whether Redis is already installed

On Ubuntu, open a terminal and run:

```bash
redis-server --version
redis-cli --version
```

If both commands print version information, the programs are installed. If you see `command not found`, that program is not available on your current PATH. Redis may still be installed in another environment or container.

You can also check whether a server is already listening locally:

```bash
redis-cli ping
```

If it prints `PONG`, a Redis server is reachable using the default local connection. If it reports a connection error, continue with the installation and service steps below.

### Installation choices

| Operating system | Recommended starting point |
|---|---|
| Ubuntu / Debian | Redis's official APT repository, as used in this guide |
| macOS | Homebrew, following Redis's official macOS guide |
| Windows | WSL 2 with Ubuntu, or Docker as described in Redis's current Windows installation documentation |

**macOS:** use the official [Redis on macOS guide](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/install-redis-on-mac-os/). It uses Homebrew and documents `brew install redis` and `brew services`.

**Windows:** Redis's current installation overview documents Docker for Windows. Another practical development option is WSL 2 with an Ubuntu distribution: install Redis inside that Linux environment and follow the Linux instructions there. WSL service management depends on whether systemd is enabled in your distribution. See Redis's [current installation options](https://redis.io/docs/latest/install/install-stack/) and Microsoft's [WSL documentation](https://learn.microsoft.com/en-us/windows/wsl/) before choosing an approach.

The rest of the guide assumes a normal Ubuntu installation using APT and the Redis-maintained package repository.

## 3. Install Redis on Ubuntu

Ubuntu's default repositories may package a different Redis release from Redis's own repository. To follow Redis's current installation instructions and receive Redis Open Source packages from Redis, add the official APT repository.

### Update package information

```bash
sudo apt-get update
```

APT refreshes its local package index. This does not upgrade every installed program; it updates the information APT uses when finding packages.

### Install the repository prerequisites

```bash
sudo apt-get install lsb-release curl gpg
```

- `lsb-release` provides your Ubuntu release codename.
- `curl` downloads the repository signing key.
- `gpg` converts that key into the keyring format APT uses.

### Add Redis's signing key and package repository

Run these commands in order:

```bash
curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
sudo chmod 644 /usr/share/keyrings/redis-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list
```

The first command downloads Redis's repository signing key and stores it as a keyring. The second makes the key readable by APT. The third creates an APT source entry using your Ubuntu codename, so APT can verify packages from that repository.

Do not replace the signing-key step with an unverified key or disable APT signature checks.

### Refresh APT and install Redis

```bash
sudo apt-get update
sudo apt-get install redis
```

The `redis` package installs Redis Open Source and its command-line tools, including `redis-server` and `redis-cli`. Package names and the exact version available can change as Redis publishes releases and as repository support varies by Ubuntu codename. The install command selects the current package offered for your configured release; it does not promise one fixed version.

Redis normally starts automatically after installation. We will check that in the next section.

### Verify the installed programs

```bash
redis-server --version
redis-cli --version
```

The output contains version and build information. Your version number will depend on the package available when you install Redis. The important point is that both commands should run and report version details rather than `command not found`.

For the authoritative, maintained package instructions and version-pinning notes, see [Install Redis Open Source using APT](https://redis.io/docs/latest/operate/oss_and_stack/install/install-stack/apt/) and [Install Redis on Linux](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/install-redis-on-linux/).

## 4. Start and manage the Redis service

On Ubuntu, the APT package normally registers Redis with `systemd` as the `redis-server` service.

A **service** is a background process managed by the operating system. You do not need to keep a terminal window open for a service to keep running.

### Check the service status

```bash
sudo systemctl status redis-server
```

Look for `Active: active (running)`. The status output also includes the process ID, recent log information, and whether the service loaded successfully. Press `q` to leave the status screen.

If it is not running, start it:

```bash
sudo systemctl start redis-server
```

Check the status again:

```bash
sudo systemctl status redis-server
```

### Stop or restart Redis

```bash
sudo systemctl stop redis-server
sudo systemctl restart redis-server
```

- `stop` asks the service manager to stop Redis.
- `restart` stops and starts the service again, for example after a configuration change.

Avoid stopping a Redis instance that is currently serving an application unless you understand the impact on that application.

### Enable Redis at startup

```bash
sudo systemctl enable redis-server
```

This configures the service to start automatically during system boot. It does not mean the service is necessarily running right now. To enable it and start it immediately, use:

```bash
sudo systemctl enable --now redis-server
```

The Redis APT installation normally enables automatic startup for you, but checking the setting is useful:

```bash
systemctl is-enabled redis-server
```

Expected output when enabled is:

```text
enabled
```

## 5. Connect to Redis with redis-cli

`redis-cli` is Redis's command-line client. It connects to a Redis server and lets you send Redis commands without writing an application.

Start an interactive session:

```bash
redis-cli
```

You should see a prompt similar to:

```text
127.0.0.1:6379>
```

This prompt tells you that the CLI is connected to the local machine (`127.0.0.1`) on Redis's default port (`6379`). The prompt can differ if you connect to another host, port, or logical database.

Send a ping:

```text
127.0.0.1:6379> PING
PONG
```

`PING` is a simple request used to check that the server responds. `PONG` means the server received the command and replied. It does not test every feature or prove that an application is configured correctly, but it is a useful first connection check.

To leave the interactive client, run:

```text
127.0.0.1:6379> EXIT
```

You return to your normal terminal. Exiting `redis-cli` closes the client connection; it does not stop the Redis server.

You can also connect explicitly to a host and port:

```bash
redis-cli -h 127.0.0.1 -p 6379
```

For more CLI modes and options, see the [Redis CLI documentation](https://redis.io/docs/latest/develop/tools/cli/).

## 6. Try your first Redis commands

Open `redis-cli` again. The examples below run at the Redis prompt, not in your Ubuntu shell.

### PING — check that Redis responds

```text
127.0.0.1:6379> PING
PONG
```

Redis replies with `PONG` when it is reachable and responding.

### SET — store a value

```text
127.0.0.1:6379> SET app:theme dark
OK
```

This stores the string `dark` under the key `app:theme`. A key is the name you use to find a value later. The colon is a naming convention that makes related keys easier to recognize; Redis does not treat it as a special separator.

If the key already exists, `SET` replaces its value.

### GET — retrieve a value

```text
127.0.0.1:6379> GET app:theme
"dark"
```

Redis returns the stored value. If the key does not exist, `GET` returns `(nil)`.

### EXISTS — check whether a key exists

```text
127.0.0.1:6379> EXISTS app:theme
(integer) 1
```

The integer `1` means the key exists. A result of `0` means it does not. The command can also check multiple keys and return how many exist.

### DEL — delete a key

```text
127.0.0.1:6379> DEL app:theme
(integer) 1
```

The result is the number of keys removed. If you run the same command again, it returns `0` because the key is already gone.

Create the key again for the expiration examples:

```text
127.0.0.1:6379> SET app:notice "Redis is connected"
OK
```

### EXPIRE — give a key a lifetime

```text
127.0.0.1:6379> EXPIRE app:notice 60
(integer) 1
```

The number `60` is a duration in seconds. Redis will automatically remove the key after its remaining lifetime reaches zero. The result `1` means Redis applied the expiration; `0` means the key did not exist when the command ran.

### TTL — see how much time remains

```text
127.0.0.1:6379> TTL app:notice
(integer) 54
```

The number is an example: the actual result depends on how many seconds have passed since `EXPIRE`. It counts down toward zero.

Two special TTL results are useful to recognize:

- `-1`: the key exists but has no expiration time.
- `-2`: the key does not exist (it may have expired or been deleted).

You can set a value and its expiration in one operation with `SET app:notice "Redis is connected" EX 60`. This is often preferable in application code because the value and its lifetime are set together.

When you have finished experimenting, remove the temporary key:

```text
127.0.0.1:6379> DEL app:notice
(integer) 1
```

## 7. Connect Redis to Python

A Python program needs a **Redis client library**. The library handles the Redis network protocol and gives your code Python methods such as `set()`, `get()`, and `ping()`.

Redis maintains `redis-py`, its Python client. It is separate from the Redis server: installing the Python package does not install or start Redis itself. The server must already be running and reachable.

### Create and activate a virtual environment

From a project directory, run:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

A virtual environment keeps this project's Python packages separate from packages used by other projects. When it is active, your shell prompt may show `(.venv)`.

If the `venv` module is missing on Ubuntu, install the matching package for your Python version (for example, `sudo apt-get install python3-venv`), then create the environment again.

### Install redis-py

```bash
python -m pip install --upgrade pip
python -m pip install redis
```

The package name is `redis`. Use `python -m pip` so the package is installed for the Python interpreter associated with the active environment.

### Create a small connection test

Create a file named `redis_test.py`:

```python
import redis

client = redis.Redis(
    host="127.0.0.1",
    port=6379,
    db=0,
    decode_responses=True
)

try:
    print("Connected:", client.ping())

    client.set("app:message", "Hello from Python")
    value = client.get("app:message")

    print("Stored value:", value)
finally:
    client.close()
```

What each part does:

- `import redis` loads the redis-py package.
- `redis.Redis(...)` creates a client configured for the local Redis server. It does not launch a server.
- `host` and `port` identify where the server is listening.
- `db=0` selects logical database number zero, the default for a normal local connection.
- `decode_responses=True` asks redis-py to return Python strings instead of raw bytes for string responses.
- `client.ping()` sends a ping request. It returns `True` when Redis responds.
- `set()` stores the value, and `get()` retrieves it.
- The `finally` block closes the client connection even if an error occurs.

Run the program:

```bash
python redis_test.py
```

Expected output when the local server is running:

```text
Connected: True
Stored value: Hello from Python
```

The output is stable for this example, assuming the connection succeeds and the commands complete. If your server uses a password or a different host and port, the client settings must match that server's configuration.

To give a value a lifetime from Python, pass `ex` (seconds) to `set()`:

```python
client.set("app:temporary-setting", "enabled", ex=60)
```

That stores the value with a 60-second expiration. For current connection and client options, see the [official redis-py guide](https://redis.io/docs/latest/develop/clients/redis-py/) and [redis-py connection examples](https://redis.readthedocs.io/en/stable/examples/connection_examples.html).

## 8. Redis connection and configuration basics

A Redis client needs to know where the server is and whether it requires authentication.

| Setting | Meaning | Typical local value |
|---|---|---|
| Host | Network address of the Redis server | `127.0.0.1` |
| Port | TCP port Redis listens on | `6379` |
| Database | Logical database index selected after connecting | `0` |
| Username / password | Credentials, if ACL authentication is configured | Not assumed for every local installation |

Redis's default port is `6379`. The default logical database is number `0`. Logical database selection is not the same as creating a separate Redis server or a separate PostgreSQL-style database with independent users and schemas.

### Find the configuration file

On Ubuntu APT installations, the configuration file is commonly:

```text
/etc/redis/redis.conf
```

Package layouts can differ. To inspect the service definition and its startup arguments, run:

```bash
systemctl cat redis-server
```

You can also inspect the running process arguments with:

```bash
ps -ef | grep '[r]edis-server'
```

The arguments can show which configuration file the service uses. Avoid editing a guessed path; confirm the active configuration first. If you edit the configuration, restart the service and check its status and logs.

### Host binding and network exposure

A Redis server listens on one or more network interfaces. A local development server should normally be reachable only from the same machine, rather than openly accessible from the internet.

The `bind` setting controls which local network addresses Redis listens on. The `protected-mode` setting provides an additional safety mechanism for certain insecure configurations. Neither setting should be changed just to make a connection error disappear.

Do not expose Redis directly to untrusted networks. Do not open port `6379` to the public internet. For remote access, use a properly secured private network or tunnel, authentication and access controls, and firewall rules. Redis should not be treated as safe merely because a password is configured.

### Authentication

A local package installation may allow local connections without a password, depending on its configuration. Redis also supports ACL users and passwords. If authentication is enabled, a client must authenticate with credentials configured by the server.

Do not paste passwords into screenshots, commit them to source control, or hard-code production credentials in application code. Read them from an appropriate local environment or secret-management mechanism. The [Redis security documentation](https://redis.io/docs/latest/operate/oss_and_stack/management/security/) and [configuration documentation](https://redis.io/docs/latest/operate/oss_and_stack/management/config/) explain the available controls.

## 9. Persistence and data safety

Redis keeps its working dataset in memory, but it can also write data to disk. These disk-writing features are called **persistence**.

If persistence is disabled, data held only in memory is lost when the Redis process stops. With persistence enabled, Redis can reload data from files when it starts again. The exact recovery point depends on the configured persistence method and when the last successful write to disk occurred.

Two common options are:

- **RDB snapshots:** Redis saves a point-in-time snapshot of the dataset to an RDB file at configured intervals or when requested. Snapshots are compact and useful for backups, but writes made after the latest snapshot may not be present if the server stops unexpectedly.
- **AOF (Append Only File):** Redis records write operations so it can replay them during startup. The configured fsync policy determines how frequently changes are flushed to durable storage. With the common once-per-second policy, a failure can still lose a small amount of the most recent data.

Redis can use RDB, AOF, both, or no persistence. The right choice depends on whether the data is disposable (such as a rebuildable cache) or important enough to require stronger recovery guarantees. Persistence is not a substitute for independent backups.

For this beginner setup, do not change persistence settings just to complete the connection test. Before using Redis for important application data, read the [official Redis persistence guide](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/) and [configuration guide](https://redis.io/docs/latest/operate/oss_and_stack/management/config/).

## 10. Troubleshooting

Start by checking the service and the connection before changing configuration.

| Problem | Diagnose it | What to check |
|---|---|---|
| Redis service is not running | Run `sudo systemctl status redis-server` | Start it with `sudo systemctl start redis-server`, then inspect the status again. |
| Connection refused | Run `redis-cli -h 127.0.0.1 -p 6379 ping` | The server may be stopped, listening on another address or port, or blocked by a local network rule. |
| Wrong host or port | Compare the client's host and port with the server configuration | A client inside a container may need a service/container hostname instead of `127.0.0.1`. |
| `redis-cli` command not found | Run `command -v redis-cli` and `dpkg -l redis-tools` | The CLI package may be missing, or the executable may not be on PATH. On the Redis APT installation, `redis-tools` provides the CLI. |
| Python cannot connect | Run `python -m pip show redis`, then test `redis-cli ping` | Confirm redis-py is installed in the active virtual environment and the server is reachable from the same environment. |
| Authentication error | Check whether the server requires a username or password | Match the configured ACL credentials in the client. Do not disable authentication to work around the error. |
| Version differs from an example | Run `redis-server --version` | Package versions vary by Ubuntu release and repository state. Use the documentation matching your installed release. |

### Inspect service logs

If the service fails to start, check its recent logs:

```bash
sudo journalctl -u redis-server --no-pager -n 50
```

This prints recent service log entries without opening an interactive pager. Look for configuration errors, permission problems, or a port conflict. Fix the reported cause rather than changing several settings at once.

### Check whether port 6379 is in use

```bash
sudo ss -ltnp | grep ':6379'
```

If another process already owns the port, Redis may fail to bind to it. Identify that process before deciding what to do. Do not stop an unknown process or expose Redis on another public port as a shortcut.

If the CLI works but Python does not, check that both clients are using the same host, port, database number, and authentication settings. Also confirm that the Python virtual environment you activated is the one where you installed `redis`.

## 11. Final verification

Use this checklist before connecting Redis to a larger application:

- [ ] `redis-server --version` prints version information.
- [ ] `redis-cli --version` prints version information.
- [ ] `sudo systemctl status redis-server` shows the service running.
- [ ] `redis-cli ping` returns `PONG`.
- [ ] `SET`, `GET`, `EXISTS`, `DEL`, `EXPIRE`, and `TTL` behave as expected.
- [ ] The Python test program prints `Connected: True` and retrieves its stored value.

### Small practice task

Store a temporary application setting, read it back, and let Redis expire it automatically.

In `redis-cli`, run:

```text
SET app:maintenance-mode off EX 120
GET app:maintenance-mode
TTL app:maintenance-mode
```

The first command stores the value `off` for 120 seconds. The second should return `"off"`. The third returns the remaining number of seconds, which will be close to 120 but will decrease as time passes.

Now retrieve the same key from Python:

```python
import redis

client = redis.Redis(host="127.0.0.1", port=6379, decode_responses=True)

try:
    print(client.get("app:maintenance-mode"))
finally:
    client.close()
```

It should print `off` while the key still exists. After its expiration, `get()` returns `None`. You have now installed Redis, sent commands to its server, and connected a Python application to it.

## Official documentation

- [Redis documentation](https://redis.io/docs/latest/)
- [Install Redis](https://redis.io/docs/latest/operate/oss_and_stack/install/)
- [Redis CLI](https://redis.io/docs/latest/develop/tools/cli/)
- [Redis client for Python (redis-py)](https://redis.io/docs/latest/develop/clients/redis-py/)
- [Redis configuration](https://redis.io/docs/latest/operate/oss_and_stack/management/config/)
- [Redis persistence](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/)
