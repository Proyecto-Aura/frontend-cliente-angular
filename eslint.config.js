// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      // Convenciones de CLAUDE.md convertidas en reglas automáticas:
      '@angular-eslint/prefer-standalone': 'error',
      '@angular-eslint/prefer-signals': 'error',
      '@angular-eslint/prefer-inject': 'error',
      '@angular-eslint/prefer-host-metadata-property': 'error', // no @HostBinding/@HostListener
      'no-restricted-syntax': [
        'error',
        {
          selector: "Decorator[expression.callee.name='HostBinding']",
          message: 'No uses @HostBinding: pon el binding en el objeto host del @Component/@Directive.',
        },
        {
          selector: "Decorator[expression.callee.name='HostListener']",
          message: 'No uses @HostListener: pon el listener en el objeto host del @Component/@Directive.',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {
      // Convenciones de CLAUDE.md convertidas en reglas automáticas:
      '@angular-eslint/template/prefer-control-flow': 'error', // @if/@for/@switch, no *ngIf/*ngFor/*ngSwitch
      '@angular-eslint/template/prefer-class-binding': 'error', // no ngClass
      '@angular-eslint/template/prefer-style-binding': 'error', // no ngStyle
      '@angular-eslint/template/button-has-type': 'error',
    },
  },
]);
