#!/usr/bin/env node

import { cli } from './src/app';

cli(process.argv).catch();