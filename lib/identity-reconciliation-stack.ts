import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import path = require('path');
import   {aws_lambda_nodejs as lambdaNode} from "aws-cdk-lib";
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { constants } from './constants';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class IdentityReconciliationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

  const vpc = new ec2.Vpc(this, "VPC", {
    subnetConfiguration: [

      {
        name: 'isolated-subnet-1',
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED, //for RDS.
        cidrMask: 28,
      },
      {
        name: 'private-subnet-1',
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, //for lambda.
        cidrMask: 28,
      },
      {
        name: 'public-subnet-1',
        subnetType: ec2.SubnetType.PUBLIC, //if we declare private we also need public for NAT .
        cidrMask: 28,
      },
    ],
  });

  const rdsSg = new ec2.SecurityGroup(this, 'dbSecurityGroup', {
    vpc,
    allowAllOutbound: false, //to isolate db so that only lambda will access
    description: 'Allow inbound traffic to MySQL',
  });


  const lambdaSg = new ec2.SecurityGroup(this, 'lambdSG', {
    vpc,
    allowAllOutbound: true, // to access db 
    description: 'Allow Outboud traffic for lambda to access db',
  });

  // allowed only one inbound port.
  rdsSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(3306), 'inbound traffic');
  
  const dbInstance = new rds.DatabaseInstance(this,"BiteSpeed DB",{
    engine: rds.DatabaseInstanceEngine.mysql({
      version: rds.MysqlEngineVersion.VER_5_7,
    }),
    instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2,ec2.InstanceSize.MICRO),
    instanceIdentifier: 'bitespeed-database',
    allocatedStorage:20,
    removalPolicy:cdk.RemovalPolicy.DESTROY,
    vpc:vpc,
    vpcSubnets : {subnetType:ec2.SubnetType.PRIVATE_ISOLATED},
    securityGroups: [rdsSg],
    deletionProtection:false,
    publiclyAccessible:false,
    credentials: rds.Credentials.fromGeneratedSecret(constants.CRED), // credentials will be stored in secret manager
    databaseName : constants.DB_NAME,
    
  })


    const userLambda = new lambdaNode.NodejsFunction(
      this,
      'user-lambda',
      {
        securityGroups: [lambdaSg],
        vpc: vpc,
        entry: path.join(__dirname, '../functions/user/user-handler.ts'),
        handler: 'handler',
        environment: {
          DB_HOST: dbInstance.dbInstanceEndpointAddress,
          DB_NAME:constants.DB_NAME,
          DB_ARN: dbInstance.secret?.secretFullArn || '',
        }
      }
    );
  
  //adds appropirate policy to let lambda acceaa db 
  dbInstance.secret?.grantRead(userLambda);

// Create an API Gateway REST API with a URL that triggers the Lambda function
const api = new apigateway.RestApi(this, 'userAPI');
const integration = new apigateway.LambdaIntegration(userLambda);
api.root
      .addResource('identify')
      .addMethod('POST', integration);

// Output the URL for the API Gateway endpoint
new cdk.CfnOutput(this, 'URL', {
  value: api.url,
});
  }
}
