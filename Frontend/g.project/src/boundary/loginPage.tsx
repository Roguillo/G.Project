'use client';
import React from 'react'; 

function LoginAdmin({instance, andRefreshDisplay, onLoginSuccess}: {instance: any, andRefreshDisplay: any, onLoginSuccess: any}){
  const [apiMessage, changeApiMessage] = React.useState()

    async function loginAdmin() {

      const inputElementUsername = document.getElementById("admin-username") as HTMLInputElement
      const inputElementPassword = document.getElementById("admin-password") as HTMLInputElement

      const username = inputElementUsername.value
      const password = inputElementPassword.value

      const response = await instance.post('/loginAdmin', {
        "username": username,
        "password": password
      })

      const message = JSON.parse(response.data.body);
      console.log(message);

      if (message.error != undefined) {
        changeApiMessage(message.error);
      } else {
        changeApiMessage(message); 
        onLoginSuccess(message.adminToken);
      }

      andRefreshDisplay()
    }

      return (
        <div>
          <h2>Login to Admin</h2>
          <b>Username: </b><input id="admin-username" placeholder="Username" data-testid="admin-username"></input>

          <p><b>Password: </b><input id="admin-password" placeholder="Password" data-testid="admin-password"></input></p>

          <button onClick={() => {loginAdmin()}}>Login</button>

          <br></br>
          {apiMessage}
      
        </div>
      )
  }

//   function UseCaseController() {
//       const thingElement = document.getElementById(`name of thing`) as HTMLInputElement;
//       const thing        = thingElement.value;

//       // stuff to do with thing

//       //sync() or update() maybe
//   }

//   // other controllers as needed

  
  // return (
  //   // HTML shenanigans + buttons and other inputs
  // );

export { LoginAdmin }
