export interface Word {
  id: string;
  word: string;
  chinese: string;
  phonetic: string;
  theme: ThemeId;
  level: LevelId;
}

export type ThemeId =
  | 'animal'
  | 'color'
  | 'food'
  | 'family'
  | 'number'
  | 'school'
  | 'weather'
  | 'clothing'
  | 'toy'
  | 'body';

export type LevelId = 'preschool' | 'grade1' | 'grade2' | 'grade3' | 'extended';

export interface Theme {
  id: ThemeId;
  name: string;
  emoji: string;
  color: string;
}

export interface Level {
  id: LevelId;
  name: string;
  color: string;
  order: number;
}

export const LEVELS: Level[] = [
  { id: 'preschool', name: '学前', color: '#00B894', order: 1 },
  { id: 'grade1', name: '一年级', color: '#55EFC4', order: 2 },
  { id: 'grade2', name: '二年级', color: '#FFEAA7', order: 3 },
  { id: 'grade3', name: '三年级', color: '#FDCB6E', order: 4 },
  { id: 'extended', name: '扩展', color: '#FF7675', order: 5 },
];

export const THEMES: Theme[] = [
  { id: 'animal', name: '动物', emoji: '🐾', color: '#D63031' },
  { id: 'color', name: '颜色', emoji: '🎨', color: '#FD79A8' },
  { id: 'food', name: '食物', emoji: '🍎', color: '#E17055' },
  { id: 'family', name: '家庭', emoji: '👨‍👩‍👧', color: '#A29BFE' },
  { id: 'number', name: '数字', emoji: '🔢', color: '#0984E3' },
  { id: 'school', name: '学校', emoji: '🏫', color: '#00CEC9' },
  { id: 'weather', name: '天气', emoji: '☀️', color: '#FDCB6E' },
  { id: 'clothing', name: '衣物', emoji: '👕', color: '#00B894' },
  { id: 'toy', name: '玩具', emoji: '🧸', color: '#FF7675' },
  { id: 'body', name: '身体', emoji: '👋', color: '#E17055' },
];

