import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as apigw from "aws-cdk-lib/aws-apigateway"
import * as lambda from "aws-cdk-lib/aws-lambda"
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'node:path'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { Duration } from 'aws-cdk-lib'

export class ApplicationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const vpc = ec2.Vpc.fromVpcAttributes(this, 'VPC', {
          vpcId: 'vpc-0ed830e59732fe96e',                                                                         // Replace with your VPC ID
          availabilityZones: ['us-east-1a', 'us-east-1b', 'us-east-1c'],                                          // Replace with your AZs
          privateSubnetIds: ['subnet-07edc6e7d302f8e3a', 'subnet-0ad979218d9793ccc', 'subnet-052a461b390eb0cd1'], // Replace with your private subnet IDs
    })

    const securityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'SG', 'sg-032b016bd61787031', {             // Find your security group
        mutable: false
    })

    // generic default handler for any API function that doesn't get its own Lambda method
    const default_fn = new lambdaNodejs.NodejsFunction(this, 'LambdaDefaultFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'default.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'default')),
      vpc: vpc,                                                             // Reference the VPC defined above
      securityGroups: [securityGroup],                                      // Associate the security group
      timeout: Duration.seconds(3),                                         // Example timeout, adjust as needed
    })

    const api_endpoint = new apigw.LambdaRestApi(this, `shopcompapi`, {
      handler: default_fn,
      restApiName: `ShopCompAPI`, 
      proxy: false,
      defaultCorsPreflightOptions: {                                        // Optional BUT very helpful: Add CORS configuration 
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
      },
    })

    // Create a resource (e.g., '/calc')
    const shopCompResource                  = api_endpoint.root.addResource('shopComp')
    const addChainResource                  = shopCompResource.addResource('addChain')
    const addItemShoppingListResource       = shopCompResource.addResource('addItemShoppingList')
    const addStoreToChainResource           = shopCompResource.addResource('addStoreToChain')
    const addToReceiptResource              = shopCompResource.addResource('addToReceipt')
    const createReceiptResource             = shopCompResource.addResource('createReceipt')
    const createShoppingListResource        = shopCompResource.addResource('createShoppingList')
    const editItemOnReceiptResource         = shopCompResource.addResource('editItemOnReceipt')
    const listStoreChainsResource           = shopCompResource.addResource('listStoreChains')
    const loginAdminResource                = shopCompResource.addResource('loginAdmin')
    const loginShopperResource              = shopCompResource.addResource('loginShopper')
    const registerShopperResource           = shopCompResource.addResource('registerShopper')
    const removeChainResource               = shopCompResource.addResource('removeChain')
    const removeFromReceiptResource         = shopCompResource.addResource('removeFromReceipt')
    const removeStoreResource               = shopCompResource.addResource('removeStore')
    const reportOptionsShoppingListResource = shopCompResource.addResource('reportOptionsShoppingList')
    const reviewHistoryResource             = shopCompResource.addResource('reviewHistory')
    const showAdminDashboardResource        = shopCompResource.addResource('showAdminDashboard')
    const showShopperDashboardResource      = shopCompResource.addResource('showShopperDashboard')
  

    // https://github.com/aws/aws-cdk/blob/main/packages/aws-cdk-lib/aws-apigateway/README.md
    const integration_parameters = { 
       proxy: false,
       passthroughBehavior: apigw.PassthroughBehavior.WHEN_NO_MATCH,
       
       integrationResponses: [
          {
            // Successful response from the Lambda function, no filter defined
            statusCode: '200',
            responseTemplates: {
              'application/json': '$input.json(\'$\')',       // should just pass JSON through untouched
            },
            responseParameters: {
                'method.response.header.Content-Type':                      "'application/json'",
                'method.response.header.Access-Control-Allow-Origin':       "'*'",
                'method.response.header.Access-Control-Allow-Credentials':  "'true'"
            },
          },
          {
            // For errors, we check if the error message is not empty, get the error data
            selectionPattern: '(\n|.)+',
            statusCode: "400",
            responseTemplates: {
              'application/json': JSON.stringify({ state: 'error', message: "$util.escapeJavaScript($input.path('$.errorMessage'))" })
          },
            responseParameters: {
                'method.response.header.Content-Type':                      "'application/json'",
                'method.response.header.Access-Control-Allow-Origin':       "'*'",
                'method.response.header.Access-Control-Allow-Credentials':  "'true'"
            },
          }
        ]
      }

    const response_parameters = {
   methodResponses: [
    {
      // Successful response from the integration
      statusCode: '200',
      // Define what parameters are allowed or not
      responseParameters: {
        'method.response.header.Content-Type': true,
        'method.response.header.Access-Control-Allow-Origin': true,
        'method.response.header.Access-Control-Allow-Credentials': true
      },

    },
    {
      // Same thing for the error responses
      statusCode: '400',
      responseParameters: {
        'method.response.header.Content-Type': true,
        'method.response.header.Access-Control-Allow-Origin': true,
        'method.response.header.Access-Control-Allow-Credentials': true
      },
 
    }
  ]
    }


    // Add a POST method to the '/shopComp/addChain' resource
    const addChain_fn = new lambdaNodejs.NodejsFunction(this, 'AddChainFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'addChain.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'addChain')),
      vpc: vpc,                                                             // Reference the VPC defined above
      securityGroups: [securityGroup],                                      // Associate the security group
      timeout: Duration.seconds(3),                                         // Example timeout, adjust as needed
    })
    addChainResource.addMethod('POST', new apigw.LambdaIntegration(addChain_fn, integration_parameters), response_parameters)


    // Add a POST method to the '/shopComp/addItemToShoppingList' resource
    const addItemShoppingList_fn = new lambdaNodejs.NodejsFunction(this, 'AddItemShoppingListFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'addItemShoppingList.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'addItemShoppingList')),
      vpc: vpc,                                                             // Reference the VPC defined above
      securityGroups: [securityGroup],                                      // Associate the security group
      timeout: Duration.seconds(3),                                         // Example timeout, adjust as needed
    })
    addItemShoppingListResource.addMethod('POST', new apigw.LambdaIntegration(addItemShoppingList_fn, integration_parameters), response_parameters)


    // Add a POST method to the '/shopComp/addStoreToChain' resource
    const addStoreToChain_fn = new lambdaNodejs.NodejsFunction(this, 'AddStoreToChainFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'addStoreToChain.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'addStoreToChain')),
      vpc: vpc,                                                             // Reference the VPC defined above
      securityGroups: [securityGroup],                                      // Associate the security group
      timeout: Duration.seconds(3),                                         // Example timeout, adjust as needed
    })
    addStoreToChainResource.addMethod('POST', new apigw.LambdaIntegration(addStoreToChain_fn, integration_parameters), response_parameters)


    // Add a POST method to the '/shopComp/addToReceipt' resource
    const addToReceipt_fn = new lambdaNodejs.NodejsFunction(this, 'AddToReceiptFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'addToReceipt.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'addToReceipt')),
      vpc: vpc,                                                             // Reference the VPC defined above
      securityGroups: [securityGroup],                                      // Associate the security group
      timeout: Duration.seconds(3),                                         // Example timeout, adjust as needed
    })
    addToReceiptResource.addMethod('POST', new apigw.LambdaIntegration(addToReceipt_fn, integration_parameters), response_parameters)


    // Add a POST method to the '/shopComp/createReceipt' resource
    const createReceipt_fn = new lambdaNodejs.NodejsFunction(this, 'CreateReceiptFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'createReceipt.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'createReceipt')),
      vpc: vpc,                                                             // Reference the VPC defined above
      securityGroups: [securityGroup],                                      // Associate the security group
      timeout: Duration.seconds(3),                                         // Example timeout, adjust as needed
    })
    createReceiptResource.addMethod('POST', new apigw.LambdaIntegration(createReceipt_fn, integration_parameters), response_parameters)


    // Add a POST method to the '/shopComp/createShoppingList' resource
    const createShoppingList_fn = new lambdaNodejs.NodejsFunction(this, 'CreateShoppingListFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'createShoppingList.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'createShoppingList')),
      vpc: vpc,                                                             // Reference the VPC defined above
      securityGroups: [securityGroup],                                      // Associate the security group
      timeout: Duration.seconds(3),                                         // Example timeout, adjust as needed
    })
    createShoppingListResource.addMethod('POST', new apigw.LambdaIntegration(createShoppingList_fn, integration_parameters), response_parameters)


    // Add a POST method to the '/shopComp/editItemOnReceipt' resource
    const editItemOnReceipt_fn = new lambdaNodejs.NodejsFunction(this, 'EditItemOnReceiptFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'editItemOnReceipt.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'editItemOnReceipt')),
      vpc: vpc,                                                             // Reference the VPC defined above
      securityGroups: [securityGroup],                                      // Associate the security group
      timeout: Duration.seconds(3),                                         // Example timeout, adjust as needed
    })
    editItemOnReceiptResource.addMethod('POST', new apigw.LambdaIntegration(editItemOnReceipt_fn, integration_parameters), response_parameters)


    // Add a POST method to the '/shopComp/listStoreChains' resource
    const listStoreChains_fn = new lambdaNodejs.NodejsFunction(this, 'ListStoreChainsFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'listStoreChains.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'listStoreChains')),
      vpc: vpc,                                                             // Reference the VPC defined above
      securityGroups: [securityGroup],                                      // Associate the security group
      timeout: Duration.seconds(3),                                         // Example timeout, adjust as needed
    })
    listStoreChainsResource.addMethod('POST', new apigw.LambdaIntegration(listStoreChains_fn, integration_parameters), response_parameters)


    // Add a POST method to the '/shopComp/loginAdmin' resource
    const loginAdmin_fn = new lambdaNodejs.NodejsFunction(this, 'LoginAdminFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'loginAdmin.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'loginAdmin')),
      vpc: vpc,                                                             // Reference the VPC defined above
      securityGroups: [securityGroup],                                      // Associate the security group
      timeout: Duration.seconds(3),                                         // Example timeout, adjust as needed
    })
    loginAdminResource.addMethod('POST', new apigw.LambdaIntegration(loginAdmin_fn, integration_parameters), response_parameters)
    

    // Add a POST method to the '/shopComp/loginShopper' resource
    const loginShopper_fn = new lambdaNodejs.NodejsFunction(this, 'LoginShopperFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'loginShopper.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'loginShopper')),
      vpc: vpc,                                                             // Reference the VPC defined above
      securityGroups: [securityGroup],                                      // Associate the security group
      timeout: Duration.seconds(3),                                         // Example timeout, adjust as needed
    })
    loginShopperResource.addMethod('POST', new apigw.LambdaIntegration(loginShopper_fn, integration_parameters), response_parameters)


    // Add a POST method to the '/shopComp/registerShopper' resource
    const registerShopper_fn = new lambdaNodejs.NodejsFunction(this, 'RegisterShopperFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'registerShopper.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'registerShopper')),
      vpc: vpc,                                                             // Reference the VPC defined above
      securityGroups: [securityGroup],                                      // Associate the security group
      timeout: Duration.seconds(3),                                         // Example timeout, adjust as needed
    })
    registerShopperResource.addMethod('POST', new apigw.LambdaIntegration(registerShopper_fn, integration_parameters), response_parameters)


    // Add a POST method to the '/shopComp/removeChain' resource
    const removeChain_fn = new lambdaNodejs.NodejsFunction(this, 'RemoveChainFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'removeChain.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'removeChain')),
      vpc: vpc,                                                             // Reference the VPC defined above
      securityGroups: [securityGroup],                                      // Associate the security group
      timeout: Duration.seconds(3),                                         // Example timeout, adjust as needed
    })
    removeChainResource.addMethod('POST', new apigw.LambdaIntegration(removeChain_fn, integration_parameters), response_parameters)

    // Add a POST method to the '/shopComp/removeFromReceipt' resource
    const removeFromReceipt_fn = new lambdaNodejs.NodejsFunction(this, 'RemoveFromReceiptFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'removeFromReceipt.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'removeFromReceipt')),
      vpc: vpc,                                                             // Reference the VPC defined above
      securityGroups: [securityGroup],                                      // Associate the security group
      timeout: Duration.seconds(3),                                         // Example timeout, adjust as needed
    })
    removeFromReceiptResource.addMethod('POST', new apigw.LambdaIntegration(removeFromReceipt_fn, integration_parameters), response_parameters)

    // Add a POST method to the '/shopComp/removeStore' resource
    const removeStore_fn = new lambdaNodejs.NodejsFunction(this, 'RemoveStoreFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'removeStore.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'removeStore')),
      vpc: vpc,                                                             // Reference the VPC defined above
      securityGroups: [securityGroup],                                      // Associate the security group
      timeout: Duration.seconds(3),                                         // Example timeout, adjust as needed
    })
    removeStoreResource.addMethod('POST', new apigw.LambdaIntegration(removeStore_fn, integration_parameters), response_parameters)


    // Add a POST method to the '/shopComp/reportOptionsForShoppingList' resource
    const reportOptionsShoppingList_fn = new lambdaNodejs.NodejsFunction(this, 'ReportOptionsShoppingListFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'reportOptionsShoppingList.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'reportOptionsShoppingList')),
            vpc: vpc,                                                             // Reference the VPC defined above
      securityGroups: [securityGroup],                                      // Associate the security group
      timeout: Duration.seconds(3),                                         // Example timeout, adjust as needed
    })
    reportOptionsShoppingListResource.addMethod('POST', new apigw.LambdaIntegration(reportOptionsShoppingList_fn, integration_parameters), response_parameters)


    // Add a POST method to the '/shopComp/reviewHistory' resource
    const reviewHistory_fn = new lambdaNodejs.NodejsFunction(this, 'ReviewHistoryFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'reviewHistory.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'reviewHistory')),
      vpc: vpc,                                                             // Reference the VPC defined above
      securityGroups: [securityGroup],                                      // Associate the security group
      timeout: Duration.seconds(3),                                         // Example timeout, adjust as needed
    })
    reviewHistoryResource.addMethod('POST', new apigw.LambdaIntegration(reviewHistory_fn, integration_parameters), response_parameters)
    

    // Add a POST method to the '/shopComp/showAdminDashboard' resource
    const showAdminDashboard_fn = new lambdaNodejs.NodejsFunction(this, 'ShowAdminDashboardFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'showAdminDashboard.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'showAdminDashboard')),
      vpc: vpc,                                                             // Reference the VPC defined above
      securityGroups: [securityGroup],                                      // Associate the security group
      timeout: Duration.seconds(3),                                         // Example timeout, adjust as needed
    })
    showAdminDashboardResource.addMethod('POST', new apigw.LambdaIntegration(showAdminDashboard_fn, integration_parameters), response_parameters)


    // Add a POST method to the '/shopComp/showShopperDashboard' resource
    const showShopperDashboard_fn = new lambdaNodejs.NodejsFunction(this, 'ShowShopperDashboardFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'showShopperDashboard.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'showShopperDashboard')),
      vpc: vpc,                                                             // Reference the VPC defined above
      securityGroups: [securityGroup],                                      // Associate the security group
      timeout: Duration.seconds(3),                                         // Example timeout, adjust as needed
    })
    showShopperDashboardResource.addMethod('POST', new apigw.LambdaIntegration(showShopperDashboard_fn, integration_parameters), response_parameters)
  }
}