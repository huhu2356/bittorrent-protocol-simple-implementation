'use strict';

const fs = require('fs');
const crypto = require('crypto');
const bencode = require('bencode');
const { Uint64BE } = require('int64-buffer');

module.exports.open = (filepath) => {
  return bencode.decode(fs.readFileSync(filepath));
};

// get total file(s) size
module.exports.size = (torrent) => {
  const totalsize = torrent.info.files ?
    torrent.info.files.map(file => file.length).reduce((acc, cur) => acc + cur) :
    torrent.info.length;
  return new Uint64BE(totalsize).toBuffer();
};

module.exports.infoHash = torrent => {
  const info = bencode.encode(torrent.info);
  return crypto.createHash('sha1').update(info).digest();
};

module.exports.BLOCK_LEN = Math.pow(2, 14);

module.exports.pieceLen = (torrent, pieceIndex) => {
  const totalLength = Uint64BE(this.size(torrent)).toNumber();
  const pieceLength = torrent.info['piece length'];

  const lastPieceLength = totalLength % pieceLength;
  if (lastPieceLength === 0) {
    return pieceLength;
  }

  const lastPieceIndex = Math.floor(totalLength / pieceLength);

  return pieceIndex === lastPieceIndex ? lastPieceLength : pieceLength;
};

module.exports.blocksPerPiece = (torrent, pieceIndex) => {
  const pieceLength = this.pieceLen(torrent, pieceIndex);
  return Math.ceil(pieceLength / this.BLOCK_LEN);
};

module.exports.blockLen = (torrent, pieceIndex, blockIndex) => {
  const pieceLength = this.pieceLen(torrent, pieceIndex);

  const lastBlockLength = pieceLength % this.BLOCK_LEN;
  if (lastBlockLength === 0) {
    return this.BLOCK_LEN;
  }

  const lastBlockIndex = Math.floor(pieceLength / this.BLOCK_LEN);
  return blockIndex === lastBlockIndex ? lastBlockLength : this.BLOCK_LEN;
};
