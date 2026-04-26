# Release Checklist Tool

A modern web application to help developers manage their release process through a checklist system.

## Features

- View all releases with their current status
- Create new releases with name, due date, and additional information
- Track completion of predefined release steps
- Automatic status calculation (planned → ongoing → done)
- Update release additional information
- Delete releases

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, Prisma ORM
- **Database**: PostgreSQL
- **Deployment**: Vercel (Frontend), Render/Heroku (Backend)

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd fullstack
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/release_checklist"
PORT=5000
```

Run database migrations:

```bash
npm run prisma:migrate
npm run prisma:generate
```

Start the backend server:

```bash
npm run dev
```

The backend will be running at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will be running at `http://localhost:3000`

## API Endpoints

All endpoints are prefixed with `/api/releases`

### GET /api/releases

Get all releases

**Response:**

```json
[
  {
    "id": 1,
    "name": "Release v1.0.0",
    "releaseDate": "2024-12-31T00:00:00.000Z",
    "additionalInfo": "Additional notes",
    "stepsCompleted": {
      "Code Freeze": false,
      "QA Signoff": false,
      "Smoke Test": false,
      "DB Backup": false,
      "Staging Deploy": false,
      "Production Deploy": false,
      "Post Release Check": false
    },
    "status": "planned",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### POST /api/releases

Create a new release

**Request Body:**

```json
{
  "name": "Release v1.0.0",
  "releaseDate": "2024-12-31",
  "additionalInfo": "Optional additional information"
}
```

**Response:** Created release object

### PATCH /api/releases/:id/steps

Toggle a step's completion status

**Request Body:**

```json
{
  "stepName": "Code Freeze"
}
```

**Response:** Updated release object with new status

### PATCH /api/releases/:id/info

Update release additional information

**Request Body:**

```json
{
  "additionalInfo": "Updated information"
}
```

**Response:** Updated release object

### DELETE /api/releases/:id

Delete a release

**Response:** Success message

## Database Schema

### Release Model

```sql
CREATE TABLE "Release" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "releaseDate" TIMESTAMP NOT NULL,
  "additionalInfo" TEXT,
  "stepsCompleted" JSONB NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**

- `id`: Auto-incrementing primary key
- `name`: Release name (required)
- `releaseDate`: Release date (required)
- `additionalInfo`: Additional notes (optional)
- `stepsCompleted`: JSON object tracking step completion status
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### Default Steps

The application includes 7 predefined steps:

- Code Freeze
- QA Signoff
- Smoke Test
- DB Backup
- Staging Deploy
- Production Deploy
- Post Release Check

## Status Calculation

Release status is automatically calculated based on step completion:

- **planned**: No steps completed
- **ongoing**: At least one step completed, but not all
- **done**: All steps completed

## Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variable: `NEXT_PUBLIC_API_URL` to your deployed backend URL
4. Deploy

### Backend (Render/Heroku)

1. Create a new web service on Render/Heroku
2. Connect your GitHub repository
3. Set environment variables:
   - `DATABASE_URL`: Your production PostgreSQL connection string
   - `PORT`: 10000 (for Render) or as configured
4. Deploy

## Project Structure

```
fullstack/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── app/
│   ├── public/
│   ├── package.json
│   └── next.config.ts
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

This project is licensed under the ISC License.
