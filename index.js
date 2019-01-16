const request = require('request-promise-native');
const cheerio = require('cheerio');
const path = require('path');

const IO = require('./lib/io');

const hour = 1000 * 60 * 60;

function composeItemObjects($, $items) {
  const artRegex = /(https:\/\/.*\.jpg)/;
  return $items.map((i, el) => {
    return {
      url: $(el).find('a').attr('href'),
      art: $(el).html().match(artRegex)[1],
      album: $(el).find('.itemtext').text(),
      artist: $(el).find('.itemsubtext').text()
    };
  }).get();

}

function getMp3Links(htmlArray) {
  return htmlArray.reduce((acc, html) => {
    const $ = cheerio.load(html);
    const $items = $('.item, .discover-item');
    return acc.concat(composeItemObjects($, $items));
  }, []);
}

function composeEndpoints(endpoints) {
  return endpoints.map(endpoint => request(endpoint));
}

async function getPageLinks(endpoints) {
  const htmlArray = await Promise.all(composeEndpoints(endpoints));
  return getMp3Links(htmlArray);
}

function saveDatabase(path, db) {
  const dbJSON = JSON.stringify(db, null, 2);
  const stream = IO.createWriteStream(path);
  stream.write(dbJSON);
  stream.end();
}

function composeLinksObj(linkObjArr) {
  return linkObjArr.reduce((acc, obj) => {
    const { url } = obj;
    if (!acc[url]) acc[url] = obj;
    return acc;
  }, {});
}

async function init(endpoints, db, count) {

  const linkObjArr = await getPageLinks(endpoints);

  db = db || composeLinksObj(linkObjArr);
  count = count || 1;
  console.log(db)
  console.log(`Database size: ${Object.keys(db).length}`);

  if (count === 2) {
    const dbPath = path.join(__dirname, 'bandcamp.json');
    saveDatabase(dbPath, db);
  } else {
    setTimeout(init, hour, endpoints, db, ++count);
  }

}

// function getDiscoverEndpoint(tag) {
//   return `https://bandcamp.com/api/discover/3/get_web?g=${tag}&s=rec&p=0&gn=0&f=all&w=0&r=latest`;
// }

function getTagEndpoint(tag) {
  return `https://bandcamp.com/tag/${tag}?page=1&sort_field=date`;
}

const tags = [
  'electronic', 'rock', 'alternative', 'experimental',
  'folk', 'world', 'acoustic', 'blues'
];

// function composeDiscoveryEndpoints(tags) {
//   return tags.map(tag => getDiscoverEndpoint(tag));
// }

function composeTagEndpoints(tags) {
  return tags.map(tag => getTagEndpoint(tag));
}

const tagEndpoints = composeTagEndpoints(tags);

// const discoverEndpoints = composeDiscoveryEndpoints(tags);
// const endpoints = [...discoverEndpoints];

init(tagEndpoints);

// (async () => {
//   const json = await request('https://bandcamp.com/api/discover/3/get_web?g=electronic&s=rec&p=0&gn=0&f=all&w=0&r=latest');
//   console.log(json);
// })();

// latest, electronic, 1st block, artist-rec, any format, genre all
// https://bandcamp.com/api/discover/3/get_web?g=electronic&s=rec&p=0&gn=0&f=all&w=0&r=latest

// new arrivals, electronic, today!, any format
// https://bandcamp.com/api/discover/3/get_web?g=electronic&s=new&p=0&gn=0&f=all&w=-1