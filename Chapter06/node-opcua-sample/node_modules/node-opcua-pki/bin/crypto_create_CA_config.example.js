"use strict";
// ---------------------------------------------------------------------------------------------------------------------
module.exports =  {

    subject: {
        commonName:         "NodeOPCUA-TEST",
        organization:       "NodeOPCUA",
        organizationUnit:   "Unit",
        locality:           "Paris",
        state:              "IDF",
        country:            "FR" // Two letters
    },

    validity:           365 * 15, // 15 years

    keySize:            2048 // default private key size : 2048, 3072 or 4096 (avoid 1024 too weak)
};

