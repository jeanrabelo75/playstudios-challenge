# Challenge

#### Application Setup

In order to proceed with the setup, you must have installed on your host machine the following requirements:

[Docker](https://runnable.com/docker/)  
[Docker Compose](https://docs.docker.com/compose/install/)  
[Node JS](https://nodejs.org/en/download/)  

#### Run on your local project folder:

`npm install`

#### Starting your Project

Create a `.env` following the example on `.env.example` and fill the values.

In your project root folder, just run:

`docker-compose up --build`

### And you're ready to go!

## Routes

Here are the main routes for this project:

### User Routes

- **Endpoint**: `/users`
- **Method**: `GET` & `POST`
- **Description**: Endpoint for user creation operations.

### Login

- **Endpoint**: `/login`
- **Method**: `GET` & `POST`
- **Description**: Allows users to login by validating their credentials and initiating a session.

### Logged Page

- **Endpoint**: `/logged`
- **Method**: `GET`
- **Description**: If authenticated, users are directed to this page.

### Reset Password

#### Request

- **Endpoint**: `/reset/reset-request`
- **Method**: `GET` & `POST`
- **Description**: Users can request a password reset.

#### Reset
- **Endpoint**: `/reset/reset-password?token=`
- **Parameters**: `token` (is mandatory)
- **Method**: `GET` & `POST`
- **Description**: Users can change their password.

## Error Handling

Errors are managed with a custom error handler middleware. Proper error messages and status codes will be returned based on the nature of the issue.

## Additional Information

If there are any issues or concerns, send me a message :)

**Thank you for this challenge project!**