module.exports = {
  plugins: [
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    ['@babel/plugin-proposal-class-properties', {loose: true}],
    '@babel/plugin-proposal-numeric-separator',
  ],
  presets: [
    ['@babel/preset-env', {targets: {node: 'current'}, modules: 'commonjs'}],
    '@babel/preset-typescript',
  ],
};
