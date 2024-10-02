# Project Details
## .env file in the Project contains all the required keys

When server starts , it will automatically see an admin user into the data json file
One can find the admin details in .env file. \
After successful login , admin needs to create one user with role: 'vendor'. \
As of now only a vendor can create, update and see products created by them. \
Admin can see all the products created. \
A normal user, vendor and admin can check for order fulfilment and price calculation


## Installation

Dependency Installation

```bash
  npm install
```
Project Run

```bash
  npm run dev
```

Test Run

```bash
  npm run test
```