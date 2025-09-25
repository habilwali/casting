import { exec } from 'child_process';
import { Socket } from 'net';
import mdns from 'multicast-dns';

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]) as Promise<T>;
}

// Promise.any polyfill using allSettled (returns first fulfilled value or rejects)
async function promiseAny<T>(promises: Promise<T>[]): Promise<T> {
  const results = await Promise.allSettled(promises);
  for (const r of results) {
    if (r.status === 'fulfilled') return r.value;
  }
  throw new Error('All promises were rejected');
}

function icmpPing(ip: string): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const cmd = process.platform === 'win32' ? `ping -n 1 -w 1500 ${ip}` : `ping -c 1 -W 1 ${ip}`;
    exec(cmd, (err) => {
      resolve(!err);
    });
  }).catch(() => false);
}

function tcpProbe(ip: string, port: number, timeoutMs = 1000): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const socket = new Socket();
    let settled = false;

    const settle = (ok: boolean) => {
      if (settled) return;
      settled = true;
      try { socket.destroy(); } catch {}
      resolve(ok);
    };

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => settle(true));
    socket.once('timeout', () => settle(false));
    socket.once('error', () => settle(false));
    socket.connect(port, ip);
  });
}

function mdnsCheck(targetIp: string, timeoutMs = 1500): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        try { md.destroy(); } catch {}
        resolve(false);
      }
    }, timeoutMs);

    const md = mdns();
    md.on('response', (packet: any) => {
      if (resolved) return;
      const answers = [...(packet.answers || []), ...(packet.additionals || [])];
      const match = answers.some((ans: any) => {
        if (typeof ans.data === 'string') return ans.data === targetIp;
        if (ans.data && ans.data.data) return ans.data.data === targetIp;
        return false;
      });
      if (match) {
        resolved = true;
        clearTimeout(timer);
        try { md.destroy(); } catch {}
        resolve(true);
      }
    });

    md.query({ questions: [{ name: '_googlecast._tcp.local', type: 'PTR' }] });
  }).catch(() => false);
}

export async function isChromecastReachable(ip: string): Promise<boolean> {
  const ports = [8008, 8009, 8443];

  // Run strategies with timeouts in parallel
  const tcpAny = promiseAny(ports.map((p) => tcpProbe(ip, p, 1000))).catch(() => false);
  const [tcpOk, icmpOk, mdnsOk] = await Promise.all([
    withTimeout(tcpAny, 1200).catch(() => false),
    withTimeout(icmpPing(ip), 1200).catch(() => false),
    withTimeout(mdnsCheck(ip, 1300), 1300).catch(() => false),
  ]);

  return Boolean(tcpOk || icmpOk || mdnsOk);
}
