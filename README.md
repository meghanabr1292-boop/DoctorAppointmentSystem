Doctor Appointment System
A full-stack web application designed to make doctor appointment booking
and management easier. Patients can use the application to manage
appointment requests, while the backend handles API requests and stores
application data.
Technology Stack
- Frontend: React.js
- Backend: Node.js and Express.js
- Database: MongoDB
- Authentication: JWT (JSON Web Token)
- Development tools: Visual Studio Code, Postman, Git and GitHub
Project Structure
DoctorAppointmentSystem/
├── backend/       # Server-side code and API
├── frontend/      # React user interface
└── README.md
Main Features
- User interface for the doctor appointment application
- Backend REST API built with Node.js and Express.js
- MongoDB database integration
- Appointment data management
- Appointment status tracking (for example, Pending)
- JWT-based authentication support
Note: The exact screens and features available depend on the
implementation in the project source code.

Prerequisites
Install the following before running the project:
- Node.js and npm
- MongoDB Community Server, or a MongoDB Atlas database
- Visual Studio Code (recommended)
Installation and Setup
1. Clone the repository
git clone https://github.com/meghanabr1292-boop/DoctorAppointmentSystem.git
cd DoctorAppointmentSystem
2. Set up the backend
Open a terminal in the backend folder:
cd backend
npm install
Create or update the backend environment file (usually .env) with your
own configuration. For example:
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/doctorAppointment
JWT_SECRET=replace_with_a_long_random_secret
Use the environment variable names expected by your backend code. Do not
commit real passwords, database credentials, or secret keys to GitHub.

Start the backend using the script defined in backend/package.json.
Common commands are:
npm run dev
or
npm start
3. Set up the frontend
Open a second terminal and move to the frontend folder:
cd frontend
npm install
Start the frontend using the script defined in frontend/package.json.
For a Vite-based React project, the command is commonly:
npm run dev
Open the local URL printed in the terminal (often
http://localhost:5173).
Database
The application uses MongoDB. Make sure the MongoDB service is running,
or provide a valid MongoDB Atlas connection string in the backend
environment configuration.

The example local database name is doctorAppointment.
API Testing
You can use Postman to test the backend API endpoints. The backend
server used during development runs on port 5000 unless configured
otherwise.
Security Notes
- Keep .env files private and add them to .gitignore.
- Never publish database passwords, JWT secrets, or private
  credentials.
- Validate user input on the server before saving data.
- Use secure authentication and authorization checks for protected
  routes.
Future Enhancements
- Doctor profile and availability management
- Appointment rescheduling and cancellation
- Email or SMS appointment notifications
- Improved patient and doctor dashboards
- Search and filtering for doctors
Author
Meghana
Repository
DoctorAppointmentSystem on
GitHub
