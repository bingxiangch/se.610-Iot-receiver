1. Client requests a login from [/auth/login](https://gitlab.tuni.fi/on428246/iot-receiver/-/blob/main/backend/docs/iotapi.yaml) with user information given in the body as a json.
2. Server returns two tokens: an access token and a refresh token.
3. Client can now request data from api with the access token. Access token is given in the authorization header. It type is bearer token and should look something like this:
```javascript
{
    authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ik1hdHRpIiwicm9sZSI6ImFkbWluX3VzZXIiLCJpYXQiOjE2NjYyNjEyOTksImV4cCI6MTY2NjI2MTQ3OX0.unq-XrhHIHn7LNl1izvkpTV1430-5WD_4iLvkXq6VZg'
}
```
4. After the access token expires client can request a new access token with the refresh token from [/auth/token](https://gitlab.tuni.fi/on428246/iot-receiver/-/blob/main/backend/docs/iotapi.yaml). The refresh token is given in the body as text/plain. Server responds with a new access token.

- Access token - Used to request data from the server. Required for all other endpoints except [/auth/*](https://gitlab.tuni.fi/on428246/iot-receiver/-/blob/main/backend/docs/iotapi.yaml). Expires quickly.
- Refresh token - Used to request new access tokens. Login is necessary after token expires. Expires slowly.