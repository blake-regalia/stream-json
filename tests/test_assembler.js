'use strict';

const unit = require('heya-unit');

const fs = require('fs'),
  path = require('path'),
  zlib = require('zlib');

const makeSource = require('../main');
const Assembler = require('../utils/Assembler');

unit.add(module, [
  function test_escaped(t) {
    const async = t.startAsync('test_escaped');

    const source = makeSource(),
      assembler = new Assembler();
    let object = null;

    source.output.on('data', chunk => assembler[chunk.name] && assembler[chunk.name](chunk.value));
    source.output.on('end', () => {
      eval(t.TEST('t.unify(assembler.current, object)'));
      async.done();
    });

    fs.readFile(path.resolve(__dirname, './sample.json.gz'), (err, data) => {
      if (err) {
        throw err;
      }
      zlib.gunzip(data, (err, data) => {
        if (err) {
          throw err;
        }

        object = JSON.parse(data.toString());

        fs.createReadStream(path.resolve(__dirname, './sample.json.gz'))
          .pipe(zlib.createGunzip())
          .pipe(source.input);
      });
    });
  }
]);
