# souper-app-backend API

This is a Node/Express/MongoDB REST API for food items that integrates with firebase authentication . All item endpoints are protected and each registered firebase user has their own items.

## Factsheet

| **Category**              | **Value**                                 |
| ------------------------- | ---------------------------------------- |
| **Contact**               | @Andystyles30, @cavalost, @abinormal, @mcblueglade, 
| **Language / Framework**  | Node / Express
| **Deployment type**       | Heroku
| **Production URL**     | [https://souper-app-backend.herokuapp.com](https://souper-app-backend.herokuapp.com)|

## Configuration

Configuration is via the following environment variables:

| Env var      | Example      | Purpose                   |
| ------------ | ------------ | ------------------------- |
| `PORT` | `5000` | Port - local environment |
| `MONGO_URI` | `mongodb+srv://<username>:<password>@uri/db` | CRUD operations
| `MONGO_DB_NAME` | `-` | MongoDB database name |
| `FIREBASE_PRIVATE_KEY` | `-` | 
| `FIREBASE_CLIENT_EMAIL` | `-` |
| `FIREBASE_PROJECT_ID` | `-` |
| `FIREBASE_DATABASE_URL` | `-` |

## Requirements
Node >= 8

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run dev-start
```

### Compiles and runs the server
```
npm run start
```

### Deploy to Heroku
Link the repository to Heroku, create a heroku/nodejs Buildpack, setup the environment variables and perform a commit + push to main to start the deployment


# API Usage & Endpoints

## Register a Users extended details [POST /api/users]

- Request: Add user

  - Headers

        Content-type: application/json,
        x-auth-token: YOURFIREBASEJWT

  - Body

            {
              "postcode" = "",
              "display_name" = "",
              "profile_pic" = ""
            }

- Response: 200 (application/json)

    - Body
    
              {
                "user": {}
              }
              
## Get Logged In User [GET /api/users]

- Request: Get logged in user extended details

  - Headers

        x-auth-token: YOURFIREBASEJWT

- Response: 200 (application/json)

  - Body

            {
                "user_uid": ""
            }

## Get Items [GET /api/items]

- Request: Get all items of a specific user

  - Headers

        x-auth-token: YOURFIREBASEJWT

* Response: 200 (application/json)

  - Body

            {
                "items": []
            }

## Add New item [POST /api/items]

- Request: Add a new item

  - Headers

        x-auth-token: YOURFIREBASEJWT
        Content-type: application/json

  - Body

        {
            "title": "",
            "description" : "",
            "category": [],
            "expiry" : "",
            "postcode": "",
            "location": {},
            "availability": ""
        }

- Response: 200 (application/json)

  - Body

          {
            "item": {}
          }

## Update item [PUT /api/items/:id]

- Request: Update existing item

  - Parameters

    - id: 1 (number) - An unique identifier of the item.

  - Headers

        x-auth-token: YOURFIREBASEJWT
        Content-type: application/json

  - Body

        {
            "description": "",
            "expiry": "",
            "c_user_uid": "",
            "postcode", "",
            "category": [],
            "availability": "",
            "title": ""
        }
        
- Response: 200 (application/json)

  - Body

          {
            "item": {}
          }

## Delete item [DELETE /api/items/:id]

- Request: Delete existing item

  - Parameters

    - id: 1 (number) - An unique identifier of the item.

  - Headers

        x-auth-token: YOURFIREBASEJWT

* Response: 200 (application/json)

  - Body

          {
            "msg": "item removed"
          }
