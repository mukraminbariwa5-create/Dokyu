/**
 * `pnpm phone`: runs the app in Expo Go on a real phone, using the live server (dokyu.onrender.com),
 * through an Expo tunnel so the phone and computer don't need the same Wi-Fi. Scan the QR code with
 * the Expo Go app (Android: Play Store, SDK 58). Works the same on Windows, macOS and Linux.
 */
import { spawn } from 'node:child_process';

const env = { ...process.env, EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://dokyu.onrender.com' };
console.log(`Dokyu on your phone: server ${env.EXPO_PUBLIC_API_URL}\nOpen Expo Go and scan the QR code below.\n`);
const child = spawn('npx', ['expo', 'start', '--tunnel', '--go'], { stdio: 'inherit', shell: true, env });
child.on('exit', (code) => process.exit(code ?? 0));
