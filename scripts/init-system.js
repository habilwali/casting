#!/usr/bin/env node

/**
 * System Initialization Script
 * Sets up NFTables rules and initializes the Chromecast Gateway system
 */

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const NFT_TABLE = process.env.NFT_TABLE || 'inet';
const NFT_NAMESPACE = process.env.NFT_NAMESPACE || 'chromecast';
const NFT_SET = process.env.NFT_SET || 'authorized_sessions';
const MOBILE_NETWORK = process.env.MOBILE_NETWORK || '192.168.10.0/24';
const CHROMECAST_NETWORK = process.env.CHROMECAST_NETWORK || '192.168.20.0/24';

async function runCommand(command, description) {
  try {
    console.log(`📋 ${description}...`);
    await execAsync(command);
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.log(`⚠️  ${description} failed (may already exist): ${error.message}`);
  }
}

async function initializeNFTables() {
  console.log('🔧 Initializing NFTables rules...\n');

  // Create table
  await runCommand(
    `sudo nft add table ${NFT_TABLE} ${NFT_NAMESPACE}`,
    'Creating NFTables table'
  );

  // Create set for authorized sessions
  await runCommand(
    `sudo nft add set ${NFT_TABLE} ${NFT_NAMESPACE} ${NFT_SET} '{ type ipv4_addr . ipv4_addr ; flags timeout ; }'`,
    'Creating authorized sessions set'
  );

  // Create forward chain with default drop policy
  await runCommand(
    `sudo nft add chain ${NFT_TABLE} ${NFT_NAMESPACE} forward '{ type filter hook forward priority filter ; policy drop ; }'`,
    'Creating forward chain'
  );

  // Create input chain
  await runCommand(
    `sudo nft add chain ${NFT_TABLE} ${NFT_NAMESPACE} input '{ type filter hook input priority filter ; policy drop ; }'`,
    'Creating input chain'
  );

  // Create output chain
  await runCommand(
    `sudo nft add chain ${NFT_TABLE} ${NFT_NAMESPACE} output '{ type filter hook output priority filter ; policy accept ; }'`,
    'Creating output chain'
  );

  // Forward chain rules
  await runCommand(
    `sudo nft add rule ${NFT_TABLE} ${NFT_NAMESPACE} forward ct state established,related accept`,
    'Adding established connections rule'
  );

  // Allow server access (management / API)
  await runCommand(
    `sudo nft add rule ${NFT_TABLE} ${NFT_NAMESPACE} forward ip saddr ${MOBILE_NETWORK} ip daddr 192.168.70.215 tcp dport ${SERVER_PORT} accept`,
    'Adding server access rule'
  );

  await runCommand(
    `sudo nft add rule ${NFT_TABLE} ${NFT_NAMESPACE} forward ip saddr 192.168.70.215 ip daddr ${MOBILE_NETWORK} ct state established,related accept`,
    'Adding server response rule'
  );

  // Allow authorized mobile-chromecast pairs
  await runCommand(
    `sudo nft add rule ${NFT_TABLE} ${NFT_NAMESPACE} forward ip saddr . ip daddr @${NFT_SET} accept`,
    'Adding authorized pairs rule'
  );

  // Input chain rules
  await runCommand(
    `sudo nft add rule ${NFT_TABLE} ${NFT_NAMESPACE} input iif lo accept`,
    'Adding loopback rule'
  );

  await runCommand(
    `sudo nft add rule ${NFT_TABLE} ${NFT_NAMESPACE} input ct state established,related accept`,
    'Adding established input rule'
  );

  await runCommand(
    `sudo nft add rule ${NFT_TABLE} ${NFT_NAMESPACE} input tcp dport { 22, ${SERVER_PORT} } accept`,
    'Adding SSH and API access rule'
  );

  await runCommand(
    `sudo nft add rule ${NFT_TABLE} ${NFT_NAMESPACE} input ip protocol icmp accept`,
    'Adding ICMP rule'
  );

  console.log('\n🎉 NFTables initialization completed!\n');
}

async function showNetworkInfo() {
  console.log('📊 Network Configuration:');
  console.log(`   Mobile Network: ${MOBILE_NETWORK}`);
  console.log(`   Chromecast Network: ${CHROMECAST_NETWORK}`);
  console.log(`   NFTables Table: ${NFT_TABLE}.${NFT_NAMESPACE}`);
  console.log(`   Authorized Set: ${NFT_SET}\n`);
}

async function main() {
  console.log('🚀 Chromecast Gateway System Initialization\n');
  
  await showNetworkInfo();
  await initializeNFTables();
  
  console.log('✨ System initialization complete!');
  console.log('   You can now start the application with: npm run dev');
  console.log('   Access the admin panel at: http://localhost:3000/admin\n');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { initializeNFTables, showNetworkInfo };
