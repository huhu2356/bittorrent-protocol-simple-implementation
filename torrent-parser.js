'use strict';

const fs = require('fs');
const crypto = require('crypto');
const bencode = require('bencode');
const { Uint64BE } = require('int64-buffer');

module.exports.open = (filepath) => {
  return bencode.decode(fs.readFileSync(filepath));
};

module.exports.size = torrent => {
  const size = torrent.info.files ?
    torrent.info.files.map(file => file.length).reduce((acc, cur) => acc + cur) :
    torrent.info.length;
  return new Uint64BE(size).toBuffer();
};

module.exports.infoHash = torrent => {
  const info = bencode.encode(torrent.info);
  return crypto.createHash('sha1').update(info).digest();
};