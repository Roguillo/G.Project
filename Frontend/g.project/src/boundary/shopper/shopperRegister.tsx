import React from 'react'

function RegisterShopper({instance, andRefreshDisplay}: {instance: any, andRefreshDisplay: any}) {

    function registerShopper() {
        const inputElementName = document.getElementById("new-shopper-name") as HTMLInputElement
        const inputElementUsername = document.getElementById("new-shopper-username") as HTMLInputElement
        const inputElementPassword = document.getElementById("new-shopper-password") as HTMLInputElement

        const name = inputElementName.value
        const username = inputElementUsername.value
        const password = inputElementPassword.value

        instance.post('/registerShopper').then((response) => {
            let bodyData = response.data.body
            andRefreshDisplay()
        })



        // in case any parent React code needs to know about this change, call the passed-in function
        andRefreshDisplay()
    }

    return (
        <div>
          <b>Name: </b><input id="new-shopper-name" placeholder="Name" data-testid="new-shopper-name"></input>
          <button onClick={() => {registerShopper()}}>Register Account</button>

          <p><b>Username: </b><input id="new-shopper-username" placeholder="Username" data-testid="new-shopper-username"></input></p>

          <p><b>Password: </b><input id="new-shopper-password" placeholder="Password" data-testid="new-shopper-password"></input></p>
        </div>
    )

}


function LoginShopper({andRefreshDisplay}: {andRefreshDisplay: any}) {

}

export { RegisterShopper, LoginShopper }