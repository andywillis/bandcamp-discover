const request = require('request-promise-native');
const cheerio = require('cheerio');

const hour = 1000 * 60 * 60;

function getMp3Links(html) {
  const $ = cheerio.load(html);
  const $item = $('.item');
  const artRegex = /(https:\/\/.*\.jpg)/;
  return $item.map((i, el) => {
    return {
      url: $(el).find('a').attr('href'),
      art: $(el).html().match(artRegex)[1],
      album: $(el).find('.itemtext').text(),
      artist: $(el).find('.itemsubtext').text()
    };
  }).get();
}

async function getPageLinks(url) {
  const html = await request(url);
  return getMp3Links(html);
}

async function init(db) {
  db = db || new Map();
  const links = await getPageLinks('https://bandcamp.com/tag/electronic?page=2&sort_field=date');
  links.forEach((link) => {
    const { url } = link;
    if (!db.has(url)) db.set(url, link);
  });
  console.log(`Database size: ${db.size}`);
  setTimeout(init, hour, db);
}

init();
