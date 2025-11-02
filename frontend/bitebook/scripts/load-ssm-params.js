import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const AWS_REGION = process.env.AWS_REGION || 'ap-southeast-2';

// Map SSM parameter names to environment variable names
const PARAMETERS = {
  'GoogleMapsApiKey': 'VITE_GOOGLE_MAPS_API_KEY',
};

async function fetchSSMParameter(client, parameterName) {
  try {
    const command = new GetParameterCommand({
      Name: parameterName,
      WithDecryption: true,
    });
    
    const response = await client.send(command);
    return response.Parameter?.Value;
  } catch (error) {
    console.warn(`Warning: Could not fetch ${parameterName} from SSM:`, error.message);
    return null;
  }
}

async function loadSSMParameters() {
  console.log('Loading parameters from AWS SSM Parameter Store...');
  console.log(`Region: ${AWS_REGION}`);
  
  const client = new SSMClient({ region: AWS_REGION });
  const envVars = {};
  
  for (const [ssmParamName, envVarName] of Object.entries(PARAMETERS)) {
    const value = await fetchSSMParameter(client, ssmParamName);
    if (value) {
      envVars[envVarName] = value;
      console.log(`✓ Loaded ${ssmParamName} -> ${envVarName}`);
    } else {
      console.log(`✗ Skipped ${ssmParamName}`);
    }
  }
  
  // Write to .env file
  const envContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const envPath = join(__dirname, '..', '.env');
  writeFileSync(envPath, envContent + '\n');
  
  console.log(`\n✓ Environment variables written to .env`);
  console.log(`Total parameters loaded: ${Object.keys(envVars).length}`);
}

// Run the script
loadSSMParameters().catch((error) => {
  console.error('Error loading SSM parameters:', error);
  process.exit(1);
});
