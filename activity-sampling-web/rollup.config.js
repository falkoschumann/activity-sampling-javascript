import nodeResolve from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import terser from '@rollup/plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/main.js',
  output: {
    file: '../activity-sampling-server/public/activitysampling.js',
    format: 'esm',
  },
  plugins: [
    nodeResolve(),
    postcss({ minimize: production, extract: true }),
    production && terser({ format: { comments: false } }),
  ],
};
