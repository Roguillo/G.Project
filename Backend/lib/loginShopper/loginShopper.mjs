import { config } from './config.mjs'
import mysql from 'mysql2'

/**
 * event is JSON of the form:
  
  { 
    "username" : "username",
    "password" : "password"
  }
  
 */

// Specify credentials
var pool = mysql.createPool({
  host:     config.host,
  user:     config.user,
  password: config.password,
  database: config.database
})

export const handler = async (event) => {
  let result
  let code


  // Checks if a username exists
  let checkExists = (username) => {
    return new Promise((resolve, reject) => {
      const checkQuery = "SELECT * FROM Shoppers WHERE username = ?"
      pool.query(checkQuery, [username], (error, rows) => {
        if (error) {
          reject(new Error("Database error: " + error.sqlMessage))
        } else {
          resolve(rows && rows.length > 0)
        }
      })
    })
  }


  // Checks if a username and password align
  let validateCredentials = (username, password) => {
    return new Promise((resolve, reject) => {
      const selectQuery = "SELECT * FROM Shoppers WHERE username = ? AND password = ?"
      pool.query(selectQuery, [username, password], (error, rows) => {
        if (error) {
          reject(new Error("Database error: " + error.sqlMessage))
        } else if (rows.length == 0) {
          reject(new Error("Incorrect password"))
        } else {
          resolve([rows[0].shopperID, rows[0].name])
        }
      })
    })
  }


  // Inserts a new login token into the DB
  let generateLoginToken = (loginToken, shopperID) => {
    return new Promise((resolve, reject) => {
      const insertQuery = "INSERT INTO LoginTokens (loginToken, shopperID) VALUES (?, ?)"
      pool.query(insertQuery, [loginToken, shopperID], (error) => {
        if (error) {
          reject(new Error("Database error: " + error.sqlMessage))
        } else {
          resolve(true)
        }
      })
    })
  }


  try {
    // Define JSON inputs as variables
    const username = event.username
    const password = event.password

    // Checks if inputs are valid, throws an error if invalid
    if (!username || !password) {
      throw Error("All fields must have at least one character")
    }

    // Checks if the username exists in the DB, return error if not
    const exists = await checkExists(username)
    if (!exists) {
      throw Error("Account with username: " + username + " doesn't exist")
    }

    // Check if the username and password match, return error if not
    const [shopperCredentials, name] = await validateCredentials(username, password)

    
    // Creates and stores login token if all previous test cases pass
    let loginToken = "loginToken" + crypto.randomUUID()
    generateLoginToken(loginToken, shopperCredentials)

    // Returns 200 and success result
    result = { "body" : "Successfully logged into " + username,
               "loginToken" : loginToken,
               "name" : name }
    code = 200

  } catch (error) {
    result = { error: error.message }
    code = 400
  }


  const response = {
    statusCode: code,
    body: JSON.stringify(result)
  }

  //pool.end()   // Close DB connections, commented out because it caused issues with mysql2

  return response
}