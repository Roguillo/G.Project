import React from 'react'

function RegisterShopper({instance, andRefreshDisplay}: {instance: any, andRefreshDisplay: any}) {
    const [apiMessage, changeApiMessage] = React.useState()

    function registerShopper() {

        const inputElementName = document.getElementById("new-shopper-name") as HTMLInputElement
        const inputElementUsername = document.getElementById("new-shopper-username") as HTMLInputElement
        const inputElementPassword = document.getElementById("new-shopper-password") as HTMLInputElement

        const name = inputElementName.value
        const username = inputElementUsername.value
        const password = inputElementPassword.value

        instance.post('/registerShopper', {
                "name": name,
                "username": username,
                "password": password
            })
            .then((response) => {
                let message = JSON.parse(response.data.body)  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
                
                if (message.error != undefined) {
                    changeApiMessage(message.error)
                } else {
                    changeApiMessage(message)
                }
            })

        // in case any parent React code needs to know about this change, call the passed-in function
        andRefreshDisplay()
    }

    return (
        <div>
          <h2>Register Account</h2>
          <b>Name: </b><input id="new-shopper-name" placeholder="Name" data-testid="new-shopper-name"></input>
          <button onClick={() => {registerShopper()}}>Register Account</button>

          <p><b>Username: </b><input id="new-shopper-username" placeholder="Username" data-testid="new-shopper-username"></input></p>

          <p><b>Password: </b><input id="new-shopper-password" placeholder="Password" data-testid="new-shopper-password"></input></p>

          <br></br>
          {apiMessage}
          
        </div>
    )
}


function LoginShopper({instance, andRefreshDisplay}: {instance: any, andRefreshDisplay: any}) {
    const [apiMessage, changeApiMessage] = React.useState()

    function loginShopper() {

        const inputElementUsername = document.getElementById("shopper-username") as HTMLInputElement
        const inputElementPassword = document.getElementById("shopper-password") as HTMLInputElement

        const username = inputElementUsername.value
        const password = inputElementPassword.value

        instance.post('/loginShopper', {
                "username": username,
                "password": password
            })
            .then((response) => {
                let message = JSON.parse(response.data.body)  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
                console.log(message)
                if (message.error != undefined) {
                    changeApiMessage(message.error)
                } else {
                    changeApiMessage(message.body)
                }
            })

        // in case any parent React code needs to know about this change, call the passed-in function
        andRefreshDisplay()
    }

    return (
        <div>
          <h2>Login to Account</h2>
          <b>Username: </b><input id="shopper-username" placeholder="Username" data-testid="shopper-username"></input>
          <button onClick={() => {loginShopper()}}>Login to Account</button>

          <p><b>Password: </b><input id="shopper-password" placeholder="Password" data-testid="shopper-password"></input></p>

          <br></br>
          {apiMessage}
          
        </div>
    )
}

export { RegisterShopper, LoginShopper }