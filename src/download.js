'use strict';

const net = require('net');
const fs = require('fs');

const udpTracker = require('./udp-tracker');
const httpTracker = require('./http-tracker');
const message = require('./message');
const Pieces = require('./Pieces');
const Queue = require('./Queue');

module.exports = (torrent, path, peers) => {
  // peers = [];
  // peers.push({ip: '92.97.37.222', port: 43616});
  const pieces = new Pieces(torrent);
  const file = fs.openSync(path, 'w');
  peers.forEach(peer => downloadFromPeer(peer, torrent, pieces, file));
};

function downloadFromPeer(peer, torrent, pieces, file) {
  const socket = new net.Socket();

  socket.on('error', console.log);

  socket.connect(peer.port, peer.ip, () => {
    console.log('connected to peer !', peer);
    socket.write(message.buildHandshake(torrent));
  });

  const queue = new Queue(torrent);
  onWholeMsg(socket, msg => msgHandler(msg, socket, pieces, queue, file, torrent));
}

function onWholeMsg(socket, callback) {
  let savedBuf = Buffer.alloc(0);
  let handshake = true;

  socket.on('data', recvBuf => {
    savedBuf = Buffer.concat([savedBuf, recvBuf]);
    const msgLen = () => handshake ? savedBuf.readUInt8(0) + 49 :
      savedBuf.readUInt32BE(0) + 4;

    while (savedBuf.length >= 4 && savedBuf.length >= msgLen()) {
      callback(savedBuf.slice(0, msgLen()));
      savedBuf = savedBuf.slice(msgLen());
      handshake = false;
    }
  });
}

function msgHandler(msg, socket, pieces, queue, file, torrent) {
  if (msg.length === 0) return;
  if (isHandshake(msg)) {
    socket.write(message.buildInterested());
  } else {
    const m = message.parse(msg);
    switch (m.id) {
      case 0:
        chokeHandler(socket);
        break;
      case 1:
        unchokeHandler(socket, pieces, queue);
        break;
      case 4:
        haveHandler(socket, pieces, queue, m.payload);
        break;
      case 5:
        bitfieldHandler(socket, pieces, queue, m.payload);
        break;
      case 7:
        pieceHandler(socket, pieces, queue, torrent, file, m.payload);
        break;
      default:
        break;
    }
  }
}

function isHandshake(msg) {
  return msg.length === msg.readUInt8(0) + 49 &&
    msg.toString('utf8', 1, 20) === 'BitTorrent protocol';
}

function chokeHandler(socket) {
  socket.end();
}

function unchokeHandler(socket, pieces, queue) {
  queue.choked = false;
  requestPiece(socket, pieces, queue);
}

function haveHandler(socket, pieces, queue, payload) {
  const pieceIndex = payload.readUInt32BE(0);
  const queueEmpty = queue.length() === 0;
  queue.queue(pieceIndex);
  if (queueEmpty) {
    requestPiece(socket, pieces, queue);
  }
}

function bitfieldHandler(socket, pieces, queue, payload) {
  const queueEmpty = queue.length() === 0;
  payload.forEach((byte, i) => {
    for (let j = 0; j < 8; j++) {
      if (byte & (1 << j)) {
        queue.queue(i * 8 + 7 - j);
      }
    }
  });
  if (queueEmpty) {
    requestPiece(socket, pieces, queue);
  }
}

function pieceHandler(socket, pieces, queue, torrent, file, pieceResp) {
  pieces.addReceived(pieceResp);

  const offset = pieceResp.index * torrent.info['piece length'] + pieceResp.begin;
  fs.write(file, pieceResp.block, 0, pieceResp.block.length, offset, () => {
    if (pieces.isDone()) {
      socket.end();
      console.log('DONE!');
      fs.close(file);
    } else {
      requestPiece(socket, pieces, queue);
    }
  });
}

function requestPiece(socket, pieces, queue) {
  if (queue.choked) return null;
  while (queue.length()) {
    const pieceBlock = queue.deque();
    if (pieces.needed(pieceBlock)) {
      socket.write(message.buildRequest(pieceBlock));
      pieces.addRequested(pieceBlock);
      break;
    }
  }
}