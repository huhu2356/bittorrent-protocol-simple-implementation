'use strict';

const http = require('http');
const urlParse = require('url').parse;
const { Uint64BE } = require('int64-buffer');
const bencode = require('bencode');

const util = require('./util');
const torrentParser = require('./torrent-parser');

module.exports.getPeers = (torrent) => {
  return new Promise((resolve) => {
    const url = urlParse(torrent.announce.toString('utf8'));

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: (url.path || '') + buildGetRequest(torrent)
    };

    http.get(options, (res) => {
      const chunks = [];

      res.on('data', (chunk) => {
        chunks.push(Buffer.from(chunk));
      });

      res.on('end', () => {
        const resp = bencode.decode(Buffer.concat(chunks));
        if (resp['failure reason']) {
          console.log(resp['failure reason'].toString());
        } else {
          resolve(parsePeers(resp.peers));
        }
      });
    }).on('error', (err) => {
      console.log(err);
    });
  });
};

function buildGetRequest(torrent) {
  const query = '?info_hash=' + urlEncode(torrentParser.infoHash(torrent)) +
    '&peer_id=' + urlEncode(Buffer.from(util.genId())) +
    '&port=' + 6881 +
    '&uploaded=' + 0 +
    '&downloaded=' + 0 +
    '&left=' + new Uint64BE(torrentParser.size(torrent)).toString(10) +
    '&compact=1';

  return query;
}

function urlEncode(buffer) {
  return buffer.reduce((acc, cur) => {
    if ((cur >= '0'.charCodeAt(0).toString(10) && cur <= '9'.charCodeAt(0).toString(10)) ||
      (cur >= 'a'.charCodeAt(0).toString(10) && cur <= 'z'.charCodeAt(0).toString(10)) ||
      (cur >= 'A'.charCodeAt(0).toString(10) && cur <= 'Z'.charCodeAt(0).toString(10)) ||
      cur == '.'.charCodeAt(0).toString(10) || cur == '-'.charCodeAt(0).toString(10) ||
      cur == '_'.charCodeAt(0).toString(10) || cur == '~'.charCodeAt(0).toString(10)) {
      return acc + String.fromCharCode(cur);
    }
    if (cur < 16) {
      return `${acc}%0${cur.toString(16)}`
    }
    return `${acc}%${cur.toString(16)}`;
  }, '');
}

function parsePeers(buffer) {
  return util.group(buffer, 6).map((address) => {
    return {
      ip: address.slice(0, 4).join('.'),
      port: address.readUInt16BE(4)
    };
  });
}