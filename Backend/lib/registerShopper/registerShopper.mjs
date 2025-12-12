import { config } from './config.mjs'
import mysql from 'mysql'

/**
 * event is JSON of the form:
  
  { "name" : "name", 
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


  let checkExists = (value) => {
    let username = String(value)

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


  let registerShopper = (name, username, password, shopperID) => {
    return new Promise((resolve, reject) => {
      const insertQuery = "INSERT INTO Shoppers (name, username, password, shopperID) VALUES (?, ?, ?, ?)"
      pool.query(insertQuery, [name, username, password, shopperID], (error, rows) => {
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
    const name = event.name
    const username = event.username
    const password = event.password
    const shopperID = "shopperID" + crypto.randomUUID()

    // Check if the username is taken, throws an error if true
    const exists = await checkExists(username)
    if (exists) {
      throw Error("The username: " + username + " is taken")
    }

    // Checks if inputs are valid, throws an error if invalid
    if (!name || !username || !password) {
      throw Error("All fields must have at least one character")
    }


    // Registers shopper account if all previous test cases pass
    await registerShopper(name, username, password, shopperID)

    // Returns 200 and success result
    result = "Created account: " + username
    code = 200

  } catch (error) {
    result = { error: error.message }
    code = 400
  }


  const response = {
    statusCode: code,
    body: JSON.stringify(result)
  }

  return response
}
