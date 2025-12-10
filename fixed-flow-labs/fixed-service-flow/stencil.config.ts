import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
  namespace: 'fixed-service-flow',
  globalStyle: 'src/global/global.scss',
  plugins: [
    sass({
      includePaths: ['src/global'],
    }),
  ],
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null,
      copy: [
        { src: 'assets', dest: 'assets' },
      ],
    },
  ],
  testing: {
    browserHeadless: 'shell',
  },
  devServer: {
    port: 3333,
    reloadStrategy: 'pageReload',
  },
};
