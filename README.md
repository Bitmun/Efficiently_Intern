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
   ```sh
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

### Running Tests

```sh
# Unit tests
npm run test
```

