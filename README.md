# Formiks

SAP Projects Management Platform for ALSO

## Installation

Install frontend dependencies (`yarn` and `npm` are supported)

```bash
~/Projects/formiks
❯ cd frontend
❯ yarn install
```

Install backend dependencies (`GOPATH` and `GOROOT` should be set)

```bash
~/Projects/formiks
❯ cd backend
❯ go get
❯ touch .env # env variables will be used loaded from .env
```

## Run Locally

Clone the project

```bash
~/Projects
❯ git clone https://github.com/Innovatio-lv/formiks
```

Go to the project directory

```bash
~/Projects
❯ cd formiks
```

Install dependencies

```bash
~/Projects/formiks
❯ cd ~/Projects/formiks/frontend && yarn install
❯ cd ~/Projects/formiks/frontend && go get
```

Start frontend (React.js)

```bash
~/Projects/formiks/frontend
❯ yarn start
```

Start backend (Golang)

```bash
~/Projects/formiks/backend
❯ DEV=true go run main.go
```

### ENV Variables

```bash
# backend/.env

PORT=7000
ENABLE_TOKEN_VALIDATION=FALSE
MONGO_URL=mongodb://127.0.0.1:27017/?readPreference=primary&ssl=false
MONGO_DB=formiks
```

## API Reference

### Projects

#### Get all projects

```http
  GET /api/projects
```

| Parameter  | Type      | Description                   |
| :--------- | :-------- | :---------------------------- |
| `released` | `boolean` | Return only released projects |

#### Get project

```http
  GET /api/projects/${id}
```

| Parameter | Type     | Description                          |
| :-------- | :------- | :----------------------------------- |
| `id`      | `string` | **Required**. Id of project to fetch |

#### Create project

```http
  POST /api/projects
```

| Parameter | Type | Description |
| :-------- | :--- | :---------- |
| none      | any  | none        |

```json
{
  "type": "formio|native",
  "title": "",
  "author": "",
  "description": "",
  "statuses": ["New", "In Progress", "Completed", "On Hold", "Cancelled"],
  "defaultstatus": "New",
  "tags": ["dev", "testing"],
  "roles": ["administrator"],
  "components": {
    "$binary": "base64"
  }
}
```

#### Update project

```http
  PUT /api/projects/${id}
```

| Parameter | Type     | Description                           |
| :-------- | :------- | :------------------------------------ |
| `id`      | `string` | **Required**. Id of project to update |

```json
{
  "type": "formio|native",
  "title": "",
  "author": "",
  "description": "",
  "statuses": ["New", "In Progress", "Completed", "On Hold", "Cancelled"],
  "defaultstatus": "New",
  "tags": ["dev", "testing"],
  "roles": ["administrator"],
  "components": {
    "$binary": "base64"
  }
}
```

#### Delete project

```http
  DELETE /api/projects/${id}
```

| Parameter | Type     | Description                           |
| :-------- | :------- | :------------------------------------ |
| `id`      | `string` | **Required**. Id of project to delete |
