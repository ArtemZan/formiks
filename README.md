# Formiks

SAP Projects Management Platform for ALSO

[![frontend](https://github.com/Innovatio-lv/formiks/actions/workflows/frontend.yml/badge.svg?branch=master)](https://github.com/Innovatio-lv/formiks/actions/workflows/frontend.yml)

[![backend](https://github.com/Innovatio-lv/formiks/actions/workflows/backend.yml/badge.svg?branch=master)](https://github.com/Innovatio-lv/formiks/actions/workflows/backend.yml)

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

### API Groups

- `users`
- `projects`
- `submissions`
- `drafts`
- `views`
- *`bookmarks`*
- *`dropdowns`*
- *`reports`*
- *`pipelines`*
- *`templates`*

### Users

#### Get all users with custom roles

auth: [`admin`]

```http
  GET /api/users
```

| Parameter | Type  | Description   |
| :-------- | :---- | :------------ |
| `filter`  | `any` | Search filter |

```json
[
  {
    "id": "user_id",
    "email": "email@address.com",
    "created": "time",
    "roles": ["admin", "tester"]
  }
]
```

#### Get user by email

auth: [`admin`]

```http
  GET /api/users/{email}
```

| Parameter | Type  | Description                 |
| :-------- | :---- | :-------------------------- |
| `email`   | `any` | **Required**. Email address |

```json
{
  "id": "objectID",
  "email": "email@address.com",
  "created": "time",
  "roles": ["admin", "tester"]
}
```

#### Get current user's roles

auth: [`user`]

```http
  GET /api/users/roles
```

| Parameter | Type | Description |
| :-------- | :--- | :---------- |
|           |      |             |

```json
{
  "id": "user_id",
  "email": "email@address.com",
  "created": "time",
  "roles": ["admin", "tester"]
}
```

#### Create user

auth: [`admin`]

```http
  POST /api/users
```

| Parameter | Type       | Description              |
| :-------- | :--------- | :----------------------- |
| `email`   | `string`   | **Required**. User email |
| `roles`   | `[]string` | **Required**. User roles |

```json
{
  "id": "user_id",
  "email": "email@address.com",
  "created": "time",
  "roles": ["admin", "tester"]
}
```

#### Update user

auth: [`admin`]

```http
  PUT /api/users/{id}
```

| Parameter | Type       | Description              |
| :-------- | :--------- | :----------------------- |
| `id`      | `string`   | **Required**. User id    |
| `email`   | `string`   | **Required**. User email |
| `roles`   | `[]string` | **Required**. User roles |

```json
{
  "id": "user_id",
  "email": "email@address.com",
  "created": "time",
  "roles": ["admin", "tester"]
}
```

#### Delete user

auth: [`admin`]

```http
  DELETE /api/users/{id}
```

| Parameter | Type     | Description           |
| :-------- | :------- | :-------------------- |
| `id`      | `string` | **Required**. User id |

```http
  HTTP 200
```

### Projects

#### Get all projects

auth: [`public`]

```http
  GET /api/projects
```

| Parameter  | Type      | Description                   |
| :--------- | :-------- | :---------------------------- |
| `released` | `boolean` | Return only released projects |

```json
[
  {
    "id": "project_id",
    "created": "time",
    "updated": "time",
  "type": "project_type", // formio | native
    "title": "project_title",
    "description": "project_description",
    "author": "user_email",
    "statuses": ["available", "statuses"],
    "defaultStatus": "default_status",
    "tags": ["project", "tags"],
    "roles": ["allowed", "roles"],
    "compenents": {...},
    "code": "project_code",
    "released": true
  }
]
```

#### Get project

auth: [`public`]

```http
  GET /api/projects/{id}
```

| Parameter | Type     | Description              |
| :-------- | :------- | :----------------------- |
| `id`      | `string` | **Required**. Project id |

```json
{
  "id": "project_id",
  "created": "time",
  "updated": "time",
  "type": "project_type", // formio | native
  "title": "project_title",
  "description": "project_description",
  "author": "user_email",
  "statuses": ["available", "statuses"],
  "defaultStatus": "default_status",
  "tags": ["project", "tags"],
  "roles": ["allowed", "roles"],
  "compenents": {...},
  "code": "project_code",
  "released": true
}
```

#### Create project

auth: [`admin`]

```http
  POST /api/projects
```

| Parameter       | Type            | Description                                           |
| :-------------- | :-------------- | :---------------------------------------------------- |
| `type`          | `string`        | **Required**. Project type                            |
| `title`         | `string`        | **Required**. Project type                            |
| `description`   | `string`        | **Required**. Project description                     |
| `statuses`      | `[]string`      | **Required**. Available statuses                      |
| `defaultStatus` | `string`        | **Required**. Default project status                  |
| `tags`          | `[]string`      | **Required**. Project tags                            |
| `roles`         | `[]string`      | **Required**. Restrict project to specific user roles |
| `components`    | `custom_object` | **Required**. Project components                      |
| `code`          | `string`        | **Required**. Project code                            |
| `released`      | `bool`          | **Required**. Release status                          |

```json
{
  "id": "project_id",
  "created": "time",
  "updated": "time",
  "type": "project_type", // formio | native
  "title": "project_title",
  "description": "project_description",
  "author": "user_email",
  "statuses": ["available", "statuses"],
  "defaultStatus": "default_status",
  "tags": ["project", "tags"],
  "roles": ["allowed", "roles"],
  "compenents": {...},
  "code": "project_code",
  "released": true
}
```

#### Update project

auth: [`admin`]

```http
  PUT /api/projects/{id}
```

| Parameter       | Type            | Description                                           |
| :-------------- | :-------------- | :---------------------------------------------------- |
| `id`            | `string`        | **Required**. Project id                              |
| `type`          | `string`        | **Required**. Project type                            |
| `title`         | `string`        | **Required**. Project type                            |
| `description`   | `string`        | **Required**. Project description                     |
| `statuses`      | `[]string`      | **Required**. Available statuses                      |
| `defaultStatus` | `string`        | **Required**. Default project status                  |
| `tags`          | `[]string`      | **Required**. Project tags                            |
| `roles`         | `[]string`      | **Required**. Restrict project to specific user roles |
| `components`    | `custom_object` | **Required**. Project components                      |
| `code`          | `string`        | **Required**. Project code                            |
| `released`      | `bool`          | **Required**. Release status                          |

```json
{
  "id": "project_id",
  "created": "time",
  "updated": "time",
  "type": "project_type", // formio | native
  "title": "project_title",
  "description": "project_description",
  "author": "user_email",
  "statuses": ["available", "statuses"],
  "defaultStatus": "default_status",
  "tags": ["project", "tags"],
  "roles": ["allowed", "roles"],
  "compenents": {...},
  "code": "project_code",
  "released": true
}
```

#### Delete project

auth: [`admin`]

```http
  DELETE /api/projects/{id}
```

| Parameter | Type     | Description              |
| :-------- | :------- | :----------------------- |
| `id`      | `string` | **Required**. Project id |

```http
  HTTP 200
```

### Submissions

#### Get all submissions

auth: [`public`]

```http
  GET /api/submissions
```

| Parameter | Type     | Description    |
| :-------- | :------- | :------------- |
| `project` | `string` | Project filter |

```json
[
  {
    "id": "submission_id",
    "project": "project_id",
    "parentId": "parent_submission_id", // string | null
    "viewId": "linked_view_id", // string | null
    "created": "time",
    "updated": "time",
    "title": "submission_title",
    "status": "submission_status",
    "author": "user_email",
    "group": "linked_group", // string | []string | null
    "data": {...} // raw_object | map[string]any | binary
  }
]
```

#### Get submission

auth: [`public`]

```http
  GET /api/submissions/{id}
```

| Parameter  | Type     | Description                                         |
| :--------- | :------- | :-------------------------------------------------- |
| `id`       | `string` | **Required**. Submission id                         |
| `children` | `bool`   | If children should be included (defaults to `true`) |

```json
{
  "id": "submission_id",
  "project": "project_id",
  "parentId": "parent_submission_id", // string | null
  "viewId": "linked_view_id", // string | null
  "created": "time",
  "updated": "time",
  "title": "submission_title",
  "status": "submission_status",
  "author": "user_email",
  "group": "linked_group", // string | []string | null
  "data": {...}, // raw_object | map[string]any | binary
  "children": [] // submission_object | null
}
```

#### Call SAP

auth: [`public`]

```http
  GET /api/submissions/{id}/sap
```

| Parameter | Type | Description |
| :-------- | :--- | :---------- |
|           |      |             |

```json
{
  "response": {
    ... // SAP response
  }
}
```

#### Create submission

auth: [`public`]

```http
  POST /api/submissions
```

| Parameter  | Type     | Description                        |
| :--------- | :------- | :--------------------------------- |
| `project`  | `string` | **Required**. Parent project id    |
| `parentId` | `string` | **Required**. Parent submission id |
| `viewId`   | `string` | **Required**. Parent view id       |
| `title`    | `string` | **Required**. Submission title     |
| `status`   | `string` | **Required**. Submission status    |
| `group`    | `string` | **Required**. Submission group     |
| `data`     | `object` | **Required**. Submission data      |

```json
{
  "id": "submission_id",
  "project": "project_id",
  "parentId": "parent_submission_id", // string | null
  "viewId": "linked_view_id", // string | null
  "created": "time",
  "updated": "time",
  "title": "submission_title",
  "status": "submission_status",
  "author": "user_email",
  "group": "linked_group", // string | []string | null
  "data": {...}, // raw_object | map[string]any | binary
  "children": [] // submission_object | null
}
```

#### Create submission with children

auth: [`public`]

```http
  POST /api/submissions/children
```

| Parameter    | Type       | Description                            |
| :----------- | :--------- | :------------------------------------- |
| `submission` | `object`   | **Required**. Parent submission object |
| `children`   | `[]object` | Submission children                    |

```json
{
  "id": "submission_id",
  "project": "project_id",
  "parentId": "parent_submission_id", // string | null
  "viewId": "linked_view_id", // string | null
  "created": "time",
  "updated": "time",
  "title": "submission_title",
  "status": "submission_status",
  "author": "user_email",
  "group": "linked_group", // string | []string | null
  "data": {...}, // raw_object | map[string]any | binary
  "children": [] // submission_object | null
}
```

#### Partial submission update

auth: [`public`]

```http
  POST /api/submissions/partial
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | **Required**. Submission id       |
| `path`    | `string` | **Required**. Target field's path |
| `value`   | `object` | **Required**. Field's value       |

```HTTP
  HTTP 200
```

#### Update submission

auth: [`public`]

```http
  PUT /api/submissions/{id}
```

| Parameter  | Type     | Description                        |
| :--------- | :------- | :--------------------------------- |
| `id`       | `string` | **Required**. Submission id        |
| `project`  | `string` | **Required**. Parent project id    |
| `parentId` | `string` | **Required**. Parent submission id |
| `viewId`   | `string` | **Required**. Parent view id       |
| `title`    | `string` | **Required**. Submission title     |
| `status`   | `string` | **Required**. Submission status    |
| `group`    | `string` | **Required**. Submission group     |
| `data`     | `object` | **Required**. Submission data      |

```json
{
  "id": "submission_id",
  "project": "project_id",
  "parentId": "parent_submission_id", // string | null
  "viewId": "linked_view_id", // string | null
  "created": "time",
  "updated": "time",
  "title": "submission_title",
  "status": "submission_status",
  "author": "user_email",
  "group": "linked_group", // string | []string | null
  "data": {...}, // raw_object | map[string]any | binary
  "children": [] // submission_object | null
}
```

#### Delete submission

auth: [`public`]

```http
  DELETE /api/submissions/{id}
```

| Parameter | Type     | Description                  |
| :-------- | :------- | :--------------------------- |
| `id`      | `string` | **Required**. Submission id  |
| `deep`    | `bool`   | Delete submission's children |

```http
  HTTP 200
```

### Drafts

#### Get all drafts

auth: [`public`]

```http
  GET /api/drafts
```

| Parameter | Type | Description |
| :-------- | :--- | :---------- |
|           |      |             |

```json
[
  {
    "id": "draft_id",
    "project": "project_id",
    "parentId": null,
    "viewId": null,
    "created": "time",
    "updated": "time",
    "title": "draft_title",
    "status": "draft_status",
    "author": "user_email",
    "group": "linked_group", // string | []string | null
    "data": {...}, // raw_object | map[string]any | binary
    "children": null
  }
]
```

#### Get draft

auth: [`public`]

```http
  GET /api/drafts/{id}
```

| Parameter | Type     | Description            |
| :-------- | :------- | :--------------------- |
| `id`      | `string` | **Required**. Draft id |

```json
{
  "id": "draft_id",
  "project": "project_id",
  "parentId": null,
  "viewId": null,
  "created": "time",
  "updated": "time",
  "title": "draft_title",
  "status": "draft_status",
  "author": "user_email",
  "group": "linked_group", // string | []string | null
  "data": {...}, // raw_object | map[string]any | binary
  "children": [] // draft_object | null
}
```

#### Create draft

auth: [`public`]

```http
  POST /api/drafts
```

| Parameter    | Type       | Description                       |
| :----------- | :--------- | :-------------------------------- |
| `submission` | `object`   | **Required**. Parent draft object |
| `children`   | `[]object` | Draft children                    |

```json
{
  "id": "submission_id",
  "project": "project_id",
  "parentId": "parent_submission_id", // string | null
  "viewId": "linked_view_id", // string | null
  "created": "time",
  "updated": "time",
  "title": "submission_title",
  "status": "submission_status",
  "author": "user_email",
  "group": "linked_group", // string | []string | null
  "data": {...}, // raw_object | map[string]any | binary
  "children": [] // submission_object | null
}
```

#### Update draft

auth: [`public`]

```http
  PUT /api/drafts/{id}
```

| Parameter  | Type     | Description                     |
| :--------- | :------- | :------------------------------ |
| `id`       | `string` | **Required**. Draft id          |
| `project`  | `string` | **Required**. Parent project id |
| `parentId` | `string` | **Required**. Parent draft id   |
| `viewId`   | `string` | **Required**. Parent view id    |
| `title`    | `string` | **Required**. Draft title       |
| `status`   | `string` | **Required**. Draft status      |
| `group`    | `string` | **Required**. Draft group       |
| `data`     | `object` | **Required**. Draft data        |

```json
{
  "id": "draft_id",
  "project": "project_id",
  "parentId": "parent_draft_id", // string | null
  "viewId": "linked_view_id", // string | null
  "created": "time",
  "updated": "time",
  "title": "draft_title",
  "status": "draft_status",
  "author": "user_email",
  "group": "linked_group", // string | []string | null
  "data": {...}, // raw_object | map[string]any | binary
  "children": [] // draft_object | null
}
```

#### Delete draft

auth: [`public`]

```http
  DELETE /api/drafts/{id}
```

| Parameter | Type     | Description             |
| :-------- | :------- | :---------------------- |
| `id`      | `string` | **Required**. Draft id  |
| `deep`    | `bool`   | Delete draft's children |

```http
  HTTP 200
```


#### Create view

auth: [`public`]

```http
  POST /api/views
```

| Parameter    | Type       | Description                       |
| :----------- | :--------- | :-------------------------------- |
| `submission` | `object`   | **Required**. Parent view object |
| `children`   | `[]object` | View children                    |

```json
{
  "id": "view_id",
  "project": "project_id",
  "parentId": "parent_view_id", // string | null
  "created": "time",
  "updated": "time",
  "title": "view_title",
  "status": "view_status",
  "author": "user_email",
  "group": "linked_group", // string | []string | null
  "data": {...}, // raw_object | map[string]any | binary
  "children": [] // view_object | null
}
```

#### Update view

auth: [`public`]

```http
  PUT /api/views/{id}
```

| Parameter  | Type     | Description                     |
| :--------- | :------- | :------------------------------ |
| `id`       | `string` | **Required**. View id          |
| `project`  | `string` | **Required**. Parent project id |
| `parentId` | `string` | **Required**. Parent view id   |
| `title`    | `string` | **Required**. View title       |
| `status`   | `string` | **Required**. View status      |
| `group`    | `string` | **Required**. View group       |
| `data`     | `object` | **Required**. View data        |

```json
{
  "id": "view_id",
  "project": "project_id",
  "parentId": "parent_view_id", // string | null
  "created": "time",
  "updated": "time",
  "title": "view_title",
  "status": "view_status",
  "author": "user_email",
  "group": "linked_group", // string | []string | null
  "data": {...}, // raw_object | map[string]any | binary
  "children": [] // view_object | null
}
```

#### Delete view

auth: [`public`]

```http
  DELETE /api/views/{id}
```

| Parameter | Type     | Description             |
| :-------- | :------- | :---------------------- |
| `id`      | `string` | **Required**. View id  |
| `deep`    | `bool`   | Delete view's children |

```http
  HTTP 200
```
