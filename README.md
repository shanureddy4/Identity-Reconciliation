# Identigy-Reconciliation

Used Technologies:
AWS resources -> lambda, secret manager, rds (MySQL) and VPC
AWS CDK -> to deploy aws stack
Typescript

exposed URL: https://z1aeq9invc.execute-api.us-east-1.amazonaws.com/prod/identify  
typical response
![image](https://github.com/shanureddy4/Identity-Reconciliation/assets/40113605/9e0767f1-3588-439e-9c09-009a97210b94)

Brief :
Used AWS to deploy lambda and MySQL. Created VPC with public, private, and isolated (aws cdk terms). Isolated MySql DB so that only lambda will communicate to it.
Typescript is used to deploy the infrastructure.

