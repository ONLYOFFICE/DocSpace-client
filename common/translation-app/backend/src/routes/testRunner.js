/**
 * Test Runner Routes
 *
 * Endpoints for executing translation tests
 */
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs-extra");

/**
 * Registers API routes for test runner functionality
 * @param {object} fastify - Fastify instance
 */
async function testRunnerRoutes(fastify) {
  // Get test report file
  fastify.get("/api/tests/report", async (request, reply) => {
    try {
      // Get app root path
      const appRootPath = path.resolve(__dirname, "../../../../..");
      const testsDir = path.join(appRootPath, "common/tests");
      const reportPath = path.join(testsDir, "reports/tests-results.html");

      // Check if report exists
      if (!fs.existsSync(reportPath)) {
        return reply.code(404).send({ error: "Test report not found" });
      }

      // Set content type and return the file
      reply.type("text/html");
      return fs.createReadStream(reportPath);
    } catch (error) {
      console.error("Error serving test report:", error);
      return reply.code(500).send({ error: "Failed to serve test report" });
    }
  });
  // Execute tests
  fastify.post("/api/tests/run", async (request, reply) => {
    try {
      const { testType } = request.body;

      // Validate test type
      if (!["only-base-languages", "skip-base-languages"].includes(testType)) {
        return reply.code(400).send({
          success: false,
          error:
            "Invalid test type. Allowed: only-base-languages, skip-base-languages",
        });
      }

      // Determine test command based on type
      const testCommand = `npm run test:${testType}`;
      console.log(`Running test: ${testCommand}`);

      // Construct absolute path to tests directory
      // Current file path: /client/common/translation-app/backend/src/routes/testRunner.js
      // Need to navigate to: /client/common/tests
      const appRootPath = path.resolve(__dirname, "../../../../..");
      const testsDir = path.join(appRootPath, "common/tests");

      console.log(`App root path: ${appRootPath}`);
      console.log(`Resolved tests directory: ${testsDir}`);

      // Make sure the directory exists
      if (!fs.existsSync(testsDir)) {
        return reply.code(500).send({
          success: false,
          error: `Tests directory not found: ${testsDir}`,
        });
      }

      console.log(`Tests directory: ${testsDir}`);

      // Execute command as a promise
      const executeCommand = (command, args, workDir) => {
        return new Promise((resolve, reject) => {
          console.log(`Executing in ${workDir}: ${command} ${args.join(" ")}`);

          const proc = spawn(command, args, {
            cwd: workDir,
            shell: true,
            stdio: "pipe",
          });

          let stdout = "";
          let stderr = "";

          proc.stdout.on("data", (data) => {
            const output = data.toString();
            stdout += output;
            console.log(output);
          });

          proc.stderr.on("data", (data) => {
            const output = data.toString();
            stderr += output;
            console.error(output);
          });

          proc.on("close", (code) => {
            if (code === 0) {
              resolve({ stdout, stderr });
            } else {
              reject({ code, stdout, stderr });
            }
          });

          proc.on("error", (err) => {
            reject({ error: err, stdout, stderr });
          });
        });
      };

      try {
        // // First ensure npm dependencies are installed
        // console.log("Installing test dependencies...");
        // const installResult = await executeCommand(
        //   "npm",
        //   ["install"],
        //   testsDir
        // );
        // console.log(
        //   "Install completed",
        //   installResult ? "successfully" : "with issues"
        // );

        let testResult;
        let testSuccess = true;
        let testStdout = "";
        let testStderr = "";

        try {
          // Then run the test command
          console.log(`Executing test command: ${testCommand}`);
          testResult = await executeCommand(
            "npm",
            ["run", `test:${testType}`],
            testsDir
          );

          // Extract stdout and stderr from the result
          testStdout = testResult ? testResult.stdout : "";
          testStderr = testResult ? testResult.stderr : "";
        } catch (testError) {
          // Test command failed, but we'll still check for the report
          testSuccess = false;
          console.log("Test execution completed with errors");

          testStdout = testError.stdout || "";
          testStderr = testError.stderr || "";
          console.error("Test error:", testError);
        }

        // Log output
        console.log("Test execution completed");
        if (testStderr) {
          console.log("--- stderr ---");
          console.log(testStderr);
        }

        // Check if report file exists regardless of command success
        const reportPath = path.join(testsDir, "reports/tests-results.html");
        const reportExists = fs.existsSync(reportPath);

        // Always return report URL if the file exists
        return {
          success: true,
          testSuccess: testSuccess,
          reportUrl: reportExists
            ? `http://localhost:3001/api/tests/report`
            : null,
          reportExists: reportExists,
          testType,
          output: testStdout,
          hasErrors: !testSuccess,
          errorOutput: testStderr,
        };
      } catch (execError) {
        console.error("Error executing dependency installation:", execError);
        return reply.code(500).send({
          success: false,
          error: `Test setup failed: ${
            execError.error ? execError.error.message : "Unknown error"
          }`,
          stdout: execError.stdout || "",
          stderr: execError.stderr || "",
        });
      }
    } catch (error) {
      console.error("Error handling test run request:", error);
      return reply.code(500).send({
        success: false,
        error: "Internal server error while running tests",
      });
    }
  });
}

module.exports = testRunnerRoutes;
