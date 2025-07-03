const { MSICreator } = require('electron-wix-msi');
const path = require('path');

// Define paths
const APP_DIR = path.resolve(__dirname, './dist/win-unpacked');
const OUT_DIR = path.resolve(__dirname, '../installer');
const ICON_PATH = path.resolve(__dirname, 'ISAClogo.ico'); // Your custom icon

// Instantiate the MSICreator
const msiCreator = new MSICreator({
  appDirectory: APP_DIR,
  outputDirectory: OUT_DIR,
  description: 'Your App Description',
  exe: 'I.S.A.C', // Without .exe
  name: 'YourAppName',
  manufacturer: 'YourCompany',
  version: '1.0.0',
  icon: ICON_PATH,
  ui: {
    chooseDirectory: true
  }
});

async function buildInstaller() {
  // Create .wxs template
  await msiCreator.create();
  // Compile the template to an MSI
  await msiCreator.compile();
  console.log('MSI Installer created successfully!');
}

buildInstaller().catch(err => {
  console.error('Error creating MSI installer:', err);
});