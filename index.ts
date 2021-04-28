import { get } from 'https';

function sort_by_lastname(...names: string[]) {
    console.time();
  function loadMemoryAlphaPage(fullName: string) {
    return new Promise<string>(resolve => {
      get(
        `https://memory-alpha.fandom.com/wiki/${fullName.replace(/\s/g, '_')}`,
        response => {
          if (response.statusCode === 301) {
            return loadMemoryAlphaPage(fullName.replace(' ', ' T. ')).then(
              resolve
            );
          } else {
            let data: string;

            response.on('data', chunk => (data += chunk));
            response.on('end', () => resolve(data));
          }
        }
      );
    });
  }

  return Promise.all(
    names.map(fullName =>
      loadMemoryAlphaPage(fullName)
        .then(memoryAlphaPage =>
          fullName.split(' ').map(name => {
            const matches = memoryAlphaPage.match(RegExp(name, 'g'));
            return [fullName, name, matches === null ? 0 : matches.length] as [
              string,
              string,
              number
            ];
          })
        )
        .then(
          nameWithFrequencies =>
            nameWithFrequencies
              .sort(
                ([, , frequencyLeft], [, , frequencyRight]) =>
                  frequencyLeft - frequencyRight
              )
              .reverse()
              .map(([fullName, lastName]) => [fullName, lastName])[0]
        )
    )
  ).then(fullNamesWithLastNames =>
    fullNamesWithLastNames
      .sort(([, lastNameLeft], [, lastNameRight]) => {
        if (lastNameLeft < lastNameRight) {
          return -1;
        }
        if (lastNameLeft > lastNameRight) {
          return 1;
        }
        return 0;
      })
      .map(([fullName]) => fullName)
  );
}

sort_by_lastname(
    'James Kirk', 'Spock', 'Leonard McCoy', 'Montgomery Scott',
    'Jean-Luc Picard', 'William Riker', 'Worf', 'Beverly Crusher',
    'Benjamin Sisko', 'Julian Bashir', 'Jadzia Dax', 'Miles O\'Brien', 'Kira Nerys', 
    'Kathryn Janeway', 'Chakotay', 'Seven of Nine', 'Tuvok',
    'Jonathan Archer', 'T\'Pol', 'Charles Tucker III', 'Phlox'
).then(x => {
    console.timeEnd();
    console.log(x);
});


// TypeScript for Node.js

// Highlights:

// * determine the family name by loading the Memory Alpha page for each name, split the name by space and count the occurences of each name part on the page; the part with the most occurences should be the family name 🖖
// * when Memory Alpha returns a redirect (status code 303), try again but this time add " T. " in between the name parts (works flawlessly for "William Riker" and "James Kirk") 🤯
// * formatted with Prettier for optimal legibility 😍
// * only takes less than 3 seconds on my machine 🏃‍♂️

// Known Issues:
// * Seven of Nine's family name is "of"
