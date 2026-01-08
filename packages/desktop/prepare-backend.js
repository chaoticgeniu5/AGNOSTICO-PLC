const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const backendPath = path.join(__dirname, '../backend');
const tempNodeModules = path.join(__dirname, 'temp_node_modules');

console.log('Preparing backend dependencies...');

// Clean temp folder if exists
if (fs.existsSync(tempNodeModules)) {
  console.log('Cleaning temp folder...');
  fs.rmSync(tempNodeModules, { recursive: true, force: true });
}

// Create temp folder
fs.mkdirSync(tempNodeModules, { recursive: true });

// Copy package.json to temp
fs.copyFileSync(
  path.join(backendPath, 'package.json'),
  path.join(tempNodeModules, 'package.json')
);

// Copy prisma folder to temp (needed for prisma generate)
const prismaFolder = path.join(backendPath, 'prisma');
const tempPrismaFolder = path.join(tempNodeModules, 'prisma');
if (fs.existsSync(prismaFolder)) {
  console.log('Copying prisma schema...');
  fs.cpSync(prismaFolder, tempPrismaFolder, { recursive: true });
}

// Install dependencies in temp folder
console.log('Installing dependencies...');
execSync('npm install --production --legacy-peer-deps', {
  cwd: tempNodeModules,
  stdio: 'inherit'
});

// Remove package.json from temp (we only want node_modules)
fs.unlinkSync(path.join(tempNodeModules, 'package.json'));

console.log('Backend dependencies prepared successfully!');
