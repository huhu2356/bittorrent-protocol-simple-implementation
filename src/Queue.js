'use strict';

const torrentParser = require('./torrent-parser');

module.exports = class {
  constructor(torrent) {
    this._torrent = torrent;
    this._queue = [];
    this.choked = true;
  }

  queue(pieceIndex) {
    const nBlocks = torrentParser.blocksPerPiece(this._torrent, pieceIndex);
    for (let i = 0; i < nBlocks; i++) {
      const pieceBlock = {
        index: pieceIndex,
        begin: i * torrentParser.BLOCK_LEN,
        length: torrentParser.blockLen(this._torrent, pieceIndex, i)
      };
      this._queue.push(pieceBlock);
    }
  }

  deque() {
    return this._queue.shift();
  }

  peek() {
    return this._queue[0];
  }

  length() {
    return this._queue.length;
  }
};