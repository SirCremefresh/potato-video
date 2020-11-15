export default () => ({
  production: !(process.env.PRODUCTION === 'false'),
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || ''),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  },
});
