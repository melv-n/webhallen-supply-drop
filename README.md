# Supply Drop

[![GHCR](https://img.shields.io/badge/ghcr.io-melv--n%2Fwebhallen--supply--drop-blue?logo=github)](https://github.com/melv-n/webhallen-supply-drop/pkgs/container/webhallen-supply-drop)

**Container image:**
```
docker pull ghcr.io/melv-n/webhallen-supply-drop:latest
```

---

## Makefile Commands

- `make build` — Build the Docker image locally
- `make push` — Build and push the image to GHCR
- `make run` — Run the image locally with your `.env` file

---

## Example: docker-compose.yml

```yaml
version: "3.8"
services:
  supply-drop:
    image: ghcr.io/melv-n/webhallen-supply-drop:latest
    container_name: supply-drop
    restart: unless-stopped
    environment:
      WEBHALLEN_USERNAME: "your_username"
      WEBHALLEN_PASSWORD: "your_password"
      PUSHOVER_TOKEN: "your_pushover_token"   # optional
      PUSHOVER_USER: "your_pushover_user"     # optional
      TZ: Europe/Stockholm
```

---

## Requirements
- Node.js 24 or newer
- [pnpm](https://pnpm.io/) (install with `npm install -g pnpm`)

## Setup
1. Install dependencies:
   ```sh
   pnpm install
   ```
2. Create a `.env` file with your credentials:
   ```env
   WEBHALLEN_USERNAME=your_username
   WEBHALLEN_PASSWORD=your_password
   PUSHOVER_TOKEN=your_pushover_token
   PUSHOVER_USER=your_pushover_user
   ```

## Usage
1. Build the project (if needed):
   ```sh
   pnpm run build
   ```
2. Run the app:
   ```sh
   pnpm start
   ```

## Docker
- Build the image:
  ```sh
  make build
  ```
- Push to Docker Hub:
  ```sh
  make push
  ```
- Run locally:
  ```sh
  make run
  ```

## Notes
- Uses native `fetch` (Node.js 18+ required, Node.js 24+ recommended).
- All code is now in TypeScript.
- Uses [pnpm](https://pnpm.io/) for dependency management.

## Push notifications (optional)
To setup Push notifications you need to setup an account with [Pushover](https://pushover.net/api). You can try it out for free for 7 days and after that choose to [unlock forever for 5$ per device platform](https://pushover.net/pricing) (e.g. unlock it for all Apple devices).

1. [Create your account](https://pushover.net/signup)
2. Download the Pushover app on your phone and login
3. Create [a new Pushover app](https://pushover.net/apps) and call it something like "Supply Drop". You'll get a code, this is the `PUSHOVER_TOKEN` you should add in your `.env` file.
4. Find your "User Key" [on the Pushover dashboard](https://pushover.net/) and set this to `PUSHOVER_USER`
5. Done!

## Logs
All logs are written to `logs/app.log`

## Scheduled run with CRON
Supply drops are replenished every Monday-night. The below CRON entry will run this script every Tuesday morning at 8am:
```cron
0 8 * * TUE (cd ~/scripts-bin/supply-drop && /usr/local/bin/node --experimental-modules -r dotenv/config index.mjs) > /var/log/webhallen-supplydrop.log
```

You should change the paths to where you've cloned this repo.

Note that I'm running this on an old Raspberry Pi (arm6), meaning that the latest support version of Node is v11. If you're running Node v13+ you can change `npm run node11` with `npm start`.

### Setup CRON on Linux/macOS
1. `crontab -e`
2. Add the above snippet to the end of the file
3. `ctrl + o` to save
4. `ctrl + x` to quit
