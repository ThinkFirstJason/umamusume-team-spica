// Team Spica roster. `card` points at finished card art; members without one
// get a generated card in the same style until art is added.
window.SPICA = [
  {
    id: 'special-week',
    name: 'Special Week',
    jp: 'スペシャルウィーク',
    epithet: 'Special Dreamer',
    color: '#c43fd6', color2: '#7b2bbf', accent: '#ffd6f6',
    card: 'assets/cards/special-week.jpg',
    bio: [
      'A country girl from Hokkaido with a huge heart and an even bigger appetite, Special Week arrives at Tracen Academy carrying a promise to both of her mothers: to become the best Umamusume in Japan. Raised by a human mother after losing the one who gave birth to her, she runs with an honesty that wins over everyone around her.',
      'She joins Team Spica chasing her idol, Silence Suzuka, and grows from a wide-eyed transfer student into a Derby winner. Her rivalries with El Condor Pasa and Grass Wonder push her to her limits, and her charge in the Japan Cup cements her as the heart of the team.'
    ],
    horse: {
      born: '2 May 1995', sire: 'Sunday Silence', dam: 'Campaign Girl',
      career: '1997 – 1999', record: '17 starts: 10-4-2-1',
      g1: ['Tokyo Yūshun (Japanese Derby) 1998', 'Tennō Shō (Spring) 1999', 'Tennō Shō (Autumn) 1999', 'Japan Cup 1999'],
      note: 'Ridden by Yutaka Take, who won his first Japanese Derby aboard him. His dam died shortly after he was foaled.'
    }
  },
  {
    id: 'silence-suzuka',
    name: 'Silence Suzuka',
    jp: 'サイレンススズカ',
    epithet: 'Innocent Silence',
    color: '#2fae5c', color2: '#137a45', accent: '#d8ffe4',
    card: 'assets/cards/silence-suzuka.jpg',
    bio: [
      'Quiet, gentle and almost impossible to catch, Silence Suzuka lives for one thing: the view from the front. She breaks from the gate and simply never lets anyone pass, running not to beat her rivals but to see the scenery that only the leader gets to see.',
      'After struggling to fit a rigid team plan, she finds freedom with Team Spica, where her trainer lets her run her own way. Special Week\'s admiration for her becomes a bond that carries both of them through injury, recovery and the long road back to the turf.'
    ],
    horse: {
      born: '1 May 1994', sire: 'Sunday Silence', dam: 'Wild Applause',
      career: '1996 – 1998', record: '16 starts: 9-1-0-6',
      g1: ['Takarazuka Kinen 1998'],
      note: 'A front-runner who won six straight in 1998, including the Mainichi Ōkan by 2½ lengths. He suffered a fatal injury while leading the 1998 Tennō Shō (Autumn).'
    }
  },
  {
    id: 'tokai-teio',
    name: 'Tokai Teio',
    jp: 'トウカイテイオー',
    epithet: 'Top of Joyful Stage',
    color: '#2f86e8', color2: '#1d4fae', accent: '#ffe066',
    card: null,
    bio: [
      'Bright, cocky and endlessly energetic, Tokai Teio is famous for her bouncing "Teio Step" and her dream of becoming an undefeated Triple Crown winner, just like her hero, the Emperor Symboli Rudolf. She treats every race as a stage, and she always wants the spotlight.',
      'Repeated leg fractures take the Triple Crown away from her and nearly end her career, but Teio refuses to stay down. Her comeback, cheered on by Spica and her rival Mejiro McQueen, turns her into a symbol of never giving up.'
    ],
    horse: {
      born: '20 April 1988', sire: 'Symboli Rudolf', dam: 'Tokai Natural',
      career: '1990 – 1993', record: '12 starts: 9-0-0-3',
      g1: ['Satsuki Shō 1991', 'Tokyo Yūshun (Japanese Derby) 1991', 'Japan Cup 1992', 'Arima Kinen 1993'],
      note: 'Unbeaten through the 1991 Derby before a fracture ended his Triple Crown bid. He won the 1993 Arima Kinen after almost a full year away from racing.'
    }
  },
  {
    id: 'mejiro-mcqueen',
    name: 'Mejiro McQueen',
    jp: 'メジロマックイーン',
    epithet: 'Elegance Line',
    color: '#8a6fe0', color2: '#4c3a9c', accent: '#e8ddff',
    card: null,
    bio: [
      'Heiress of the prestigious Mejiro family, Mejiro McQueen carries herself with perfect manners and a duty to win the Tennō Shō for her house. She is a stayer with stamina to spare, at her best over the longest and toughest distances.',
      'Underneath the refined image is a girl who can\'t resist sweets and turns into a passionate shouting baseball fan in the stands. Her rivalry and friendship with Tokai Teio is one of the defining stories of Team Spica.'
    ],
    horse: {
      born: '3 April 1987', sire: 'Mejiro Titan', dam: 'Mejiro Aurora',
      career: '1990 – 1993', record: '21 starts: 12-6-1-2',
      g1: ['Kikuka Shō 1990', 'Tennō Shō (Spring) 1991', 'Tennō Shō (Spring) 1992', 'Takarazuka Kinen 1993'],
      note: 'The first racehorse to pass ¥1 billion in career earnings. Three generations of his sire line won the Tennō Shō.'
    }
  },
  {
    id: 'vodka',
    name: 'Vodka',
    jp: 'ウオッカ',
    epithet: 'Wild Top Gear',
    color: '#3a3d4a', color2: '#16171d', accent: '#ffd23a',
    card: null,
    bio: [
      'Vodka wants to be cool, and she means it. Motorcycles, leather jackets and doing things her own way are everything to her, and she refuses to back down from a challenge just because it is supposed to be impossible.',
      'Her eternal rival is Daiwa Scarlet. They argue about everything, compete over everything, and somehow keep making each other faster. When Vodka sets her sights on the Japanese Derby, a race fillies almost never win, she runs straight at the history books.'
    ],
    horse: {
      born: '4 April 2004', sire: 'Tanino Gimlet', dam: 'Tanino Sister',
      career: '2006 – 2009', record: '26 starts: 10-5-3-8',
      g1: ['Hanshin Juvenile Fillies 2006', 'Tokyo Yūshun (Japanese Derby) 2007', 'Yasuda Kinen 2008', 'Tennō Shō (Autumn) 2008', 'Yasuda Kinen 2009', 'Victoria Mile 2009', 'Japan Cup 2009'],
      note: 'The first filly in 64 years to win the Japanese Derby. She beat Daiwa Scarlet by about two centimetres in the 2008 Tennō Shō (Autumn).'
    }
  },
  {
    id: 'daiwa-scarlet',
    name: 'Daiwa Scarlet',
    jp: 'ダイワスカーレット',
    epithet: 'Peak Blue',
    color: '#ff5a46', color2: '#c4253c', accent: '#ffe1d6',
    card: null,
    bio: [
      'Daiwa Scarlet has one goal in everything she does: be number one. In front of others she is the polished honor student, always composed and always first, but behind that is a fiercely competitive girl who hates to lose.',
      'Her rivalry with Vodka gives Team Spica its loudest arguments and some of its best races. Scarlet runs from the front with unshakable consistency, and she wants the whole world to see her at the top.'
    ],
    horse: {
      born: '13 May 2004', sire: 'Agnes Tachyon', dam: 'Scarlet Bouquet',
      career: '2006 – 2008', record: '12 starts: 8-4-0-0',
      g1: ['Ōka Shō 2007', 'Shūka Shō 2007', 'Queen Elizabeth II Cup 2007', 'Arima Kinen 2008'],
      note: 'Never finished worse than second in her career. Her 2008 Arima Kinen made her the first filly in 37 years to win it.'
    }
  },
  {
    id: 'gold-ship',
    name: 'Gold Ship',
    jp: 'ゴールドシップ',
    epithet: 'Red Strife',
    color: '#e8323c', color2: '#a3141f', accent: '#ffe08a',
    card: 'assets/cards/gold-ship.jpg',
    bio: [
      'Nobody knows what Gold Ship will do next, possibly including Gold Ship. She recruits new members by stuffing them into sacks, drops kicks on teammates and goes off on bizarre schemes at a moment\'s notice. She is Team Spica\'s self-appointed agent of chaos.',
      'When she actually decides to run, though, she is a monster. Her long, relentless late surge can swallow an entire field, and her total unpredictability makes her one of the most beloved Umamusume at Tracen.'
    ],
    horse: {
      born: '6 March 2009', sire: 'Stay Gold', dam: 'Point Flag',
      career: '2011 – 2015', record: '28 starts: 13-3-2-10',
      g1: ['Satsuki Shō 2012', 'Kikuka Shō 2012', 'Arima Kinen 2012', 'Takarazuka Kinen 2013', 'Takarazuka Kinen 2014', 'Tennō Shō (Spring) 2015'],
      note: 'Famously temperamental. As favourite for a third Takarazuka Kinen in 2015, he reared at the start and finished 15th.'
    }
  }
];
