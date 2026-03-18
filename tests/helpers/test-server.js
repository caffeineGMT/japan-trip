// Test server helper for programmatic control
const { spawn } = require('child_process');
const fetch = require('node-fetch');

class TestServer {
  constructor(port = 3001) {
    this.port = port;
    this.url = `http://localhost:${port}`;
    this.process = null;
  }

  /**
   * Start the test server
   */
  async start() {
    if (this.process) {
      throw new Error('Server already running');
    }

    return new Promise((resolve, reject) => {
      this.process = spawn('node', ['server.js'], {
        env: {
          ...process.env,
          NODE_ENV: 'test',
          PORT: this.port
        },
        stdio: 'pipe'
      });

      this.process.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Server running') || output.includes('listening')) {
          this.waitForReady().then(resolve).catch(reject);
        }
      });

      this.process.stderr.on('data', (data) => {
        console.error('Server error:', data.toString());
      });

      this.process.on('error', (error) => {
        reject(error);
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.process && !this.isReady) {
          this.stop();
          reject(new Error('Server failed to start within 10 seconds'));
        }
      }, 10000);
    });
  }

  /**
   * Wait for server to be ready
   */
  async waitForReady(maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(this.url);
        if (response.ok) {
          this.isReady = true;
          return true;
        }
      } catch (error) {
        // Server not ready yet
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error('Server did not become ready');
  }

  /**
   * Stop the test server
   */
  stop() {
    if (this.process) {
      this.process.kill('SIGTERM');
      this.process = null;
      this.isReady = false;
    }
  }

  /**
   * Check if server is running
   */
  async isRunning() {
    try {
      const response = await fetch(this.url);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

module.exports = TestServer;
