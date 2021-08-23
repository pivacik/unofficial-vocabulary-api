const fetch = require("node-fetch");
const { parse } = require("node-html-parser");

const zip = (...arr) => {
  const zipped = [];
  arr.map((element, ind) => {
    element.map((el, index) => {
      if (!zipped[index]) {
        zipped[index] = [];
      }
      if (!zipped[index][ind]) {
        zipped[index][ind] = [];
      }
      zipped[index][ind] = el || "";
    });
  });
  return zipped;
};

exports.fetchSingleWord = (req, res) => {
  fetch(
    `https://www.vocabulary.com/dictionary/definition.ajax?search=${req.params.word}&lang=en`
  )
    .then((res) => res.text())
    .then((data) => {
      const root = parse(data);
      let rawShortText;
      let rawLongText;
      let rawSences;
      try {
        rawShortText = root.querySelector("p.short").rawText;
      } catch (e) {
        rawShortText = "No Definitions Found";
      }
      try {
        rawLongText = root.querySelector("p.long").rawText;
      } catch (e) {
        rawLongText = "No Definitions Found";
      }

      res.json({
        short: rawShortText,
        long: rawLongText,
      });
    });
};

exports.fetchMatches = (req, res) => {
  fetch(
    `https://www.vocabulary.com/dictionary/autocomplete?search=${req.params.text}`
  )
    .then((res) => res.text())
    .then((data) => {
      const root = parse(data);
      const rawWords = root
        .querySelectorAll("span.word")
        .map((word) => word.innerHTML);

      const rawId = root
        .querySelectorAll("li")
        .map((item) => item.getAttribute("synsetid"));

      const rawDefs = root
        .querySelectorAll("span.definition")
        .map((definition) => definition.innerHTML);

      const zippedResult = zip(rawId, rawWords, rawDefs);
      const matches = zippedResult.map((match) => {
        return {
          id: match[0],
          word: match[1],
          definition: match[2],
        };
      });

      res.json(matches);
    });
};
