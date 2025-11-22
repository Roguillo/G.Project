import mysql from 'mysql2';
import {config} from './config.mjs';

var pool = mysql.createPool({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database
}).promise()

// verify credentials
async function verifyUsername({username}) {
  const [rows] = await pool.query(
    'SELECT * FROM Administrators WHERE username = ?',
    [username]
  );

  if(rows.length > 0){
    return rows[0];
  }
  return null;
}

export const handler = async (event) => {
  
  let result
  let code
  try {
    let username = event.username
    let password = event.password

    //username and password not inputted
    if(!username || !password){
      code = 400
      result = { error : "Username and password field must have characters input" }
      return {
        statusCode: code,
        body: JSON.stringify(result)
      }
    }

    //username incorrect
    const admin = await verifyUsername({username})
    if(admin == null){
      code = 400
      result = { error : "Account with specified username doesn't exist" }
      return {
        statusCode: code,
        body: JSON.stringify(result)
      }
    }

    //password incorrect
    if(admin.password != password || admin.password == null){
      code = 400
      result = { error : "Invalid password" }
      return {
        statusCode: code,
        body: JSON.stringify(result)
      }
    }

    //generate admin token
    let adminToken = "adminToken" + crypto.randomUUID()
    await pool.query(
      'INSERT INTO AdminTokens (adminToken, administratorID) VALUES (?, ?)',
      [adminToken, admin.administratorID]
    )
    
    code = 200
    result = {
      name: admin.name,
      adminToken: adminToken
    }
  } catch (error) {
    result = "SQL error:" + error
    code = 400
  }
  
  const response = {
    statusCode: code,
    body: JSON.stringify(result),
  }
  
  return response
}





