import nodeResolve from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import terser from '@rollup/plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/app.js',
  output: {
    file: 'public/app.js',
    format: 'esm',
  },
  plugins: [
    nodeResolve(),
    postcss({ minimize: production, extract: true }),
    production && terser({ format: { comments: false } }),
  ],
};
