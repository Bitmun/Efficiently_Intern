# Efficiently Intern

This project is real time chat backend service

## Stack

- **NestJS**
- **PostgreSQL**
- **MongoDB (Mongoose)**
- **Redis**
- **AWS SQS/EventBridge (LocalStack)**
- **GraphQL**
- **Docker**

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Node.js](https://nodejs.org/) (for local development outside Docker)

### Setup

1. **Clone the repository**

2. **Configure environment variables:**
   - Fill `.env` with variables needed 

3. **Start all services:**
   ```sh
   docker-compose up --build
   ```
   Run next script in localstack container
   ```sh
   awslocal sqs create-queue --queue-name message-sync-queue

   awslocal events create-event-bus --name chat-bus
   
   awslocal events put-rule --name SyncMessagesRule --event-bus-name chat-bus --event-pattern '{"source":["chat-app.sync"],"detail-type":["SyncMessages"]}'
   
   awslocal events put-targets --rule SyncMessagesRule --event-bus-name chat-bus --targets '{"Id":"1","Arn":"arn:aws:sqs:us-east-1:000000000000:message-sync-queue"}'

   ```
   Run nest project
   ```sh
   npm install
   npm run start:dev
   ```
   

   This will start:
   - PostgreSQL (port 5432)
   - Redis (port 6379)
   - LocalStack (AWS SQS/EventBridge, port 4566)
   - pgAdmin (port 5050)
   - NestJS app (port 3000)

4. **Access the app:**
   - API: [http://localhost:3000/graphql](http://localhost:3000/graphql)
   - pgAdmin: [http://localhost:5050](http://localhost:5050) (default: admin@admin.com / admin)

## GraphQL API

All API routes are exposed via [http://localhost:3000/graphql](http://localhost:3000/graphql)  
Routes marked with 🔒 require authentication.

---

###  Auth

#### Mutations

- `signIn(input: SignInDto): AuthRes`  
  Sign in a user.  
  **Returns:** `{ accessToken: string }`  
  **Note:** Sets a `HttpOnly` cookie `accessToken`.

- `signUp(input: SignUpDto): AuthRes`  
  Register a new user.  
  **Returns:** `{ accessToken: string }`  
  **Note:** Sets a `HttpOnly` cookie `accessToken`.

---

###  Projects

#### Queries

- `findAllProjects(): [Project]` 🔒  
  Get all projects.

- `findProject(id: String): Project` 🔒  
  Find a project by ID.

- `searchProjectsChats(projectId: String, query: String): [Chat]` 🔒  
  Search chats within a specific project.

#### Mutations

- `createProject(input: CreateProjectDto): Project` 🔒  
  Create a new project.

- `deleteProject(id: String): Boolean` 🔒  
  Delete a project by ID.

- `deleteAllProjects(): Boolean` 🔒  
  Delete all projects.

- `addMemberToProject(projectId: String, userId: String): Project` 🔒  
  Add a member to the project.

- `createProjectChat(input: CreateChatDto): Chat` 🔒  
  Create a chat linked to a project.

---

### 💬 Chats

#### Queries

- `findAllChats(): [Chat]` 🔒  
  Returns all chats.

- `findChatsLastMessages(chatId: String, limit: Int): [Message]` 🔒  
  Fetch the last `n` messages from a chat.

- `findAllChatsMembers(chatId: String): [ChatMember]` 🔒  
  Get all members of a chat.

#### Mutations

- `sendMessageToChat(chatId: String, body: String): Message` 🔒  
  Send a message to a chat.

- `addUserToChat(chatId: String, userId: String): Boolean` 🔒  
  Add a user to a chat.

- `removeUserFromChat(chatId: String, userId: String): Boolean` 🔒  
  Remove a user from a chat.

- `deleteChat(chatId: String): Boolean` 🔒  
  Delete a chat by ID.

- `deleteAllChats(): Boolean` 🔒  
  Delete all chats.

---

### Running Tests

```sh
# Unit tests
npm run test
```


