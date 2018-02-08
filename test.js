var buf = Buffer.from([0x32, 0x45]);

var res = [];

buf.forEach((cur, i) => {
  for (let j = 0; j < 8; j++) {

    if (cur & (1 << j)) {
      res.push(i * 8 + 7 - j);
    }
  }
});
console.log(buf);
console.log(res);