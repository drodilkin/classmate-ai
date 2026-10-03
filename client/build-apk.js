#!/usr/bin/env node
/**
 * build-apk.js — Собирает APK для ClassMate AI
 * Запуск: node build-apk.js
 * 
 * Требования:
 *   - Android Studio установлена
 *   - ANDROID_HOME или ANDROID_SDK_ROOT переменная задана
 *   - Java JDK 17+ установлена
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const clientDir = __dirname;
const androidDir = path.join(clientDir, 'android');

function run(cmd, cwd = clientDir) {
  console.log(`\n▶ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd });
}

console.log('🎓 ClassMate AI — сборка APK\n');
console.log('═'.repeat(40));

// Step 1: Build web
console.log('\n[1/3] Сборка веб-приложения...');
run('npm run build');

// Step 2: Sync Capacitor
console.log('\n[2/3] Синхронизация с Android...');
run('npx cap sync android');

// Step 3: Build APK
console.log('\n[3/3] Сборка APK...');
const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
run(`${gradlew} assembleDebug`, androidDir);

// Find APK
const apkPath = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
if (fs.existsSync(apkPath)) {
  const dest = path.join(clientDir, '..', 'ClassMateAI.apk');
  fs.copyFileSync(apkPath, dest);
  console.log('\n✅ APK готов!');
  console.log(`📦 Файл: ${dest}`);
  console.log('\nУстановка на телефон:');
  console.log('  adb install ClassMateAI.apk');
  console.log('  — или перекинь файл на телефон и открой\n');
} else {
  console.log('\n❌ APK не найден. Проверь ошибки выше.');
}
