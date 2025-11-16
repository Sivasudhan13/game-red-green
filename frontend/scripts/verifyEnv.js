// Frontend Environment Variables Verification
// Note: This runs in Node.js context, not browser

const fs = require("fs");
const path = require("path");

console.log("🔍 Verifying Frontend Environment Variables...\n");

const envPath = path.join(__dirname, "../.env");

if (!fs.existsSync(envPath)) {
  console.log("❌ .env file not found at frontend/.env");
  console.log("⚠️  Please create frontend/.env file\n");
  process.exit(1);
}

// Read .env file
const envContent = fs.readFileSync(envPath, "utf8");
const envLines = envContent.split("\n");

const envVars = {};
envLines.forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const [key, ...valueParts] = trimmed.split("=");
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
    }
  }
});

const requiredVars = [
  {
    name: "REACT_APP_API_URL",
    required: true,
    description: "Backend API URL",
    validator: (val) => val && (val.startsWith("http://") || val.startsWith("https://")),
  },
  {
    name: "REACT_APP_STRIPE_PUBLISHABLE_KEY",
    required: true,
    description: "Stripe publishable API key",
    validator: (val) => val && (val.startsWith("pk_test_") || val.startsWith("pk_live_")),
  },
];

let allValid = true;
let missingCount = 0;
let invalidCount = 0;

console.log("📋 Environment Variables Status:\n");

requiredVars.forEach(({ name, required, description, validator }) => {
  const value = envVars[name];
  const isSet = value !== undefined && value !== "";
  const isValid = isSet && validator(value);

  if (!isSet) {
    if (required) {
      console.log(`❌ ${name}: MISSING (Required)`);
      console.log(`   Description: ${description}`);
      missingCount++;
      allValid = false;
    } else {
      console.log(`⚠️  ${name}: Not set (Optional)`);
      console.log(`   Description: ${description}`);
    }
  } else if (!isValid) {
    console.log(`⚠️  ${name}: INVALID FORMAT`);
    console.log(`   Description: ${description}`);
    console.log(`   Current value: ${value.substring(0, 30)}...`);
    invalidCount++;
    allValid = false;
  } else {
    // Mask sensitive values
    let displayValue = value;
    if (name.includes("KEY")) {
      if (value.length > 20) {
        displayValue = `${value.substring(0, 10)}...${value.substring(value.length - 4)}`;
      } else {
        displayValue = "***";
      }
    }
    console.log(`✅ ${name}: Set correctly`);
    console.log(`   Value: ${displayValue}`);
  }
  console.log();
});

console.log("─".repeat(60));
console.log("\n📊 Summary:\n");

if (allValid) {
  console.log("✅ All required environment variables are properly configured!");
  console.log("✅ Frontend is ready to run!\n");
  console.log("⚠️  Note: Restart React dev server if you just added/updated .env file\n");
  process.exit(0);
} else {
  console.log(`❌ Found ${missingCount} missing and ${invalidCount} invalid variables`);
  console.log("\n⚠️  Please check your frontend/.env file and ensure all required variables are set correctly.\n");
  console.log("📖 See API_KEYS_REQUIRED.md for detailed setup instructions.\n");
  process.exit(1);
}





