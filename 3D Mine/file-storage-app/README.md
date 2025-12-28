# File Storage Application

A web application for uploading and retrieving files using MinIO object storage and MongoDB database, running in Docker containers.

## Features

- Upload files to MinIO bucket with metadata
- Store file metadata in MongoDB
- Retrieve and download files
- Search for files by title, description, or filename
- Delete files
- File preview for supported file types
- Progress bar for uploads
- Responsive design

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js with Express
- **Storage**: MinIO object storage
- **Database**: MongoDB
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Docker and Docker Compose installed
- Node.js and npm (for local development)

## Setup and Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd file-storage-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file (you can copy from the `.env.example`):
   ```
   cp .env.example .env
   ```

4. Start the application using Docker Compose:
   ```
   docker-compose up -d
   ```

5. Access the application in your browser:
   ```
   http://localhost:3000
   ```

## Accessing MinIO and MongoDB

- **MinIO Console**: http://localhost:9001 (login with credentials from .env file)
- **MongoDB**: Connect to mongodb://localhost:27017 using MongoDB Compass or similar tool

## Environment Variables

| Variable | Description |
|----------|-------------|
| MONGO_INITDB_ROOT_USERNAME | MongoDB root username |
| MONGO_INITDB_ROOT_PASSWORD | MongoDB root password |
| MONGO_URI | MongoDB connection URI |
| MINIO_ROOT_USER | MinIO root username |
| MINIO_ROOT_PASSWORD | MinIO root password |
| MINIO_ENDPOINT | MinIO endpoint hostname |
| MINIO_PORT | MinIO API port |
| MINIO_USE_SSL | Whether to use SSL for MinIO |
| MINIO_BUCKET_NAME | MinIO bucket name |
| PORT | Application server port |

## Project Structure

```
file-storage-app/
├── public/               # Frontend assets
│   ├── css/              # CSS styles
│   │   └── styles.css    # Main stylesheet
│   ├── js/               # JavaScript files
│   │   └── main.js       # Main frontend script
│   └── index.html        # Main HTML file
├── server/               # Backend code
│   ├── models/           # MongoDB models
│   │   └── fileModel.js  # File model schema
│   ├── routes/           # Express routes
│   │   └── fileRoutes.js # File routes handler
│   ├── utils/            # Utility functions
│   │   └── minioClient.js # MinIO client configuration
│   └── index.js          # Server entry point
├── .env                  # Environment variables
├── .env.example          # Example environment variables
├── .gitignore            # Git ignore file
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile            # Docker configuration for Node app
├── package.json          # Project dependencies
└── README.md             # Project documentation
```

## Development

To run the application locally without Docker:

1. Start MongoDB and MinIO separately (using Docker or local installations)
2. Update the `.env` file with your local connection details
3. Run the application:
   ```
   npm run dev
   ```

## License

MIT License