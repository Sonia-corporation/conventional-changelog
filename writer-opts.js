"use strict";

const compareFunc = require(`compare-func`);
const Q = require(`q`);
const readFile = Q.denodeify(require(`fs`).readFile);
const resolve = require(`path`).resolve;

module.exports = function (config) {
  config = defaultConfig(config);

  return Q.all([
    readFile(resolve(__dirname, `./templates/template.hbs`), `utf-8`),
    readFile(resolve(__dirname, `./templates/header.hbs`), `utf-8`),
    readFile(resolve(__dirname, `./templates/commit.hbs`), `utf-8`),
    readFile(resolve(__dirname, `./templates/footer.hbs`), `utf-8`),
  ]).spread((template, header, commit, footer) => {
    const writerOpts = getWriterOpts(config);

    writerOpts.mainTemplate = template;
    writerOpts.headerPartial = header;
    writerOpts.commitPartial = commit;
    writerOpts.footerPartial = footer;

    return writerOpts;
  });
};

function getWriterOpts(config) {
  config = defaultConfig(config);

  return {
    commitGroupsSort: `title`,
    commitsSort: [`scope`, `subject`],
    groupBy: `type`,
    noteGroupsSort: `title`,
    notesSort: compareFunc,
    transform: (commit, context) => {
      let shouldDiscard = true;
      const issues = [];

      commit.notes.forEach((note) => {
        note.title = `BREAKING CHANGES`;
        shouldDiscard = false;
      });

      if (
        commit.type === `feat` &&
        (!shouldDiscard || config.types.includes(`feat`))
      ) {
        commit.type = `:rocket: Features`;
      } else if (
        commit.type === `fix` &&
        (!shouldDiscard || config.types.includes(`fix`))
      ) {
        commit.type = `:bug: Bug Fixes`;
      } else if (
        commit.type === `perf` &&
        (!shouldDiscard || config.types.includes(`perf`))
      ) {
        commit.type = `:zap: Performance Improvements`;
      } else if (
        (commit.type === `revert` &&
          (!shouldDiscard || config.types.includes(`revert`))) ||
        commit.revert
      ) {
        commit.type = `:rewind: Reverts`;
      } else if (
        commit.type === `docs` &&
        (!shouldDiscard || config.types.includes(`docs`))
      ) {
        commit.type = `:books: Documentation`;
      } else if (
        commit.type === `style` &&
        (!shouldDiscard || config.types.includes(`style`))
      ) {
        commit.type = `:star2: Styles`;
      } else if (
        commit.type === `refactor` &&
        (!shouldDiscard || config.types.includes(`refactor`))
      ) {
        commit.type = `:sparkles: Code Refactoring`;
      } else if (
        commit.type === `test` &&
        (!shouldDiscard || config.types.includes(`test`))
      ) {
        commit.type = `:microscope: Tests`;
      } else if (
        commit.type === `build` &&
        (!shouldDiscard || config.types.includes(`build`))
      ) {
        commit.type = `:wrench: Build System`;
      } else if (
        commit.type === `ci` &&
        (!shouldDiscard || config.types.includes(`ci`))
      ) {
        commit.type = `:robot: Continuous Integration`;
      } else if (shouldDiscard) {
        return;
      }

      if (commit.scope === `*`) {
        commit.scope = ``;
      }

      if (typeof commit.hash === `string`) {
        commit.shortHash = commit.hash.substring(0, 7);
      }

      if (typeof commit.subject === `string`) {
        let url = context.repository
          ? `${context.host}/${context.owner}/${context.repository}`
          : context.repoUrl;

        if (url) {
          url = `${url}/issues/`;
          // Issue URLs.
          commit.subject = commit.subject.replace(/#([0-9]+)/g, (_, issue) => {
            issues.push(issue);
            return `[#${issue}](${url}${issue})`;
          });
        }

        if (context.host) {
          // User URLs.
          commit.subject = commit.subject.replace(
            /\B@([a-z0-9](?:-?[a-z0-9/]){0,38})/g,
            (_, username) => {
              if (username.includes(`/`)) {
                return `@${username}`;
              }

              return `[@${username}](${context.host}/${username})`;
            }
          );
        }
      }

      // remove references that already appear in the subject
      commit.references = commit.references.filter((reference) => {
        return issues.indexOf(reference.issue) === -1;
      });

      return commit;
    },
  };
}

function defaultConfig(config) {
  config = config || {};
  config.types = config.types || [`feat`, `fix`, `perf`, `revert`];

  return config;
}
