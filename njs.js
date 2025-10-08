#!/usr/bin/env node
// Node-compatible shell wrapper, can be run directly against narcissus code in ./lib

if (typeof print === 'undefined') {
  print = function(s) { console.log(s); };
}
if (typeof putstr === 'undefined') {
  putstr = function(s) {
    (typeof process === 'object' ? process.stdout.write(s) : print(s));
  };
}
if (typeof readline === 'undefined') {
  readline = function() {
    const fs = require('fs'), buf = Buffer.alloc(1), bytes = [];
    while (fs.readSync(0, buf) > 0 && buf[0] != 0x0A) {
      bytes.push(buf[0]);
    }
    return (bytes.length || buf[0]) ? Buffer.from(bytes).toString('utf-8') : null;
  };
}
if (typeof globalThis === undefined) {
  globalThis = eval("this");
}
if (typeof require === 'undefined') {
  // For SpiderMonkey shell or similar
  require = function(name) {
    const basename = name.replace(/.*\//, '');
    if (basename in Narcissus) return Narcissus[basename];
    const readR = typeof readRelativeToScript !== 'undefined' ? readRelativeToScript : read;
    const src = readR(name + '.js');
    const mod = {};
    eval('(function(exports, require) {' + src + '})').call(mod, mod, require);
    return Narcissus[basename] = mod;
  };
}

const Narcissus = {__proto__: null};
Narcissus.global = globalThis;
Narcissus.options = require('./lib/options');
Narcissus.definitions = require('./lib/definitions');
Narcissus.lexer = require('./lib/lexer');
Narcissus.parser = require('./lib/parser');
Narcissus.decompiler = require('./lib/decompiler');
Narcissus.resolver = require('./lib/resolver');
Narcissus.desugaring = require('./lib/desugaring');
Narcissus.bytecode = require('./lib/bytecode');
Narcissus.interpreter = require('./lib/interpreter');

if (typeof process === 'object' && process.argv.length >= 3) {
  Narcissus.interpreter.evaluate(require('fs').readFileSync(process.argv[2], 'utf8'));
} else if (typeof scriptArgs === 'object' && scriptArgs.length >= 1) {  // SM
  Narcissus.interpreter.evaluate(read(scriptArgs[0]));
} else if (typeof arguments === 'object' && typeof arguments[0] === 'string') {  // JSC
  Narcissus.interpreter.evaluate(read(arguments[0]));
} else {
  Narcissus.interpreter.repl();
}
