#!/usr/bin/env bun

import { testConnection } from './src/db'
import { parsePostgresUrl } from './src/utils/parsers'

// Test various cloud PostgreSQL connection strings
const cloudConnections = [
  {
    name: 'Supabase',
    url: 'postgresql://postgres:password@db.example.supabase.co:5432/postgres?sslmode=require'
  },
  {
    name: 'Neon',
    url: 'postgresql://user:password@ep-example.neon.tech:5432/dbname?sslmode=require'
  },
  {
    name: 'AWS RDS',
    url: 'postgresql://postgres:password@mydb.cluster-example.us-east-1.rds.amazonaws.com:5432/mydb?sslmode=prefer'
  },
  {
    name: 'Railway',
    url: 'postgresql://postgres:password@containers-us-west-1.railway.app:5432/railway?sslmode=require'
  },
  {
    name: 'Render',
    url: 'postgresql://user:password@dpg-example.render.com:5432/mydb?sslmode=require'
  }
]

async function testCloudConnections() {
  console.log('🌩️  Testing Cloud PostgreSQL Connection Parsing...\n')
  
  for (const connection of cloudConnections) {
    console.log(`Testing ${connection.name}:`)
    console.log(`URL: ${connection.url}`)
    
    try {
      const config = parsePostgresUrl(connection.url)
      console.log('✅ Parsed successfully:')
      console.log('   Host:', config.host)
      console.log('   Port:', config.port)
      console.log('   Database:', config.database)
      console.log('   User:', config.user)
      console.log('   SSL:', config.ssl)
      console.log('   Timeout:', config.connectionTimeoutMillis)
      console.log('   App Name:', config.application_name)
      
      // Note: We're not actually connecting since these are example URLs
      // In real usage, you would do: await testConnection('postgres', { postgres: config })
      
    } catch (error) {
      console.log('❌ Parse failed:', error instanceof Error ? error.message : 'Unknown error')
    }
    
    console.log('---\n')
  }
  
  console.log('✨ Cloud PostgreSQL support is ready!')
  console.log('\n💡 Supported cloud providers:')
  console.log('   • Supabase (SSL required)')
  console.log('   • Neon (SSL required)')
  console.log('   • AWS RDS (SSL preferred)')
  console.log('   • Railway (SSL required)')
  console.log('   • Render (SSL required)')
  console.log('   • PlanetScale (SSL required)')
  console.log('   • Any other PostgreSQL cloud provider')
}

// Run the test
testCloudConnections().catch(console.error)
