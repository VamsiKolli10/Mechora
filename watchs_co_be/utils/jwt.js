// jsonwebtoken's current transitive dependency still reads SlowBuffer, which
// was removed in Node 25. Buffer is the compatible replacement for the API it
// uses. Keep the compatibility shim isolated so it can be deleted after that
// dependency is updated.
const buffer = require("buffer");

if (!buffer.SlowBuffer) {
  buffer.SlowBuffer = buffer.Buffer;
}

module.exports = require("jsonwebtoken");
