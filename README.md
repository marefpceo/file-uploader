# File Uploader App
[Visit Site](https://file-uploader-staging.up.railway.app/)
## [Changelog](/CHANGELOG.md)

### Introduction
File Uploader App is a stripped down version of a personal storage service, similar to Google Drive, Dropbox, etc. As with any personal storage service, users must sign up in order to use the service. 

The main focus is to create a full stack application with user authentication that allows users to upload, store and retrieve files. 

File Uploader App is from the The Odin Project course's NodeJS Module, Project: File Uploader. 

### Project Support Features
* Anyone can sign up for user access by clicking the `Sign Up` link
* Registered users can upload files no larger than 3MB
* Accepted file types for upload:
  * txt
  * pdf
  * doc
  * image files (jpeg, jpg, png)
  * htm/ html
* Create, Delete, Edit Folders

### Installation Guide
[Coming soon...]('https://github.com/marefpceo/file-uploader')

#### Local Install
* Clone this repository [here](https://github.com/marefpceo/file-uploader)
* The main branch will be the most stable branch at any given time, so ensure you are working from it

  > *main branch is always the most updated stable branch*

* Run `npm install` to install all dependencies
* Create an ***.env*** file in the project's root directory and add project variables

  >`DATABASE_URL` and `SESSION_SECRET` are the variables currently used. Use this file to adjust or add more variables as needed.
  >
  >* `DATABASE_URL` stores database connection.
  >* `SESSION_SECRET` stores the secret for creating cookie sessions

### Usage
* Run `npm run serverstart` to start the application
* Open web browser and navigate to `https://localhost:3000` 

### Technologies Used
* [NodeJS](https://www.nodejs.org/) is a cross-platform, open-source JavaScript runtime environment that runs on the V8 JavaScript engine. Node.js lets developers use JavaScript to write command line tools and for server-side scripting
* [ExpressJS](https://www.expressjs.org/) is a back end web application framework for building web applications and APIs.
* [PostgreSQL](https://www.postgresql.org/) is a free and open-source relational database management system emphasizing extensibility and SQL compliance.
* [Prisma ORM](https://www.prisma.io/) is an open-source next-generation ORM.
* [Passport](https://www.passportjs.org/) is authentication middleware for Node.js. Extremely flexible and modular, Passport can be unobtrusively dropped in to any Express-based web application. A comprehensive set of strategies support authentication using a username and password, Facebook, Twitter, and more.
* [Express Validator](https://express-validator.github.io/) middleware used to validate and sanitize form input data.
* [EJS](https://ejs.co/) is a simple templating language that lets you generate HTML markup with plain JavaScript.
* [Cloudinary](https://cloudinary.com/) provides cloud-based image and video management services. It enables users to upload, store, manage, manipulate, and deliver images and video for websites and apps.
