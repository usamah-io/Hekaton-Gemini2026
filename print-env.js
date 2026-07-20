console.log('Environment variables:');
for (const key of Object.keys(process.env)) {
  if (key.includes('GOOGLE') || key.includes('GEMINI') || key.includes('CLOUD') || key.includes('VERTEX')) {
    console.log(`${key}=${process.env[key]}`);
  }
}
