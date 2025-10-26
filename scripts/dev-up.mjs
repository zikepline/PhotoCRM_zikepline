#!/usr/bin/env node
import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function ensureSupabaseCli() {
  try {
    execSync('supabase --version', { stdio: 'pipe' });
  } catch {
    console.error('\nSupabase CLI не найден. Установите CLI: https://supabase.com/docs/guides/cli');
    console.error('Linux: curl -fsSL https://cli.supabase.com/install/linux | sh');
    process.exit(1);
  }
}

function startSupabase() {
  console.log('Запуск локального Supabase...');
  try {
    execSync('supabase start', { stdio: 'inherit' });
  } catch (e) {
    console.warn('supabase start завершился с сообщением. Возможно, уже запущен. Продолжаю...');
  }
}

function getSupabaseStatus() {
  const out = execSync('supabase status', { stdio: 'pipe' }).toString();
  return out;
}

function parseStatus(output) {
  const urlMatch = output.match(/API URL:\s*(\S+)/i);
  const anonMatch = output.match(/(?:anon key|Publishable key):\s*(\S+)/i);
  return { url: urlMatch?.[1], anon: anonMatch?.[1] };
}

function updateEnv({ url, anon }) {
  const envPath = path.join(process.cwd(), '.env.local');
  let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

  const setVar = (name, value) => {
    const re = new RegExp(`^${name}=.*$`, 'm');
    if (re.test(content)) {
      content = content.replace(re, `${name}=${value}`);
    } else {
      if (content && !content.endsWith('\n')) content += '\n';
      content += `${name}=${value}\n`;
    }
  };

  setVar('VITE_SUPABASE_URL', url);
  setVar('VITE_SUPABASE_PUBLISHABLE_KEY', anon);

  fs.writeFileSync(envPath, content, 'utf8');
  console.log(`Обновлён ${envPath} с локальными переменными Supabase.`);
}

(async () => {
  ensureSupabaseCli();

  startSupabase();

  const status = getSupabaseStatus();
  const { url, anon } = parseStatus(status);

  if (!url || !anon) {
    console.error('\nНе удалось распарсить вывод "supabase status".');
    console.error('Проверьте, что Supabase запущен (supabase start), затем задайте вручную:');
    console.error('- VITE_SUPABASE_URL');
    console.error('- VITE_SUPABASE_PUBLISHABLE_KEY');
    process.exit(1);
  }

  updateEnv({ url, anon });

  console.log('Запуск Vite dev-сервера...');
  const child = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  const forward = (signal) => {
    try { child.kill(signal); } catch {}
  };
  process.on('SIGINT', forward);
  process.on('SIGTERM', forward);

  child.on('exit', (code) => process.exit(code ?? 0));
})();
