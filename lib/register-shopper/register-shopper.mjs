import mysql from 'mysql2'

/**
 * event is JSON of the form:
  
  { "name" : "name", 
    "username" : "username",
    "password" : "password"
  }
  
 */

export const handler = async (event) => {
  // Specify credentials
  var pool = mysql.createPool({
    host: 	process.env.RDS_HOST,
    user: 	process.env.RDS_USER,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DATABASE
  })   // NOT PROPERLY IMPLEMENTED

  let response = {}

  
  // Collect input data
  let name = event.name
  let username = event.username
  let password = event.password

  // Create unique user ID
  let shopperID = 0; // IMPLEMENT ME

  // Upload data to DB


  const response = {
    statusCode: 200,
    body: JSON.stringify(key1+key2+key3),
  }
  return response
}
