# IPFS Background Service

This service provides a blockchain-based authentication wrapper for ipfs requests.

This is a mono-repo with the following packages:

- [`server`](./packages/server): Exposes the REST API.
- [`shared`](./packages/shared): Packages shared among other sub-repos.


## Local Docker setup

Development environment is configured using [docker-comopse](https://docs.docker.com/compose/).

First make sure to create your own `.env`:
```bash
cp .env.sample .env
```

Docker setup includes a Grafana dashboard for logs and metrics, which requires a Docker plugin:
```bash
docker plugin install  grafana/loki-docker-driver:latest --alias loki --grant-all-permissions
```

Finally, spin up docker containers with:
```bash
docker-compose up --build -d
```

- Rest API is available at http://localhost:8000
- Grafana dashboard is available at http://localhost:5000

When finished remove the containers with:
```bash
docker-compose down
```

## Grafana dashboard updates

To update the dashboard, click `Ctrl+S` > `Copy JSON to clipboard` and overwrite the file in `monitoring/grafana/provisioning/dashboards/ipfs-background-service.json`.


## CI/CD

For CI/CD we are using [GitHub Actions](https://github.com/features/actions).

Currently we have 3 workflows:

### 1. Staging CI/CD

- For automated tests -> on every non-master commit
- For deploying to staging server -> on every commit in the `development` branch

### 2. Production CI/CD

For automated tests and deploying to production when creating `v*` tags in the `master` branch.

Deployments can be triggered using lerna:
```bash
yarn lerna version [ major | minor | patch ]
```

### 3. Dashboard CI/CD

For pushing the Grafana dashboard on any change in `development`/`master` branch.
