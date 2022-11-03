module.exports = {
  apps : [{
    name: 'Js3Multiplayer',
    script: './server.js',
    instances: 'max',
    env: {
      NODE_ENV: 'development',
    },
    env_production: {
      NODE_ENV: 'production',
    }
  }]
}