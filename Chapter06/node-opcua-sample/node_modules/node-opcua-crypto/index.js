var crypto_utils = require("./lib/crypto_utils");
var crypto_explore_certificate = require("./lib/crypto_explore_certificate");

exports.crypto_utils = crypto_utils;

exports.crypto_utils.computeDerivedKeys                        =  require("./lib/derived_keys").computeDerivedKeys;
exports.crypto_utils.makePseudoRandomBuffer                    = require("./lib/derived_keys").makePseudoRandomBuffer;
exports.crypto_utils.reduceLength                              = require("./lib/derived_keys").reduceLength;
exports.crypto_utils.removePadding                             = require("./lib/derived_keys").removePadding;
exports.crypto_utils.makeMessageChunkSignatureWithDerivedKeys = require("./lib/derived_keys").makeMessageChunkSignatureWithDerivedKeys;
exports.crypto_utils.verifyChunkSignatureWithDerivedKeys = require("./lib/derived_keys").verifyChunkSignatureWithDerivedKeys;
exports.crypto_utils.decryptBufferWithDerivedKeys = require("./lib/derived_keys").decryptBufferWithDerivedKeys;
exports.crypto_utils.encryptBufferWithDerivedKeys = require("./lib/derived_keys").encryptBufferWithDerivedKeys;
exports.crypto_utils.computePaddingFooter         = require("./lib/derived_keys").computePaddingFooter;


exports.crypto_utils.verifyChunkSignature         = require("./lib/derived_keys").verifyChunkSignature;

//xx exports.crypto_utils.verifyMessageChunkSignature         = verifyMessageChunkSignaturer.verifyMessageChunkSignature;



exports.crypto_utils.exploreCertificate =  require("./lib/explore_certificate").exploreCertificate;
exports.crypto_utils.split_der = require("./lib/explore_certificate").split_der;

exports.crypto_explore_certificate = crypto_explore_certificate;

