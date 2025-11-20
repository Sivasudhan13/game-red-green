const dotenv = require("dotenv");
const path = require("path");

// Load .env file
dotenv.config({ path: path.join(__dirname, "../.env") });

console.log("🔍 Verifying Backend Environment Variables...\n");

const requiredVars = [
  {
    name: "MONGODB_URI",
    required: true,
    description: "MongoDB connection string",
    validator: (val) => val && (val.startsWith("mongodb://") || val.startsWith("mongodb+srv://")),
  },
  {
    name: "JWT_SECRET",
    required: true,
    description: "JWT secret key for token encryption",
    validator: (val) => val && val.length >= 32,
  },
  {
    name: "RAZORPAY_KEY_ID",
    required: true,
    description: "Razorpay API key ID",
    validator: (val) => val && val.length >= 10,
  },
  {
    name: "RAZORPAY_KEY_SECRET",
    required: true,
    description: "Razorpay API key secret",
    validator: (val) => val && val.length >= 10,
  },
  {
    name: "PORT",
    required: false,
    description: "Server port (optional, defaults to 5000)",
    validator: (val) => !val || (!isNaN(val) && parseInt(val) > 0),
  },
];

let allValid = true;
let missingCount = 0;
let invalidCount = 0;

console.log("📋 Environment Variables Status:\n");

requiredVars.forEach(({ name, required, description, validator }) => {
  const value = process.env[name];
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
    console.log(`   Current value: ${value.substring(0, 20)}...`);
    invalidCount++;
    allValid = false;
  } else {
    // Mask sensitive values
    let displayValue = value;
    if (name.includes("SECRET") || name.includes("KEY")) {
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
  console.log("✅ Backend is ready to run!\n");
  process.exit(0);
} else {
  console.log(`❌ Found ${missingCount} missing and ${invalidCount} invalid variables`);
  console.log("\n⚠️  Please check your backend/.env file and ensure all required variables are set correctly.\n");
  console.log("📖 See API_KEYS_REQUIRED.md for detailed setup instructions.\n");
  process.exit(1);
}






