## Getting Started

Follow these steps to set up, run, and maintain the project.

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v22)
- [npm](https://www.npmjs.com/)
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### 2. Install Dependencies

Install all required Node.js packages:

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the project root with the necessary environment variables. Example:

```env
# Contentful configuration
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_access_token
CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_CONTENT_TYPE=product

# Application configuration
PORT=3000

# Database configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

# JWT
JWT_SECRET=your_jwt_secret
```


### 4. Running the Application

#### 4.1. Using Docker Compose

Start the application and its dependencies (such as the database) with:

```bash
docker-compose up --build -d
```

This command builds Docker images (if needed) and starts all defined services.

#### 4.2. Running Database Migrations

If you use migrations, execute them inside the app container after the services are running:

```bash
docker-compose exec api npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli migration:run -d data-source.ts
```

> **Note:** Tables are created automatically; running migrations may fail if tables already exist.

#### 4.3. Viewing Logs

To view logs for the API service:

```bash
docker-compose logs -f api
```

#### 4.4. Stopping Services

To stop and remove all running containers:

```bash
docker-compose down
```

### 5. Accessing the API

Once the server starts, the API will be available at:

```
http://localhost:3000/
```

#### 5.1. API Documentation (Swagger UI)

Interactive API documentation is available at:

```
http://localhost:3000/api/docs
```

#### 5.2. Importing OpenAPI Spec

You can import the project's OpenAPI (Swagger) specification into [Postman](https://www.postman.com/) for exploring and testing endpoints. Download the `openapi.json` file and use Postman's "Import" feature.

### 6. Contentful Integration

This project uses [Contentful](https://www.contentful.com/) as a headless CMS.

- **Configuration:**  
  Set your Contentful credentials (`CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN`, etc.) in your `.env` file.

- **How it works:**  
  At startup, the server fetches Product data from Contentful and stores it in the database. A scheduled task runs every hour to update the database with the latest Product data from Contentful, ensuring information stays up to date.

### 7. Running Tests

Run unit tests:

```bash
npm run test
```

Check test coverage:

```bash
npm run test:cov
```

### 8. Linting

Check your code for style and formatting issues:

```bash
npm run lint
```

---

