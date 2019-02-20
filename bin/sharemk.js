#!/usr/bin/env node

const program = require('commander');
const server = require('../src/app/server');
const client = require('../src/app/client');

program.version('0.0.1')
.description(
`
sharemk: share your mouse & keyboard between different system 
------------------------------------------------------
[warning: only win & mac on current verison]
`    
)
.option('-s, --server', 'for server (warning: only windows current)')
.option('-c, --client', 'for client (warning: only macos current)')

// program.command('sharemk').alias('g');
program.parse(process.argv);

if (program.server) {
    server.init();
} else if (program.client) {
    client.init();
}

