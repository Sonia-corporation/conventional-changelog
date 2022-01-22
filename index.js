"use strict";
const Q = require(`q`);
// eslint-disable-next-line @typescript-eslint/naming-convention
const _ = require(`lodash`);
const conventionalChangelog = require(`./conventional-changelog`);
const parserOpts = require(`./parser-opts`);
const recommendedBumpOpts = require(`./conventional-recommended-bump`);
const writerOpts = require(`./writer-opts`);

module.exports = function (parameter) {
  // parameter passed can be either a config object or a callback function
  if (_.isFunction(parameter)) {
    // parameter is a callback object
    const config = {};

    Q.all([
      conventionalChangelog,
      parserOpts,
      recommendedBumpOpts,
      writerOpts(config),
    ]).spread(
      (conventionalChangelog, parserOpts, recommendedBumpOpts, writerOpts) => {
        parameter(null, {
          conventionalChangelog,
          gitRawCommitsOpts: { noMerges: null },
          parserOpts,
          recommendedBumpOpts,
          writerOpts,
        });
      }
    );
  } else {
    const config = parameter || {};
    return presetOpts(config);
  }
};

function presetOpts(config) {
  return Q.all([
    conventionalChangelog,
    parserOpts,
    recommendedBumpOpts,
    writerOpts(config),
  ]).spread(
    (conventionalChangelog, parserOpts, recommendedBumpOpts, writerOpts) => {
      return {
        conventionalChangelog,
        parserOpts,
        recommendedBumpOpts,
        writerOpts,
      };
    }
  );
}
