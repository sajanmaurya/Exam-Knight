const { Sequelize } = require('sequelize');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
require('dotenv').config();

// Use WebSocket (port 443) instead of raw TCP (port 5432)
// This bypasses firewall restrictions on port 5432
neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true;

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectModule: require('pg'),
  dialectOptions: {
    ...(process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('@db:') ? {} : { ssl: { require: true, rejectUnauthorized: true } }),
  },
  pool: {
    max: 3,
    min: 0,
    acquire: 60000,
    idle: 30000,
  },
});

module.exports = sequelize;
