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
    const shopCompResource = api_endpoint.root.addResource('shopComp')
    const registerShopperResource = shopCompResource.addResource('register-shopper')
    const loginShopperResource = shopCompResource.addResource('login-shopper')

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

    // Add a POST method to the '/shopComp/registerShopper' resource
    const add_fn = new lambdaNodejs.NodejsFunction(this, 'RegisterShopperFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'registerShopper.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'register-shopper')),
      vpc: vpc,                                                             // Reference the VPC defined above
      securityGroups: [securityGroup],                                      // Associate the security group
      timeout: Duration.seconds(3),                                         // Example timeout, adjust as needed
    })

    registerShopperResource.addMethod('POST', new apigw.LambdaIntegration(add_fn, integration_parameters), response_parameters)

    // Add a POST method to the '/shopComp/loginShopper' resource
    const multiply_fn = new lambdaNodejs.NodejsFunction(this, 'LoginShopperFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'loginShopper.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'login-shopper')),
      vpc: vpc,                                                             // Reference the VPC defined above
      securityGroups: [securityGroup],                                      // Associate the security group
      timeout: Duration.seconds(3),                                         // Example timeout, adjust as needed
    })
    loginShopperResource.addMethod('POST', new apigw.LambdaIntegration(multiply_fn, integration_parameters), response_parameters)
  }
}

