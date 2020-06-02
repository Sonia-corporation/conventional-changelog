"use strict";

module.exports = {
  headerCorrespondence: [`type`, `scope`, `subject`],
  headerPattern: /^(\w*)(?:\((.*)\))?: (.*)$/,
  noteKeywords: [`BREAKING CHANGE`],
  revertCorrespondence: [`header`, `hash`],
  revertPattern: /^(?:Revert|revert:)\s"?([\s\S]+?)"?\s*This reverts commit (\w*)\./i,
};