export const VOCABULARY: Word[] = [
  // 学前 - 动物
  { id: 'w001', word: 'cat', chinese: '猫', phonetic: '/kæt/', theme: 'animal', level: 'preschool' },
  { id: 'w002', word: 'dog', chinese: '狗', phonetic: '/dɔːɡ/', theme: 'animal', level: 'preschool' },
  { id: 'w003', word: 'bird', chinese: '鸟', phonetic: '/bɜːd/', theme: 'animal', level: 'preschool' },
  { id: 'w004', word: 'fish', chinese: '鱼', phonetic: '/fɪʃ/', theme: 'animal', level: 'preschool' },
  { id: 'w005', word: 'pig', chinese: '猪', phonetic: '/pɪɡ/', theme: 'animal', level: 'preschool' },
  { id: 'w006', word: 'cow', chinese: '奶牛', phonetic: '/kaʊ/', theme: 'animal', level: 'preschool' },
  { id: 'w007', word: 'duck', chinese: '鸭子', phonetic: '/dʌk/', theme: 'animal', level: 'preschool' },
  { id: 'w008', word: 'bee', chinese: '蜜蜂', phonetic: '/biː/', theme: 'animal', level: 'preschool' },
  { id: 'w009', word: 'ant', chinese: '蚂蚁', phonetic: '/ænt/', theme: 'animal', level: 'preschool' },
  { id: 'w010', word: 'frog', chinese: '青蛙', phonetic: '/frɒɡ/', theme: 'animal', level: 'preschool' },
  // 学前 - 颜色
  { id: 'w011', word: 'red', chinese: '红色', phonetic: '/red/', theme: 'color', level: 'preschool' },
  { id: 'w012', word: 'blue', chinese: '蓝色', phonetic: '/bluː/', theme: 'color', level: 'preschool' },
  { id: 'w013', word: 'green', chinese: '绿色', phonetic: '/ɡriːn/', theme: 'color', level: 'preschool' },
  { id: 'w014', word: 'yellow', chinese: '黄色', phonetic: '/ˈjeloʊ/', theme: 'color', level: 'preschool' },
  { id: 'w015', word: 'pink', chinese: '粉色', phonetic: '/pɪŋk/', theme: 'color', level: 'preschool' },
  { id: 'w016', word: 'black', chinese: '黑色', phonetic: '/blæk/', theme: 'color', level: 'preschool' },
  { id: 'w017', word: 'white', chinese: '白色', phonetic: '/waɪt/', theme: 'color', level: 'preschool' },
  { id: 'w018', word: 'orange', chinese: '橙色', phonetic: '/ˈɔːrɪndʒ/', theme: 'color', level: 'preschool' },
  // 学前 - 数字
  { id: 'w019', word: 'one', chinese: '一', phonetic: '/wʌn/', theme: 'number', level: 'preschool' },
  { id: 'w020', word: 'two', chinese: '二', phonetic: '/tuː/', theme: 'number', level: 'preschool' },
  { id: 'w021', word: 'three', chinese: '三', phonetic: '/θriː/', theme: 'number', level: 'preschool' },
  { id: 'w022', word: 'four', chinese: '四', phonetic: '/fɔːr/', theme: 'number', level: 'preschool' },
  { id: 'w023', word: 'five', chinese: '五', phonetic: '/faɪv/', theme: 'number', level: 'preschool' },
  { id: 'w024', word: 'six', chinese: '六', phonetic: '/sɪks/', theme: 'number', level: 'preschool' },
  { id: 'w025', word: 'seven', chinese: '七', phonetic: '/ˈsevən/', theme: 'number', level: 'preschool' },
  { id: 'w026', word: 'eight', chinese: '八', phonetic: '/eɪt/', theme: 'number', level: 'preschool' },
  { id: 'w027', word: 'nine', chinese: '九', phonetic: '/naɪn/', theme: 'number', level: 'preschool' },
  { id: 'w028', word: 'ten', chinese: '十', phonetic: '/ten/', theme: 'number', level: 'preschool' },
  // 一年级 - 食物
  { id: 'w029', word: 'apple', chinese: '苹果', phonetic: '/ˈæpəl/', theme: 'food', level: 'grade1' },
  { id: 'w030', word: 'banana', chinese: '香蕉', phonetic: '/bəˈnænə/', theme: 'food', level: 'grade1' },
  { id: 'w031', word: 'orange', chinese: '橙子', phonetic: '/ˈɔːrɪndʒ/', theme: 'food', level: 'grade1' },
  { id: 'w032', word: 'milk', chinese: '牛奶', phonetic: '/mɪlk/', theme: 'food', level: 'grade1' },
  { id: 'w033', word: 'water', chinese: '水', phonetic: '/ˈwɔːtər/', theme: 'food', level: 'grade1' },
  { id: 'w034', word: 'egg', chinese: '鸡蛋', phonetic: '/eɡ/', theme: 'food', level: 'grade1' },
  { id: 'w035', word: 'rice', chinese: '米饭', phonetic: '/raɪs/', theme: 'food', level: 'grade1' },
  { id: 'w036', word: 'bread', chinese: '面包', phonetic: '/bred/', theme: 'food', level: 'grade1' },
  { id: 'w037', word: 'cake', chinese: '蛋糕', phonetic: '/keɪk/', theme: 'food', level: 'grade1' },
  { id: 'w038', word: 'tea', chinese: '茶', phonetic: '/tiː/', theme: 'food', level: 'grade1' },
  // 一年级 - 家庭
  { id: 'w039', word: 'mum', chinese: '妈妈', phonetic: '/mʌm/', theme: 'family', level: 'grade1' },
  { id: 'w040', word: 'dad', chinese: '爸爸', phonetic: '/dæd/', theme: 'family', level: 'grade1' },
  { id: 'w041', word: 'brother', chinese: '哥哥/弟弟', phonetic: '/ˈbrʌðər/', theme: 'family', level: 'grade1' },
  { id: 'w042', word: 'sister', chinese: '姐姐/妹妹', phonetic: '/ˈsɪstər/', theme: 'family', level: 'grade1' },
  { id: 'w043', word: 'baby', chinese: '婴儿', phonetic: '/ˈbeɪbi/', theme: 'family', level: 'grade1' },
  { id: 'w044', word: 'grandma', chinese: '奶奶/外婆', phonetic: '/ˈɡrænmɑː/', theme: 'family', level: 'grade1' },
  { id: 'w045', word: 'grandpa', chinese: '爷爷/外公', phonetic: '/ˈɡrænpɑː/', theme: 'family', level: 'grade1' },
  // 一年级 - 学校
  { id: 'w046', word: 'book', chinese: '书', phonetic: '/bʊk/', theme: 'school', level: 'grade1' },
  { id: 'w047', word: 'pen', chinese: '钢笔', phonetic: '/pen/', theme: 'school', level: 'grade1' },
  { id: 'w048', word: 'pencil', chinese: '铅笔', phonetic: '/ˈpensəl/', theme: 'school', level: 'grade1' },
  { id: 'w049', word: 'bag', chinese: '书包', phonetic: '/bæɡ/', theme: 'school', level: 'grade1' },
  { id: 'w050', word: 'desk', chinese: '桌子', phonetic: '/desk/', theme: 'school', level: 'grade1' },
  { id: 'w051', word: 'chair', chinese: '椅子', phonetic: '/tʃer/', theme: 'school', level: 'grade1' },
  { id: 'w052', word: 'teacher', chinese: '老师', phonetic: '/ˈtiːtʃər/', theme: 'school', level: 'grade1' },
  { id: 'w053', word: 'school', chinese: '学校', phonetic: '/skuːl/', theme: 'school', level: 'grade1' },
  // 二年级 - 天气
  { id: 'w054', word: 'sun', chinese: '太阳', phonetic: '/sʌn/', theme: 'weather', level: 'grade2' },
  { id: 'w055', word: 'moon', chinese: '月亮', phonetic: '/muːn/', theme: 'weather', level: 'grade2' },
  { id: 'w056', word: 'star', chinese: '星星', phonetic: '/stɑːr/', theme: 'weather', level: 'grade2' },
  { id: 'w057', word: 'rain', chinese: '雨', phonetic: '/reɪn/', theme: 'weather', level: 'grade2' },
  { id: 'w058', word: 'snow', chinese: '雪', phonetic: '/snoʊ/', theme: 'weather', level: 'grade2' },
  { id: 'w059', word: 'wind', chinese: '风', phonetic: '/wɪnd/', theme: 'weather', level: 'grade2' },
  { id: 'w060', word: 'cloud', chinese: '云', phonetic: '/klaʊd/', theme: 'weather', level: 'grade2' },
  { id: 'w061', word: 'hot', chinese: '热的', phonetic: '/hɒt/', theme: 'weather', level: 'grade2' },
  { id: 'w062', word: 'cold', chinese: '冷的', phonetic: '/koʊld/', theme: 'weather', level: 'grade2' },
  { id: 'w063', word: 'warm', chinese: '暖和的', phonetic: '/wɔːrm/', theme: 'weather', level: 'grade2' },
  // 二年级 - 衣物
  { id: 'w064', word: 'hat', chinese: '帽子', phonetic: '/hæt/', theme: 'clothing', level: 'grade2' },
  { id: 'w065', word: 'coat', chinese: '外套', phonetic: '/koʊt/', theme: 'clothing', level: 'grade2' },
  { id: 'w066', word: 'dress', chinese: '连衣裙', phonetic: '/dres/', theme: 'clothing', level: 'grade2' },
  { id: 'w067', word: 'shirt', chinese: '衬衫', phonetic: '/ʃɜːrt/', theme: 'clothing', level: 'grade2' },
  { id: 'w068', word: 'shoe', chinese: '鞋子', phonetic: '/ʃuː/', theme: 'clothing', level: 'grade2' },
  { id: 'w069', word: 'sock', chinese: '袜子', phonetic: '/sɒk/', theme: 'clothing', level: 'grade2' },
  { id: 'w070', word: 'glove', chinese: '手套', phonetic: '/ɡlʌv/', theme: 'clothing', level: 'grade2' },
  // 三年级 - 玩具
  { id: 'w071', word: 'ball', chinese: '球', phonetic: '/bɔːl/', theme: 'toy', level: 'grade3' },
  { id: 'w072', word: 'toy', chinese: '玩具', phonetic: '/ˈtɔɪ/', theme: 'toy', level: 'grade3' },
  { id: 'w073', word: 'game', chinese: '游戏', phonetic: '/ɡeɪm/', theme: 'toy', level: 'grade3' },
  { id: 'w074', word: 'card', chinese: '卡片', phonetic: '/kɑːrd/', theme: 'toy', level: 'grade3' },
  { id: 'w075', word: 'doll', chinese: '娃娃', phonetic: '/dɒl/', theme: 'toy', level: 'grade3' },
  { id: 'w076', word: 'bear', chinese: '熊', phonetic: '/ber/', theme: 'toy', level: 'grade3' },
  { id: 'w077', word: 'kite', chinese: '风筝', phonetic: '/kaɪt/', theme: 'toy', level: 'grade3' },
  { id: 'w078', word: 'boat', chinese: '小船', phonetic: '/boʊt/', theme: 'toy', level: 'grade3' },
  // 三年级 - 身体
  { id: 'w079', word: 'hand', chinese: '手', phonetic: '/hænd/', theme: 'body', level: 'grade3' },
  { id: 'w080', word: 'foot', chinese: '脚', phonetic: '/fʊt/', theme: 'body', level: 'grade3' },
  { id: 'w081', word: 'head', chinese: '头', phonetic: '/hed/', theme: 'body', level: 'grade3' },
  { id: 'w082', word: 'eye', chinese: '眼睛', phonetic: '/aɪ/', theme: 'body', level: 'grade3' },
  { id: 'w083', word: 'ear', chinese: '耳朵', phonetic: '/ɪr/', theme: 'body', level: 'grade3' },
  { id: 'w084', word: 'nose', chinese: '鼻子', phonetic: '/noʊz/', theme: 'body', level: 'grade3' },
  { id: 'w085', word: 'mouth', chinese: '嘴巴', phonetic: '/maʊθ/', theme: 'body', level: 'grade3' },
  { id: 'w086', word: 'face', chinese: '脸', phonetic: '/feɪs/', theme: 'body', level: 'grade3' },
  { id: 'w087', word: 'arm', chinese: '手臂', phonetic: '/ɑːrm/', theme: 'body', level: 'grade3' },
  { id: 'w088', word: 'leg', chinese: '腿', phonetic: '/leɡ/', theme: 'body', level: 'grade3' },
  // 扩展
  { id: 'w089', word: 'rabbit', chinese: '兔子', phonetic: '/ˈræbɪt/', theme: 'animal', level: 'extended' },
  { id: 'w090', word: 'elephant', chinese: '大象', phonetic: '/ˈelɪfənt/', theme: 'animal', level: 'extended' },
  { id: 'w091', word: 'tiger', chinese: '老虎', phonetic: '/ˈtaɪɡər/', theme: 'animal', level: 'extended' },
  { id: 'w092', word: 'monkey', chinese: '猴子', phonetic: '/ˈmʌŋki/', theme: 'animal', level: 'extended' },
  { id: 'w093', word: 'panda', chinese: '熊猫', phonetic: '/ˈpændə/', theme: 'animal', level: 'extended' },
  { id: 'w094', word: 'zebra', chinese: '斑马', phonetic: '/ˈziːbrə/', theme: 'animal', level: 'extended' },
  { id: 'w095', word: 'snake', chinese: '蛇', phonetic: '/sneɪk/', theme: 'animal', level: 'extended' },
  { id: 'w096', word: 'horse', chinese: '马', phonetic: '/hɔːrs/', theme: 'animal', level: 'extended' },
  { id: 'w097', word: 'sheep', chinese: '绵羊', phonetic: '/ʃiːp/', theme: 'animal', level: 'extended' },
  { id: 'w098', word: 'chicken', chinese: '小鸡', phonetic: '/ˈtʃɪkɪn/', theme: 'animal', level: 'extended' },
  { id: 'w099', word: 'purple', chinese: '紫色', phonetic: '/ˈpɜːrpəl/', theme: 'color', level: 'extended' },
  { id: 'w100', word: 'brown', chinese: '棕色', phonetic: '/braʊn/', theme: 'color', level: 'extended' },
  { id: 'w101', word: 'grey', chinese: '灰色', phonetic: '/ɡreɪ/', theme: 'color', level: 'extended' },
  { id: 'w102', word: 'coffee', chinese: '咖啡', phonetic: '/ˈkɒfi/', theme: 'food', level: 'extended' },
  { id: 'w103', word: 'juice', chinese: '果汁', phonetic: '/dʒuːs/', theme: 'food', level: 'extended' },
  { id: 'w104', word: 'sugar', chinese: '糖', phonetic: '/ˈʃʊɡər/', theme: 'food', level: 'extended' },
  { id: 'w105', word: 'salt', chinese: '盐', phonetic: '/sɔːlt/', theme: 'food', level: 'extended' },
  { id: 'w106', word: 'eleven', chinese: '十一', phonetic: '/ɪˈlevən/', theme: 'number', level: 'extended' },
  { id: 'w107', word: 'twelve', chinese: '十二', phonetic: '/twelv/', theme: 'number', level: 'extended' },
  { id: 'w108', word: 'twenty', chinese: '二十', phonetic: '/ˈtwenti/', theme: 'number', level: 'extended' },
];

export function getWordsByLevel(level: LevelId): Word[] {
  return VOCABULARY.filter((w) => w.level === level);
}

export function getWordsByTheme(theme: ThemeId): Word[] {
  return VOCABULARY.filter((w) => w.theme === theme);
}

export function getWordsByLevelAndTheme(level: LevelId, theme: ThemeId): Word[] {
  return VOCABULARY.filter((w) => w.level === level && w.theme === theme);
}

export function getThemesByLevel(level: LevelId): Theme[] {
  const themesInLevel = new Set(VOCABULARY.filter((w) => w.level === level).map((w) => w.theme));
  return THEMES.filter((t) => themesInLevel.has(t.id));
}

export function getWrongTheme(themeId: ThemeId): Theme | undefined {
  return THEMES.find((t) => t.id === themeId);
}

export function getLevelInfo(levelId: LevelId): Level | undefined {
  return LEVELS.find((l) => l.id === levelId);
}
