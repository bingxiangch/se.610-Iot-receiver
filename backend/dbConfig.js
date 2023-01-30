const env = process.env

const config = {
  createDatabase: env.DB_CREATE_DATABASE || true,
  host: env.DB_HOST || 'localhost',
  port: env.DB_PORT || '5432',
  user: env.DB_USER || 'postgres',
  password: env.DB_PASSWORD || 'postgres',
  database: env.DB_NAME || 'iot_receiver',
  adminUser: env.DB_ADMIN_NAME || 'postgres',
  adminPass: env.DB_ADMIN_PASS || '*******'

}

module.exports = config
