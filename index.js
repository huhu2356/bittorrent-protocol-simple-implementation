'use strict';

const torrentParser = require('./src/torrent-parser');
const download = require('./src/download');

const torrent = torrentParser.open('test1.torrent');

download(torrent, torrent.info.name);
