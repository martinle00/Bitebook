# AWS SSM Parameter Store Integration

This project is configured to load environment variables from AWS SSM Parameter Store.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure AWS Credentials

Make sure you have AWS credentials configured. You can do this in several ways:

#### Option A: AWS CLI Configuration
```bash
aws configure
```

#### Option B: Environment Variables
```bash
$env:AWS_ACCESS_KEY_ID="your-access-key"
$env:AWS_SECRET_ACCESS_KEY="your-secret-key"
$env:AWS_REGION="us-east-1"
```

#### Option C: AWS Profile
```bash
$env:AWS_PROFILE="your-profile-name"
```

### 3. Create SSM Parameters

Store your parameters in AWS SSM Parameter Store with the following structure:

```bash
# Using AWS CLI
aws ssm put-parameter `
  --name "/bitebook/frontend/VITE_GOOGLE_MAPS_API_KEY" `
  --value "your-google-maps-api-key" `
  --type "SecureString" `
  --region us-east-1

# Add more parameters as needed
```

### 4. Configure Parameter Path (Optional)

By default, parameters are fetched from `/bitebook/frontend/`. To use a different path:

```bash
$env:SSM_PARAMETER_PATH="/your/custom/path"
```

## Usage

### Development with SSM
```bash
npm run dev
```
This will:
1. Fetch parameters from AWS SSM
2. Write them to `.env` file
3. Start the Vite dev server

### Build with SSM
```bash
npm run build
```

### Local Development (without SSM)
If you want to develop locally without SSM, use:
```bash
npm run dev:local
```
This requires a manually created `.env` file.

## Environment Variables

The following environment variables are loaded from SSM:

- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API Key

To add more variables, edit `scripts/load-ssm-params.js` and add them to the `PARAMETERS` array.

## Configuration Options

### Environment Variables for SSM Script

- `SSM_PARAMETER_PATH` - Base path for SSM parameters (default: `/bitebook/frontend`)
- `AWS_REGION` - AWS region (default: `us-east-1`)

## IAM Permissions Required

Your AWS user/role needs the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters"
      ],
      "Resource": "arn:aws:ssm:*:*:parameter/bitebook/frontend/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "kms:Decrypt"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "kms:ViaService": "ssm.*.amazonaws.com"
        }
      }
    }
  ]
}
```

## Troubleshooting

### Parameters not loading
- Verify AWS credentials are configured correctly
- Check IAM permissions
- Verify parameter names match exactly (case-sensitive)
- Check the AWS region matches where your parameters are stored

### Local development without AWS
- Use `npm run dev:local` instead of `npm run dev`
- Create a `.env` file manually with your variables
