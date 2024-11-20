import { exec } from 'child_process';
import { promisify } from 'util';
import { dirname, resolve } from 'path';
import { readdir } from 'fs/promises';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const execAsync = promisify(exec);

interface TestResult {
  file: string;
  success: boolean;
  error?: string;
  output?: string;
}

async function findExampleFiles(dir: string): Promise<string[]> {
  const examplesDir = resolve(__dirname, dir);
  const files = await readdir(examplesDir, { recursive: true });
  
  return files
    .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
    .map(file => resolve(examplesDir, file));
}

async function runExample(file: string): Promise<TestResult> {
  try {
    const { stdout, stderr } = await execAsync(`tsx "${file}"`, {
      env: {
        ...process.env,
        NODE_ENV: 'test',
      }
    });

    // Check if the output contains error messages
    const output = stdout + stderr;
    const hasError = output.toLowerCase().includes('error:') || 
                    output.toLowerCase().includes('exception:') ||
                    stderr.length > 0;

    return {
      file,
      success: !hasError,
      output,
      error: hasError ? output : undefined
    };
  } catch (error) {
    return {
      file,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      output: error instanceof Error && 'stdout' in error ? 
        (error as any).stdout : undefined
    };
  }
}

async function runAllExamples(): Promise<void> {
  try {
    const files = await findExampleFiles('../../examples');
    console.log(chalk.blue(`Found ${files.length} example files to test\n`));

    const results = await Promise.all(files.map(runExample));
    
    // Print results summary
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log('\n=== Test Results Summary ===');
    console.log(chalk.green(`✓ ${successful.length} examples passed:`));
    successful.forEach(result => {
      const fileName = result.file.split('/').pop() || result.file;
      console.log(chalk.green(`  ✓ ${fileName}`));
    });
    
    if (failed.length > 0) {
      console.log(chalk.red(`\n✗ ${failed.length} examples failed:`));
      failed.forEach(result => {
        const fileName = result.file.split('/').pop() || result.file;
        console.log(chalk.red(`  ✗ ${fileName}`));
      });
    }

    // Detailed output section
    if (successful.length > 0) {
      console.log('\n=== Successful Examples Output ===');
      successful.forEach(result => {
        const fileName = result.file.split('/').pop() || result.file;
        console.log(chalk.green(`\n[${fileName}]:`));
        console.log(chalk.gray(result.output));
      });
    }
    
    if (failed.length > 0) {
      console.log('\n=== Failed Examples Details ===');
      failed.forEach(result => {
        const fileName = result.file.split('/').pop() || result.file;
        console.log(chalk.red(`\n[${fileName}]:`));
        console.log(chalk.gray(result.error));
        if (result.output) {
          console.log('\nOutput:');
          console.log(chalk.gray(result.output));
        }
      });
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error(chalk.red('Failed to run examples:'), error);
    process.exit(1);
  }
}

// Run the tests
runAllExamples().catch(error => {
  console.error(chalk.red('Unexpected error:'), error);
  process.exit(1);
});