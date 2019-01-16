const request = require('request-promise-native');

function composeLinkObjects(item) {

  const {
    url_hints: { subdomain, slug: album },
    // primary_text: albumTitle,
    // secondary_text: artist,
    // art_id: artId
  } = item;

  const albumLink = `https://${subdomain}.bandcamp.com/album/${album}`;
  // const albumArtLink = `https://f4.bcbits.com/img/a${artId}_9.jpg`;

  // return { albumLink, albumTitle, artist, albumArtLink };
  return albumLink;
}

(async () => {
  const res = await request('https://bandcamp.com/api/discover/3/get_web?g=electronic&s=rec&p=0&gn=0&f=all&w=0&r=latest');
  const data = JSON.parse(res);
  const linkObjects = data.items.map(composeLinkObjects);
  console.log(linkObjects);
})();

// latest, electronic, 1st block, artist-rec, any format, genre all, pageset 1
// https://bandcamp.com/api/discover/3/get_web?g=electronic&s=rec&p=0&gn=0&f=all&w=0&r=latest

// latest, electronic, 1st block, artist-rec, any format, genre all, pageset 2
// https://bandcamp.com/api/discover/3/get_web?g=electronic&s=rec&p=1&gn=0&f=all&w=0&r=latest

// new arrivals, electronic, today!, any format
// https://bandcamp.com/api/discover/3/get_web?g=electronic&s=new&p=0&gn=0&f=all&w=-1