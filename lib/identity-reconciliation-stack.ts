import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import path = require('path');
import   {aws_lambda_nodejs as lambdaNode} from "aws-cdk-lib";
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class IdentityReconciliationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'IdentityReconciliationQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
    const userLambda = new lambdaNode.NodejsFunction(
      this,
      'user-lambda',
      {
        entry: path.join(__dirname, '../functions/user/user-handler.ts'),
        handler: 'handler',
        environment: {
          FUNCTION_NAME: 'user handler'
        }
      }
    );

      // Create an API Gateway REST API with a URL that triggers the Lambda function
const api = new apigateway.RestApi(this, 'API');
const integration = new apigateway.LambdaIntegration(userLambda);
api.root
        .addResource('user')
        .addMethod('POST', integration);

// Output the URL for the API Gateway endpoint
new cdk.CfnOutput(this, 'URL', {
  value: api.url,
});
  }
}
