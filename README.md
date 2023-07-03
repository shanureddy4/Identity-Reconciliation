# Identity-Reconciliation

### Used Technologies:  
1. AWS resources
    - Lambda
    - Secret Manager
    - RDS (MySQL)
    - VPC  
2. AWS CDK - to deploy aws stack  
3. Typescript  

### Brief :  
1. Used AWS as a cloud service for **Faas(Lambda)** and for **Database(RDS)**. Created **VPC** with public, private, and isolated (aws cdk terms) subnets. Isolated MySql DB so that only lambda will communicate to it. **Secret Manager** is used to store the database credentials.
2. Typescript is used to deploy the infrastructure.

### exposed URL: https://z1aeq9invc.execute-api.us-east-1.amazonaws.com/prod/identify  
#### Typical Request:  

![image](https://github.com/shanureddy4/Identity-Reconciliation/assets/40113605/9e0767f1-3588-439e-9c09-009a97210b94)  

#### video
https://github.com/shanureddy4/Identity-Reconciliation/assets/40113605/54178b5c-adc8-4e78-8aaf-c40539dd8c26





