# souper-app-backend API

This is a Node/Express/MongoDB REST API for food items that integrates with firebase authentication . All item endpoints are protected and each registered firebase user has their own items.

## Getting Started

```
  Create .env file in root and add your MONGO_URI, FIREBASE_CLIENT_EMAIL, FIREBASE_PROJECT_ID, FIREBASE_DATABASE_URL, FIREBASE_DATABASE_URL variables.
```

```bash
  npm install
  npm run dev-start # Runs on http://localhost:5000
```

# API Usage & Endpoints

## Register a Users extended details [POST /api/users]

- Request: Add user

  - Headers

        Content-type: application/json,
        x-auth-token: YOURFIREBASEJWT

  - Body

            {
              "postcode": ""
            }

- Response: 200 (application/json)

  - Body

            {
                "msg": "user extended details created"
            }

## Get Logged In User [GET /api/users]

- Request: Get logged in user extended details

  - Headers

        x-auth-token: YOURFIREBASEJWT

- Response: 200 (application/json)

  - Body

            {
                "user_uid": "",
                "postcode": "",
                "date": ""
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
            "description" : "",
            "expiry" : ""
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
