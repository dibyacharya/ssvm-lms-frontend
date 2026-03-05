// Required for FFmpeg.wasm SharedArrayBuffer support
// These headers enable cross-origin isolation needed by WebAssembly threads
module.exports = function (app) {
  app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
    next();
  });
};
