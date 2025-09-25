import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const NFT_TABLE = process.env.NFT_TABLE || 'inet';
const NFT_NAMESPACE = process.env.NFT_NAMESPACE || 'chromecast';
const NFT_SET = process.env.NFT_SET || 'authorized_sessions';
const MOBILE_NETWORK = process.env.MOBILE_NETWORK || '192.168.10.0/24';
const CHROMECAST_NETWORK = process.env.CHROMECAST_NETWORK || '192.168.20.0/24';
const SERVER_IP = process.env.SERVER_HOST || '192.168.70.215';
const SERVER_PORT = process.env.SERVER_PORT || '3000';

export interface NftablesResult {
  success: boolean;
  output?: string;
  error?: string;
}

export async function nftInit(): Promise<NftablesResult> {
  try {
    // Create table
    await execAsync(`sudo nft add table ${NFT_TABLE} ${NFT_NAMESPACE}`);

    // Create set for authorized sessions
    await execAsync(
      `sudo nft add set ${NFT_TABLE} ${NFT_NAMESPACE} ${NFT_SET} '{ type ipv4_addr . ipv4_addr ; flags timeout ; }'`
    );

    // Create forward chain with default drop policy
    await execAsync(
      `sudo nft add chain ${NFT_TABLE} ${NFT_NAMESPACE} forward '{ type filter hook forward priority filter ; policy drop ; }'`
    );

    // Create input chain
    await execAsync(
      `sudo nft add chain ${NFT_TABLE} ${NFT_NAMESPACE} input '{ type filter hook input priority filter ; policy drop ; }'`
    );

    // Create output chain
    await execAsync(
      `sudo nft add chain ${NFT_TABLE} ${NFT_NAMESPACE} output '{ type filter hook output priority filter ; policy accept ; }'`
    );

    // Forward chain rules
    await execAsync(
      `sudo nft add rule ${NFT_TABLE} ${NFT_NAMESPACE} forward ct state established,related accept`
    );

    // Allow server access (management / API)
    await execAsync(
      `sudo nft add rule ${NFT_TABLE} ${NFT_NAMESPACE} forward ip saddr ${MOBILE_NETWORK} ip daddr ${SERVER_IP} tcp dport ${SERVER_PORT} accept`
    );
    
    await execAsync(
      `sudo nft add rule ${NFT_TABLE} ${NFT_NAMESPACE} forward ip saddr ${SERVER_IP} ip daddr ${MOBILE_NETWORK} ct state established,related accept`
    );

    // Allow authorized mobile-chromecast pairs
    await execAsync(
      `sudo nft add rule ${NFT_TABLE} ${NFT_NAMESPACE} forward ip saddr . ip daddr @${NFT_SET} accept`
    );

    // Input chain rules
    await execAsync(`sudo nft add rule ${NFT_TABLE} ${NFT_NAMESPACE} input iif lo accept`);
    await execAsync(`sudo nft add rule ${NFT_TABLE} ${NFT_NAMESPACE} input ct state established,related accept`);
    await execAsync(`sudo nft add rule ${NFT_TABLE} ${NFT_NAMESPACE} input tcp dport { 22, ${SERVER_PORT} } accept`);
    await execAsync(`sudo nft add rule ${NFT_TABLE} ${NFT_NAMESPACE} input ip protocol icmp accept`);

    return { success: true, output: 'NFTables rules initialized successfully' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function nftAddPair(
  mobileIp: string,
  chromecastIp: string,
  timeoutSec: number
): Promise<NftablesResult> {
  try {
    const pair = `{ ${mobileIp} . ${chromecastIp} timeout ${timeoutSec}s }`;
    const { stdout, stderr } = await execAsync(
      `sudo nft add element ${NFT_TABLE} ${NFT_NAMESPACE} ${NFT_SET} '${pair}'`
    );

    if (stderr) {
      return { success: false, error: stderr };
    }

    return { success: true, output: stdout };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function nftDeletePair(
  mobileIp: string,
  chromecastIp: string
): Promise<NftablesResult> {
  try {
    const pair = `{ ${mobileIp} . ${chromecastIp} }`;
    const { stdout, stderr } = await execAsync(
      `sudo nft delete element ${NFT_TABLE} ${NFT_NAMESPACE} ${NFT_SET} '${pair}'`
    );

    if (stderr && !stderr.includes('No such file or directory')) {
      return { success: false, error: stderr };
    }

    return { success: true, output: stdout };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function nftListPairs(): Promise<NftablesResult> {
  try {
    const { stdout, stderr } = await execAsync(
      `sudo nft list set ${NFT_TABLE} ${NFT_NAMESPACE} ${NFT_SET}`
    );

    if (stderr) {
      return { success: false, error: stderr };
    }

    return { success: true, output: stdout };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
