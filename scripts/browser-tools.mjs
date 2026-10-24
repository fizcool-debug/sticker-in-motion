import path from 'node:path';
export const browserOptions = () => ({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}) });
export const appUrl = process.env.APP_URL || process.env.CET_TEST_ORIGIN || 'http://localhost:5173';
export const adbPath = () => process.env.ADB_PATH || ((process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT) ? path.join(process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT, 'platform-tools', process.platform === 'win32' ? 'adb.exe' : 'adb') : 'adb');
