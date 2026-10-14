export type LiteraryCategory = 'growth' | 'hope' | 'courage' | 'life' | 'solitude' | 'love' | 'time' | 'nature' | 'everyday';
export interface LiteraryQuote {
  id: string; quote: string; author: string; work: string; year: number;
  category: LiteraryCategory; translation: string; publicDomain: true;
  sourceUrl: string; location: string;
}

// Verbatim excerpts from the editions linked below; translations are original Chinese glosses.
// Stable IDs and append-only ordering keep saved quotations independent of themes.
const sonnets: [number, string, LiteraryCategory, string][] = [
  [18, 'Shall I compare thee to a summer’s day?', 'nature', '我能否将你比作一个夏日？'],
  [18, 'But thy eternal summer shall not fade,', 'hope', '然而，你永恒的夏日不会消逝。'],
  [18, 'So long as men can breathe, or eyes can see,', 'life', '只要人们还能呼吸，眼睛还能看见。'],
  [29, 'Haply I think on thee, and then my state,', 'love', '偶然想起你，我的心境便随之改变。'],
  [30, 'When to the sessions of sweet silent thought', 'solitude', '当我走入甜美而寂静的沉思。'],
  [30, 'But if the while I think on thee, dear friend,', 'love', '但若此刻我想起你，亲爱的朋友。'],
  [30, 'All losses are restor’d and sorrows end.', 'hope', '一切失落都得以补偿，悲伤也就结束。'],
  [60, 'Like as the waves make towards the pebbled shore,', 'time', '如同波浪涌向铺满卵石的海岸。'],
  [60, 'So do our minutes hasten to their end;', 'time', '我们的分分秒秒也如此奔向终点。'],
  [73, 'That time of year thou mayst in me behold', 'nature', '你也许能在我身上看见那样的季节。'],
  [73, 'This thou perceiv’st, which makes thy love more strong,', 'love', '你看见了这一切，而你的爱因此更加坚定。'],
  [98, 'From you have I been absent in the spring,', 'nature', '在春天，我曾与你分离。'],
  [116, 'Love is not love\nWhich alters when it alteration finds,', 'love', '因境遇的改变而改变的爱，并非真正的爱。'],
  [116, 'O, no! it is an ever-fixed mark,', 'courage', '不，爱是一座永不移动的航标。'],
  [116, 'Love’s not Time’s fool, though rosy lips and cheeks', 'time', '爱并不是时间的玩物，即使红唇与面颊终会改变。'],
];

const austen: [string, string, LiteraryCategory, string][] = [
  ['1', 'It is a truth universally acknowledged, that a single man in possession of a good fortune must be in want of a wife.', 'life', '有钱的单身男子必定需要一位妻子，这是举世公认的道理。原文以反讽开启故事。'],
  ['3', 'To be fond of dancing was a certain step towards falling in love;', 'love', '喜欢跳舞，是迈向爱情的一步。'],
  ['6', 'Happiness in marriage is entirely a matter of chance.', 'life', '婚姻中的幸福完全是运气问题。这是人物夏洛特的看法。'],
  ['11', 'there is no enjoyment like reading!', 'everyday', '没有什么乐趣能比得上阅读！这是人物的对白节选。'],
  ['9', 'People themselves alter so much, that there is something new to be observed in them for ever.', 'growth', '人们总在改变，因此我们总能从他们身上发现新的东西。'],
  ['11', 'My good opinion once lost is lost for ever.', 'life', '我的好感一旦失去，就永远失去了。这是达西当时的自述。'],
  ['34', 'In vain have I struggled.', 'courage', '我曾努力抗拒，却徒劳无功。'],
  ['36', 'Till this moment, I never knew myself.', 'growth', '直到这一刻，我才真正认识自己。'],
  ['11', 'I cannot forget the follies and vices of others so soon as I ought, nor their offences against myself.', 'life', '我无法像理应做到的那样，迅速忘掉他人的愚行、恶习，以及他们对我的冒犯。'],
  ['60', 'I was in the middle before I knew that I had begun.', 'love', '当我意识到自己已经开始时，我早已深陷其中。'],
];

const dickens: [string, string, LiteraryCategory, string][] = [
  ['1', 'Mankind was my business.', 'life', '关怀人类，本该是我的职责。'],
  ['2', 'The happiness he gives, is quite as great as if it cost a fortune.', 'everyday', '他带来的快乐，就像花费一大笔钱所能带来的一样多。'],
  ['3', 'There is nothing in the world so irresistibly contagious as laughter and good-humour.', 'hope', '世上没有什么比笑声与好心情更有感染力。'],
  ['4', 'I will honour Christmas in my heart, and try to keep it all the year.', 'growth', '我会在心里珍惜圣诞的精神，并努力让它贯穿全年。'],
  ['4', 'I will live in the Past, the Present, and the Future.', 'time', '我会铭记过去，活在当下，也心怀未来。'],
];

export const literaryQuotes: readonly LiteraryQuote[] = [
  ...sonnets.map(([number, quote, category, translation], index): LiteraryQuote => ({
    id: `shakespeare-${number}-${index}`, quote, category, translation,
    author: 'William Shakespeare', work: 'Shakespeare’s Sonnets', year: 1609,
    publicDomain: true, sourceUrl: 'https://www.gutenberg.org/ebooks/1041', location: `Sonnet ${number}`,
  })),
  ...austen.map(([chapter, quote, category, translation], index): LiteraryQuote => ({
    id: `austen-pp-${index}`, quote, category, translation,
    author: 'Jane Austen', work: 'Pride and Prejudice', year: 1813,
    publicDomain: true, sourceUrl: 'https://www.gutenberg.org/ebooks/1342', location: `Chapter ${chapter}`,
  })),
  ...dickens.map(([stave, quote, category, translation], index): LiteraryQuote => ({
    id: `dickens-cc-${index}`, quote, category, translation,
    author: 'Charles Dickens', work: 'A Christmas Carol', year: 1843,
    publicDomain: true, sourceUrl: 'https://www.gutenberg.org/ebooks/46', location: `Stave ${stave}`,
  })),
];

export const categoryLabels: Record<LiteraryCategory, string> = {
  growth: '成长', hope: '希望', courage: '勇气', life: '人生', solitude: '独处',
  love: '爱', time: '时间', nature: '自然', everyday: '日常',
};
