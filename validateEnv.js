// Fails fast with a clear, human-readable message instead of letting a
// missing/blank env var surface later as a cryptic low-level crash
// (e.g. mongoose's `uri must be a string, got "undefined"`).
const REQUIRED = ["MONGO_URI", "JWT_SECRET"];

export const validateEnv = () => {
  const missing = REQUIRED.filter((key) => !process.env[key] || process.env[key].trim() === "");

  if (missing.length > 0) {
    console.error("\n✗ Cannot start the server — missing required environment variable(s):\n");
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error(`
This usually means you haven't created a .env file yet. From the backend/ folder, run:

   cp .env.example .env

Then open .env and fill in at least MONGO_URI (your MongoDB connection string)
and JWT_SECRET (any long random string). See backend/.env.example for details.
`);
    process.exit(1);
  }

  if (process.env.JWT_SECRET.length < 16) {
    console.error(
      "\n✗ JWT_SECRET is too short. Use a long, random string (32+ characters) — " +
        "for example, run `openssl rand -hex 32` and paste the result into .env.\n"
    );
    process.exit(1);
  }
};
