const path = require('path');
const { verifyFolderExists, writeFile } = require('../io');

function buildItems(entries, host) {
  return entries.map((entry) => {
    return (`
      <item>
        <title>${entry.title}</title>
        <link>${host}/entry/${entry.link}</link>
        <description><![CDATA[${entry.cdata}]]></description>
      </item>
    `);
  }).join('');
}

function wrapItems(items) {
  return (`
    <?xml version="1.0"?>
    <rss version="2.0">
      <channel>
        <title>UWS journal feed</title>
        <link>http://uws-journal.herokuapp.com</link>
        <description>UWS journal posts</description>
          ${items}
      </channel>
    </rss>'
  `);
}

async function writeRSS(xml, root) {
  try {
    await verifyFolderExists(`${root}/dist/`);
    const filePath = `${root}/dist/uws.rss`;
    const options = { flags: 'w', encoding: 'utf-8', mode: '0666' };
    await writeFile(xml, filePath, options);
    console.log('RSS created');
  } catch (err) {
    console.log(err);
  }
}

function createRSS(data) {
  const { entries } = data;
  const root = path.join(__dirname, '../../../');
  const host = 'https://uws-journal.herokuapp.com';
  return new Promise((resolve) => {
    const items = buildItems(entries, host);
    const xml = wrapItems(items);
    writeRSS(xml, root);
    resolve();
  });
}

module.exports = createRSS;
