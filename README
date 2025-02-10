# Vaccine Registration API

This project is a RESTful API built with TypeScript and Express.js for managing vaccine registrations. It allows users to register, log in, book vaccination slots, and manage their appointments. Admin users can monitor user registrations, filter data, and view slot bookings.

## Features

### User Functionality
- **User Registration:** Register with name, phone number, age, pincode, Aadhar number, and password.
- **User Login:** Login using phone number and password.
- **View Available Slots:** Check available vaccine slots.
- **Register for a Slot:** Book slots for the first or second dose.
- **Update Slot:** Change your registered slot up to 24 hours before the scheduled time.

### Admin Functionality
- **Admin Login:** Admin credentials are pre-set in the database.
- **View Registered Users:** Filter users by age, pincode, or vaccination status.
- **View Slot Registrations:** View all registered slots filtered by dose type or date.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** express-validator

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/en/download/) installed
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) account

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-repo/vaccine-registration-api.git
   cd vaccine-registration-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```

4. **Run the application:**
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:3000`

## API Endpoints

### User Endpoints

1. **Register User**  
   `POST /register`
   - **Body Parameters:**
     ```json
     {
       "name": "John Doe",
       "phoneNumber": "9876543210",
       "age": 30,
       "pincode": "110001",
       "aadharNo": "123456789012",
       "password": "password123"
     }
     ```

2. **User Login**  
   `POST /login`
   - **Body Parameters:**
     ```json
     {
       "phoneNumber": "9876543210",
       "password": "password123"
     }
     ```

3. **View Available Slots**  
   `GET /slots`
   - **Headers:**
     ```json
     {
       "Authorization": "Bearer <JWT_TOKEN>"
     }
     ```

4. **Register for a Slot**  
   `POST /slots/register`
   - **Headers:**
     ```json
     {
       "Authorization": "Bearer <JWT_TOKEN>"
     }
     ```
   - **Body Parameters:**
     ```json
     {
       "slotId": "slot_id_here",
       "dose": "firstDose"
     }
     ```

5. **Update Registered Slot**  
   `PUT /slots/update`
   - **Headers:**
     ```json
     {
       "Authorization": "Bearer <JWT_TOKEN>"
     }
     ```
   - **Body Parameters:**
     ```json
     {
       "oldSlotId": "old_slot_id",
       "newSlotId": "new_slot_id"
     }
     ```

### Admin Endpoints

1. **Admin Login**  
   `POST /admin/login`
   - **Body Parameters:**
     ```json
     {
       "username": "admin",
       "password": "adminpassword"
     }
     ```

2. **Get Registered Users**  
   `GET /admin/users`
   - **Headers:**
     ```json
     {
       "Authorization": "Bearer <JWT_TOKEN>"
     }
     ```
   - **Query Parameters:** (Optional)
     - `age`: Filter by age
     - `pincode`: Filter by pincode
     - `vaccinationStatus`: Filter by vaccination status (`none`, `firstDose`, `fullyVaccinated`)

3. **Get Slot Registrations**  
   `GET /admin/slots`
   - **Headers:**
     ```json
     {
       "Authorization": "Bearer <JWT_TOKEN>"
     }
     ```
   - **Query Parameters:** (Optional)
     - `date`: Filter slots by date
     - `dose`: Filter by dose (`firstDose` or `secondDose`)

## Performance Testing

For performance testing, the system is capable of handling over 1 million user records. Sample queries are included in `generate-test-data.ts`, focusing on:
- Filtering by age, pincode, and vaccination status.
- Aggregation performance for slot registration data.



