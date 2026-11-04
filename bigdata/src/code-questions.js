
/* ===== 실기(코드) 문제 템플릿 ===== */
(function (G) {
  'use strict';

  function mkR(seed) {
    let a = seed >>> 0;
    const f = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const r = {
      f,
      int: (lo, hi) => lo + Math.floor(f() * (hi - lo + 1)),
      pick: arr => arr[Math.floor(f() * arr.length)],
      chance: p => f() < p,
      shuffle: arr => { const b = arr.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(f() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; },
    };
    r.sample = (arr, k) => r.shuffle(arr).slice(0, k);
    r.ordered = (arr, k) => { const s = new Set(r.sample(arr.map((_, i) => i), k)); return arr.filter((_, i) => s.has(i)); };
    return r;
  }

  // 받침 판정 (한글/숫자/영문 근사)
  function batchim(word) {
    const w = String(word).replace(/[\s)\]'"»]+$/, '');
    const ch = w[w.length - 1] || '';
    const code = ch.charCodeAt(0);
    if (code >= 0xAC00 && code <= 0xD7A3) { const j = (code - 0xAC00) % 28; return j === 0 ? 0 : (j === 8 ? 2 : 1); }
    if (/[0-9]/.test(ch)) return { '0': 1, '1': 2, '2': 0, '3': 1, '4': 0, '5': 0, '6': 1, '7': 2, '8': 2, '9': 0 }[ch];
    if (/[lL]/.test(ch)) return 2;
    if (/[mnMN]/.test(ch)) return 1;
    return 0;
  }
  function j(word, pair) {
    const b = batchim(word);
    const [x, y] = pair.split('/');
    if (pair === '으로/로') return word + (b === 1 ? '으로' : '로');
    return word + (b ? x : y);
  }

  const S = {
    learn: "import pandas as pd\nimport numpy as np\n\ndata = pd.read_csv('05장_실습데이터_학습활동.csv')",
    exam: "import pandas as pd\nimport numpy as np\n\nexam = pd.read_csv('exam.csv')",
    mpg: "import pandas as pd\nimport numpy as np\n\nmpg = pd.read_csv('mpg.csv')",
    cafe: "import pandas as pd\n\ncafe = pd.read_csv('ch6_campus_cafe_orders.csv')\nstore = pd.read_csv('ch6_store_info.csv')\nevent = pd.read_csv('ch6_event_orders.csv')",
    mpg6: "import pandas as pd\n\nmpg = pd.read_csv('mpg.csv')",
    exam6: "import pandas as pd\n\nexam = pd.read_csv('exam.csv')",
    life: "import pandas as pd\nimport numpy as np\n\ndf = pd.read_csv('07장_학생생활데이터.csv')",
    viz: "import pandas as pd\nimport seaborn as sns\nimport matplotlib.pyplot as plt\n\nplt.rc('font', family='Malgun Gothic')\nplt.rc('axes', unicode_minus=False)\n\ndf = pd.read_csv('08장_캠퍼스생활_시각화데이터.csv')",
    vmpg: "import pandas as pd\nimport seaborn as sns\n\nmpg = pd.read_csv('mpg.csv')",
    econ: "import pandas as pd\nimport seaborn as sns\n\neconomics = pd.read_csv('economics.csv')",
  };
  S.lifeApp = S.life + '\n\ndf_app = df.copy()';
  S.learnNew = S.learn + "\n\ndata_new = data.copy()\ndata_new = data_new.rename(columns={\n    'sid': 'student_id', 'grd': 'grade', 'vmin': 'video_minutes',\n    'q1': 'quiz1', 'q2': 'quiz2', 'asg': 'assignment',\n    'att': 'attendance_days', 'dev': 'device'\n})";
  S.examMean = S.exam + "\n\nexam['total'] = exam['math'] + exam['english'] + exam['science']\nexam['mean'] = exam['total'] / 3";
  S.mpgTotal = S.mpg + "\n\nmpg['total'] = (mpg['cty'] + mpg['hwy']) / 2";
  S.learnMean = S.learnNew + "\n\ndata_new['total_score'] = data_new['quiz1'] + data_new['quiz2'] + data_new['assignment']\ndata_new['mean_score'] = data_new['total_score'] / 3";

  const DS5 = [
    { v: 'data', s: S.learn, num: ['vmin', 'q1', 'q2', 'asg', 'att'], cat: ['dev', 'grd'] },
    { v: 'exam', s: S.exam, num: ['math', 'english', 'science'], cat: ['nclass'] },
    { v: 'mpg', s: S.mpg, num: ['displ', 'cty', 'hwy'], cat: ['drv', 'category', 'fl', 'manufacturer', 'year'] },
  ];
  const STAT = { mean: '평균', min: '최솟값', max: '최댓값', median: '중앙값', sum: '합계' };

  const T = [];
  const add = (ch, id, gen) => T.push({ ch, id, gen });
  const pyList = a => '[' + a.map(x => typeof x === 'string' ? `'${x}'` : x).join(', ') + ']';

  /* ---------------- CHAPTER 05 ---------------- */
  add(5, 'head', r => {
    const d = r.pick(DS5), n = r.int(2, 8), tail = r.chance(0.4);
    return {
      title: tail ? '데이터의 뒷부분 확인하기' : '데이터의 앞부분 확인하기',
      prompt: `${d.v}의 ${tail ? '뒤' : '앞'} ${n}행을 확인하세요.`,
      hint: `${tail ? '«tail()»' : '«head()»'} 괄호 안에 확인할 행 수를 넣으세요.`,
      setup: d.s, answer: `${d.v}.${tail ? 'tail' : 'head'}(${n})`,
    };
  });
  add(5, 'shape', r => {
    const d = r.pick(DS5), k = r.int(0, 2);
    const p = ['몇 행, 몇 열인지 확인하세요.', '행의 개수만 확인하세요.', '열의 개수만 확인하세요.'][k];
    return {
      title: '데이터의 크기 확인하기', prompt: `${j(d.v, '이/가')} ${p}`,
      hint: '«shape»는 괄호 없이 사용하는 어트리뷰트입니다.' + (k ? ' «shape[0]»은 행, «shape[1]»은 열입니다.' : ''),
      setup: d.s, answer: `${d.v}.shape${['', '[0]', '[1]'][k]}`,
    };
  });
  add(5, 'describe', r => {
    const d = r.pick(DS5), all = r.chance(0.4);
    return {
      title: all ? '문자 변수까지 요약 통계량 확인하기' : '요약 통계량 확인하기',
      prompt: all ? `${d.v}의 문자 변수까지 포함한 요약 통계량을 확인하세요.` : `${d.v}의 요약 통계량을 확인하세요.`,
      hint: all ? "«describe()»에 «include='all'»을 추가하세요." : '«describe()»를 사용하세요.',
      setup: d.s, answer: `${d.v}.describe(${all ? "include='all'" : ''})`,
    };
  });
  add(5, 'stats', r => {
    const d = r.pick(DS5), col = r.pick(d.num);
    const ks = r.ordered(['mean', 'median', 'min', 'max', 'sum'], r.int(2, 3));
    const lab = ks.map(k => STAT[k]);
    return {
      title: `${col}의 대표값 구하기`,
      prompt: `${d.v}에서 ${col}의 ${j(lab.join(', '), '을/를')} 각각 구하세요.`,
      hint: ks.map(k => `«${k}()»`).join(', ') + ' 메서드를 사용하세요.',
      setup: d.s, answer: ks.map(k => `print(${d.v}['${col}'].${k}())`).join('\n'),
    };
  });
  add(5, 'rename', r => {
    const k = r.int(0, 2);
    let base, newv, pairs;
    if (k === 0) {
      base = 'data'; newv = 'data_new';
      pairs = r.ordered([['sid', 'student_id'], ['grd', 'grade'], ['vmin', 'video_minutes'], ['q1', 'quiz1'], ['q2', 'quiz2'], ['asg', 'assignment'], ['att', 'attendance_days'], ['dev', 'device']], r.int(2, 4));
    } else if (k === 1) {
      base = 'mpg'; newv = 'mpg_new';
      pairs = r.ordered([['manufacturer', 'maker'], ['displ', 'displacement'], ['drv', 'drive'], ['cty', 'city'], ['hwy', 'highway'], ['fl', 'fuel']], r.int(2, 3));
    } else {
      base = 'exam'; newv = 'exam_new';
      pairs = r.ordered([['nclass', 'class_no'], ['math', 'math_score'], ['english', 'eng'], ['science', 'sci']], r.int(2, 3));
    }
    return {
      title: '복사본을 만들고 변수명 정리하기',
      prompt: `원본 ${j(base, '이/가')} 바뀌지 않도록 ${newv} = ${base}.copy()를 실행한 뒤, 변수명을 다음과 같이 바꾸세요: ${pairs.map(p => `${p[0]} -> ${p[1]}`).join(', ')}.`,
      hint: "«rename(columns={'옛이름': '새이름'})» 결과를 다시 대입하세요.",
      setup: [S.learn, S.mpg, S.exam][k],
      answer: `${newv} = ${base}.copy()\n${newv} = ${newv}.rename(columns={\n${pairs.map(p => `    '${p[0]}': '${p[1]}'`).join(',\n')}\n})\n${newv}.head()`,
      checks: [`list(${newv}.columns)`, `list(${base}.columns)`],
    };
  });
  add(5, 'derive', r => {
    const k = r.int(0, 2);
    if (k === 0) {
      const cols = r.chance(0.6) ? ['math', 'english', 'science'] : r.ordered(['math', 'english', 'science'], 2);
      const n = cols.length;
      return {
        title: '합계와 평균 파생변수 만들기',
        prompt: `${j(cols.join(', '), '을/를')} 더해 total 열을 만들고, total을 ${j(String(n), '으로/로')} 나누어 mean 열을 만드세요.`,
        hint: "«exam['새열'] = ...» 형태로 열 단위 계산을 하세요.",
        setup: S.exam,
        answer: `exam['total'] = ${cols.map(c => `exam['${c}']`).join(' + ')}\nexam['mean'] = exam['total'] / ${n}\nexam[['total', 'mean']].head()`,
        checks: ["exam['total']", "exam['mean']"],
      };
    }
    if (k === 1) {
      return {
        title: '파생변수 만들기',
        prompt: 'quiz1 + quiz2 + assignment을 더해 total_score 열을 만들고, total_score을 3으로 나누어 mean_score 열을 만드세요.',
        hint: '변수명이 바뀐 data_new를 사용하세요.',
        setup: S.learnNew,
        answer: "data_new['total_score'] = data_new['quiz1'] + data_new['quiz2'] + data_new['assignment']\ndata_new['mean_score'] = data_new['total_score'] / 3\ndata_new.head()",
        checks: ["data_new['total_score']", "data_new['mean_score']"],
      };
    }
    return {
      title: '통합 연비 변수 만들기',
      prompt: 'cty와 hwy를 더해 2로 나눈 total 열을 만들고 앞 5행을 확인하세요.',
      hint: '괄호로 덧셈을 먼저 계산한 뒤 2로 나누세요.',
      setup: S.mpg, answer: "mpg['total'] = (mpg['cty'] + mpg['hwy']) / 2\nmpg.head()",
      checks: ["mpg['total']"],
    };
  });
  add(5, 'where', r => {
    const k = r.int(0, 2);
    const lab = r.pick([['pass', 'fail'], ['pass', 'review'], ['합격', '불합격']]);
    if (k === 0) {
      const t = r.pick([50, 55, 60, 65, 70, 75]);
      return {
        title: '조건에 따라 판정 변수 만들기',
        prompt: `mean이 ${t} 이상이면 '${lab[0]}', 그렇지 않으면 ${j(`'${lab[1]}'`, '이/가')} 되도록 result 열을 만들고, result의 빈도를 value_counts()로 확인하세요.`,
        hint: '«np.where(조건, 참일 때 값, 거짓일 때 값)»',
        setup: S.examMean,
        answer: `exam['result'] = np.where(exam['mean'] >= ${t}, '${lab[0]}', '${lab[1]}')\nexam['result'].value_counts()`,
        checks: ["exam['result']"],
      };
    }
    if (k === 1) {
      const t = r.int(18, 25);
      return {
        title: '연비 합격 판정 변수 만들기',
        prompt: `total이 ${t} 이상이면 '${lab[0]}', 그렇지 않으면 ${j(`'${lab[1]}'`, '이/가')} 되도록 test 열을 만들고 빈도를 확인하세요.`,
        hint: 'NumPy를 np라는 이름으로 불러온 뒤 «np.where()»를 사용하세요.',
        setup: S.mpgTotal,
        answer: `mpg['test'] = np.where(mpg['total'] >= ${t}, '${lab[0]}', '${lab[1]}')\nmpg['test'].value_counts()`,
        checks: ["mpg['test']"],
      };
    }
    const t = r.pick([75, 78, 80, 82, 85]);
    return {
      title: '성취 결과 변수 만들기',
      prompt: `mean_score가 ${t} 이상이면 '${lab[0]}', 그렇지 않으면 ${j(`'${lab[1]}'`, '이/가')} 되도록 result 열을 만들고 빈도를 확인하세요.`,
      hint: '«np.where()»로 만든 뒤 «value_counts()»로 확인하세요.',
      setup: S.learnMean,
      answer: `data_new['result'] = np.where(data_new['mean_score'] >= ${t}, '${lab[0]}', '${lab[1]}')\ndata_new['result'].value_counts()`,
      checks: ["data_new['result']"],
    };
  });
  add(5, 'grade3', r => {
    const k = r.int(0, 2);
    const conf = [
      { setup: S.examMean, v: 'exam', col: 'mean', nc: 'grade', ts: r.pick([[70, 50], [75, 55], [80, 60], [65, 45]]) },
      { setup: S.mpgTotal, v: 'mpg', col: 'total', nc: 'grade', ts: r.pick([[30, 20], [28, 22], [25, 18]]) },
      { setup: S.learnMean, v: 'data_new', col: 'mean_score', nc: 'level', ts: r.pick([[90, 80], [88, 78], [85, 75]]) },
    ][k];
    const [a, b] = conf.ts, x = `${conf.v}['${conf.col}']`;
    const useSelect = r.chance(0.5);
    const ans = useSelect
      ? `conditions = [\n    ${x} >= ${a},\n    ${x} >= ${b}\n]\nchoices = ['A', 'B']\n${conf.v}['${conf.nc}'] = np.select(conditions, choices, default='C')\n${conf.v}['${conf.nc}'].value_counts()`
      : `${conf.v}['${conf.nc}'] = np.where(${x} >= ${a}, 'A',\n              np.where(${x} >= ${b}, 'B', 'C'))\n${conf.v}['${conf.nc}'].value_counts()`;
    return {
      title: '등급 변수 만들기',
      prompt: `${j(conf.col, '이/가')} ${a} 이상이면 A, ${b} 이상 ${a} 미만이면 B, ${b} 미만이면 C가 되도록 ${conf.nc} 열을 만들고 빈도를 확인하세요.`,
      hint: '«np.where()»를 중첩하거나 «np.select()»를 사용하세요.',
      setup: conf.setup, answer: ans, checks: [`${conf.v}['${conf.nc}']`],
    };
  });
  add(5, 'vc', r => {
    const d = r.pick(DS5), col = r.pick(d.cat);
    return {
      title: '범주별 빈도 확인하기', prompt: `${d.v}에서 ${col}의 빈도를 확인하세요.`,
      hint: '«value_counts()»를 사용하세요.', setup: d.s, answer: `${d.v}['${col}'].value_counts()`,
    };
  });
  add(5, 'columns', r => {
    const d = r.pick(DS5);
    return {
      title: '변수명 확인하기', prompt: `${d.v}의 변수명(열 이름)을 모두 확인하세요.`,
      hint: '«columns» 어트리뷰트를 사용하세요.', setup: d.s, answer: `${d.v}.columns`,
    };
  });
  add(5, 'diff', r => {
    const [a, b] = r.sample(['math', 'english', 'science'], 2);
    const n = r.int(3, 6);
    return {
      title: '차이 변수 만들기', prompt: `${a}에서 ${j(b, '을/를')} 뺀 diff 열을 만들고 앞 ${n}행을 확인하세요.`,
      hint: '두 열을 빼서 새 열에 대입하세요.', setup: S.exam,
      answer: `exam['diff'] = exam['${a}'] - exam['${b}']\nexam.head(${n})`, checks: ["exam['diff']"],
    };
  });
  add(5, 'chain5', r => {
    const t = r.pick([75, 80, 85]);
    return {
      title: '변수명 정리부터 판정까지',
      prompt: `data_new를 만들어 q1 -> quiz1, q2 -> quiz2, asg -> assignment로 바꾼 뒤, 세 변수의 평균을 mean_score 열로 만들고 mean_score가 ${t} 이상이면 'pass', 그렇지 않으면 'review'인 result 열을 만드세요.`,
      hint: '«copy()» → «rename()» → 파생변수 → «np.where()» 순서로 작성하세요.',
      setup: S.learn,
      answer: `data_new = data.copy()\ndata_new = data_new.rename(columns={'q1': 'quiz1', 'q2': 'quiz2', 'asg': 'assignment'})\ndata_new['mean_score'] = (data_new['quiz1'] + data_new['quiz2'] + data_new['assignment']) / 3\ndata_new['result'] = np.where(data_new['mean_score'] >= ${t}, 'pass', 'review')\ndata_new['result'].value_counts()`,
      checks: ["data_new['mean_score']", "data_new['result']"],
    };
  });

  /* ---------------- CHAPTER 06 ---------------- */
  const STORES = ['A관', 'B관', 'C관'], CATS = ['음료', '디저트', '샌드위치'], PAYS = ['카드', '현금', '간편결제'], DAYS = ['월', '화', '수', '목', '금'];
  const MENUS = ['아메리카노', '카페라떼', '바닐라라떼', '머핀', '쿠키', '브라우니', '햄치즈', '치킨샌드', '에그샌드'];
  const GRP = { store: '매장', category: '카테고리', payment: '결제수단', weekday: '요일', menu: '메뉴' };
  const TGT = { sales: '매출', quantity: '판매수량', rating: '평점', price: '가격' };

  add(6, 'q1', r => {
    const k = r.int(0, 4);
    let p, q;
    if (k === 0) { const s = r.pick(STORES); p = `${s} 주문만 추출하세요.`; q = `store == '${s}'`; }
    else if (k === 1) { const c = r.pick(CATS); p = `카테고리가 ${c}인 주문만 추출하세요.`; q = `category == '${c}'`; }
    else if (k === 2) { const c = r.pick(PAYS); p = `결제수단이 ${c}인 주문만 추출하세요.`; q = `payment == '${c}'`; }
    else if (k === 3) { const d = r.pick(DAYS); p = `${d}요일 주문만 추출하세요.`; q = `weekday == '${d}'`; }
    else { const s = r.pick(STORES); p = `${j(s, '을/를')} 제외한 나머지 매장의 주문만 추출하세요.`; q = `store != '${s}'`; }
    return { title: '조건에 맞는 행 추출하기', prompt: p, hint: '«query()»를 사용하고 결과 행 수를 확인하세요.', setup: S.cafe, answer: `cafe.query("${q}")` };
  });
  add(6, 'q2', r => {
    const k = r.int(0, 3);
    let p, q;
    if (k === 0) { const x = r.pick([4.3, 4.5, 4.6, 4.7, 4.8]); p = `평점(rating)이 ${x} 이상인 주문을 추출하세요.`; q = `rating >= ${x}`; }
    else if (k === 1) { const x = r.int(2, 4); p = `수량(quantity)이 ${x}개 이상인 주문을 추출하세요.`; q = `quantity >= ${x}`; }
    else if (k === 2) { const x = r.int(11, 14); p = `주문 시간(hour)이 ${x} 이상인 주문을 추출하세요.`; q = `hour >= ${x}`; }
    else { const x = r.pick([2500, 3000, 3500, 4000]); p = `가격(price)이 ${x}원 이하인 주문을 추출하세요.`; q = `price <= ${x}`; }
    return { title: '숫자 조건으로 행 추출하기', prompt: p, hint: '«query()» 안에 비교 연산자를 사용하세요.', setup: S.cafe, answer: `cafe.query("${q}")` };
  });
  add(6, 'q_and', r => {
    const k = r.int(0, 2);
    let p, q;
    if (k === 0) { const c = r.pick(CATS), x = r.pick([4.5, 4.6, 4.7]); p = `${c}이면서 평점이 ${x} 이상인 주문을 추출하세요.`; q = `category == '${c}' & rating >= ${x}`; }
    else if (k === 1) { const s = r.pick(STORES), x = r.int(2, 3); p = `${s} 주문이면서 수량이 ${x}개 이상인 주문을 추출하세요.`; q = `store == '${s}' & quantity >= ${x}`; }
    else { const c = r.pick(PAYS), x = r.int(11, 13); p = `결제수단이 ${c}이고 hour가 ${x} 이상인 주문을 추출하세요.`; q = `payment == '${c}' & hour >= ${x}`; }
    return { title: '복수 조건으로 행 추출하기', prompt: p, hint: '복수 조건을 and(&)로 연결하세요.', setup: S.cafe, answer: `cafe.query("${q}")` };
  });
  add(6, 'q_or', r => {
    let p, q;
    if (r.chance(0.5)) { const c = r.pick(PAYS), x = r.int(3, 4); p = `결제수단이 ${c}이거나 수량이 ${x}개 이상인 주문을 추출하세요.`; q = `payment == '${c}' | quantity >= ${x}`; }
    else { const v = r.pick([9000, 10000, 11000]); p = `평점이 4.8 이상이거나 매출(sales)이 ${v}원 이상인 주문을 추출하세요.`; q = `rating >= 4.8 | sales >= ${v}`; }
    return { title: '또는 조건으로 행 추출하기', prompt: p, hint: '조건을 or(|)로 연결하세요.', setup: S.cafe, answer: `cafe.query("${q}")` };
  });
  add(6, 'q_in', r => {
    const k = r.int(0, 1);
    if (k === 0) {
      const ps = r.ordered(PAYS, 2), x = r.int(2, 3);
      return { title: '여러 값 중 하나에 해당하는 행 추출하기', prompt: `결제수단이 ${ps[0]} 또는 ${ps[1]}이고, 수량이 ${x}개 이상인 주문을 추출하세요.`, hint: 'in 조건과 and를 조합하세요.', setup: S.cafe, answer: `cafe.query("payment in ['${ps[0]}', '${ps[1]}'] & quantity >= ${x}")` };
    }
    const ms = r.ordered(MENUS, r.int(2, 3));
    return { title: '여러 값 중 하나에 해당하는 행 추출하기', prompt: `메뉴(menu)가 ${ms.join(', ')} 중 하나인 주문을 추출하세요.`, hint: '«in [...]» 조건을 사용하세요.', setup: S.cafe, answer: `cafe.query("menu in ${pyList(ms)}")` };
  });
  add(6, 'cols', r => {
    const cols = r.ordered(['order_id', 'store', 'category', 'menu', 'price', 'quantity', 'payment', 'weekday', 'hour', 'rating', 'sales'], r.int(3, 5));
    const n = r.int(3, 7);
    return { title: '필요한 열만 선택하기', prompt: `${cols.join(', ')} 열만 선택해 앞의 ${n}행을 확인하세요.`, hint: '대괄호 리스트를 사용하세요.', setup: S.cafe, answer: `cafe[${pyList(cols)}].head(${n})` };
  });
  add(6, 'drop', r => {
    const cols = r.ordered(['order_id', 'price', 'payment', 'weekday', 'hour', 'rating'], r.int(1, 3));
    return { title: '필요 없는 열 제거하기', prompt: `cafe에서 ${cols.join(', ')} 열을 제거하고 앞 5행을 확인하세요.`, hint: '«drop(columns=[...])»를 사용하세요.', setup: S.cafe, answer: `cafe.drop(columns=${pyList(cols)}).head()` };
  });
  add(6, 'sort', r => {
    const c = r.pick(['sales', 'price', 'sales']), desc = r.chance(0.7), n = r.int(3, 7);
    const sel = r.chance(0.4);
    return {
      title: '정렬하기',
      prompt: sel ? `store, menu, ${c} 열만 선택한 뒤 ${TGT[c]}(${c})이 ${desc ? '큰' : '작은'} 순서대로 정렬하여 상위 ${n}건을 확인하세요.` : `${TGT[c]}(${c})이 ${desc ? '큰' : '작은'} 순서대로 정렬하고 상위 ${n}건을 확인하세요.`,
      hint: '«sort_values()»와 «head()»를 함께 사용하세요.' + (desc ? ' 내림차순은 «ascending=False»입니다.' : ''),
      setup: S.cafe, answer: `cafe${sel ? `[['store', 'menu', '${c}']]` : ''}.sort_values('${c}'${desc ? ', ascending=False' : ''}).head(${n})`,
    };
  });
  const STATNAME = {
    sales: { mean: '평균 매출', sum: '총매출', max: '최대 매출', count: '주문 건수' },
    quantity: { mean: '평균 판매수량', sum: '판매수량 합계', max: '최대 판매수량', count: '주문 건수' },
    rating: { mean: '평균 평점', max: '최고 평점', min: '최저 평점', count: '주문 건수' },
  };
  add(6, 'group', r => {
    const g = r.pick(['store', 'category', 'payment', 'weekday']), t = r.pick(['sales', 'sales', 'quantity', 'rating']);
    const ks = r.ordered(Object.keys(STATNAME[t]), 2);
    const nm = ks.map(k => STATNAME[t][k]);
    return {
      title: '집단별 요약하기', prompt: `${GRP[g]}별 ${j(nm[0], '과/와')} ${j(nm[1], '을/를')} 구하세요.`,
      hint: '«groupby()» + «agg()»를 사용하세요.', setup: S.cafe,
      answer: `cafe.groupby('${g}')['${t}'].agg(${pyList(ks)})`,
    };
  });
  add(6, 'group_sort', r => {
    const g = r.pick(['store', 'category', 'payment', 'weekday', 'menu']), t = r.pick(['rating', 'sales', 'quantity']);
    const lab = { rating: '평균 평점', sales: '평균 매출', quantity: '평균 판매수량' }[t];
    return {
      title: '집단별 요약 후 정렬하기', prompt: `${GRP[g]}별 주문 건수와 ${j(lab, '을/를')} 구하고, ${j(lab, '이/가')} 높은 순으로 정렬하세요.`,
      hint: 'count와 mean을 함께 계산하세요.', setup: S.cafe,
      answer: `cafe.groupby('${g}')['${t}'].agg(['count', 'mean']).sort_values('mean', ascending=False)`,
    };
  });
  add(6, 'q_group', r => {
    const k = r.int(0, 2);
    let fq, fl, g;
    if (k === 0) { const c = r.pick(['음료', '샌드위치', '디저트']); fq = `category == '${c}'`; fl = `${c}만`; g = 'menu'; }
    else if (k === 1) { const s = r.pick(STORES); fq = `store == '${s}'`; fl = `${s} 주문만`; g = r.pick(['menu', 'category', 'payment']); }
    else { const p = r.pick(['카드', '간편결제']); fq = `payment == '${p}'`; fl = `결제수단이 ${p}인 주문만`; g = r.pick(['store', 'category']); }
    const t = r.pick(['quantity', 'sales']);
    const tl = t === 'quantity' ? '판매수량 합계' : '총매출';
    return {
      title: '추출 후 집단별 합계 구하기', prompt: `${fl} 추출한 뒤 ${GRP[g]}별 ${j(tl, '을/를')} 구해 높은 순으로 정렬하세요.`,
      hint: 'query → groupby → agg → sort 순서로 작성하세요.', setup: S.cafe,
      answer: `cafe.query("${fq}").groupby('${g}')['${t}'].agg('sum').sort_values(ascending=False)`,
    };
  });
  add(6, 'multi_agg', r => {
    const h = r.int(11, 13), g = r.pick(['category', 'store', 'payment']);
    return {
      title: '조건 추출과 다중 요약', prompt: `hour가 ${h} 이상인 주문을 대상으로 ${GRP[g]}별 총매출·평균매출·주문건수를 구해 총매출 순으로 정렬하세요.`,
      hint: "«agg(총매출=('sales', 'sum'), ...)»처럼 이름을 붙여 요약하세요.", setup: S.cafe,
      answer: `cafe.query("hour >= ${h}").groupby('${g}').agg(\n    총매출=('sales', 'sum'),\n    평균매출=('sales', 'mean'),\n    주문건수=('sales', 'count')\n).sort_values('총매출', ascending=False)`,
    };
  });
  add(6, 'two_key', r => {
    const [a, b] = r.ordered(['store', 'category', 'payment', 'weekday'], 2);
    return {
      title: '두 기준으로 집단 요약하기', prompt: `${j(GRP[a], '과/와')} ${GRP[b]}별 총매출을 구해 총매출이 높은 순으로 정렬하세요.`,
      hint: '«groupby()»에 열 이름 리스트를 넣으세요.', setup: S.cafe,
      answer: `cafe.groupby(['${a}', '${b}']).agg(총매출=('sales', 'sum')).sort_values('총매출', ascending=False)`,
    };
  });
  add(6, 'chain_filter', r => {
    const x = r.pick([4.3, 4.5]), q = r.int(2, 3);
    return {
      title: '메서드 체인으로 해결하기', prompt: `평점 ${x} 이상이면서 수량 ${q}개 이상인 주문만 남긴 뒤, 매장별 총매출과 평균 평점을 구해 총매출 순으로 정렬하세요.`,
      hint: 'query → groupby → agg → sort_values 체인', setup: S.cafe,
      answer: `cafe.query("rating >= ${x} & quantity >= ${q}").groupby('store').agg(\n    총매출=('sales', 'sum'),\n    평균평점=('rating', 'mean')\n).sort_values('총매출', ascending=False)`,
    };
  });
  add(6, 'merge', r => {
    const k = r.int(0, 2);
    if (k === 0) return { title: '데이터 합치기', prompt: 'cafe와 store를 store 열을 기준으로 합쳐 cafe_store를 만들고 앞 5행을 확인하세요.', hint: '«pd.merge(..., on=...)»를 사용하세요.', setup: S.cafe, answer: "cafe_store = pd.merge(cafe, store, on='store')\ncafe_store.head()", checks: ['cafe_store'] };
    if (k === 1) return { title: '합친 데이터 분석하기', prompt: 'cafe와 store를 합친 뒤 위치(location)별 총매출을 구하고 총매출이 높은 순으로 정렬하세요.', hint: 'merge 결과를 이용해 분석하세요.', setup: S.cafe, answer: "cafe_store = pd.merge(cafe, store, on='store')\ncafe_store.groupby('location').agg(총매출=('sales', 'sum')).sort_values('총매출', ascending=False)" };
    return { title: '합친 데이터 분석하기', prompt: '합친 데이터에서 매장·위치별 총매출과 평균 평점을 구하고 총매출이 높은 순으로 정렬하세요.', hint: 'merge 결과를 이용해 분석하세요.', setup: S.cafe, answer: "cafe_store = pd.merge(cafe, store, on='store')\ncafe_store.groupby(['store', 'location']).agg(\n    총매출=('sales', 'sum'),\n    평균평점=('rating', 'mean')\n).sort_values('총매출', ascending=False)" };
  });
  add(6, 'merge_q', r => {
    const s = r.pick([30, 35, 40]);
    return {
      title: '합치기 후 조건 추출하기', prompt: `매장 정보와 합친 후 좌석 수(seats)가 ${s}석 이상인 매장만 추출하여 매장·위치별 총매출을 비교하세요.`,
      hint: 'merge → query → groupby → agg → sort', setup: S.cafe,
      answer: `cafe_store = pd.merge(cafe, store, on='store')\ncafe_store.query("seats >= ${s}").groupby(['store', 'location']).agg(\n    총매출=('sales', 'sum')\n).sort_values('총매출', ascending=False)`,
    };
  });
  add(6, 'concat', r => {
    const k = r.int(0, 1);
    if (k === 0) return { title: '세로로 데이터 합치기', prompt: '일반 주문(cafe)과 축제 주문(event)을 행 방향으로 합친 all_orders를 만들고 행과 열의 개수를 확인하세요.', hint: '«pd.concat([...])»를 사용하세요.', setup: S.cafe, answer: 'all_orders = pd.concat([cafe, event])\nall_orders.shape', checks: ['all_orders'] };
    const g = r.pick(['store', 'category', 'payment']);
    return {
      title: '세로로 합친 뒤 집단 요약하기', prompt: `일반 주문(cafe)과 축제 주문(event)을 행 방향으로 합친 뒤 ${GRP[g]}별 총매출과 주문건수를 구해 총매출 순으로 정렬하세요.`,
      hint: '«pd.concat()» 후 집단 요약', setup: S.cafe,
      answer: `all_orders = pd.concat([cafe, event])\nall_orders.groupby('${g}').agg(\n    총매출=('sales', 'sum'),\n    주문건수=('sales', 'count')\n).sort_values('총매출', ascending=False)`,
    };
  });
  add(6, 'top1', r => {
    const big = r.chance(0.7);
    return {
      title: '1위 주문 자동으로 찾기', prompt: `매출이 가장 ${big ? '큰' : '작은'} 주문 1건의 store, menu, sales를 확인하세요.`,
      hint: '«sort_values()» 후 «iloc[0]»으로 첫 행을 꺼내세요.', setup: S.cafe,
      answer: `cafe.sort_values('sales'${big ? ', ascending=False' : ''}).iloc[0][['store', 'menu', 'sales']]`,
    };
  });
  add(6, 'mpg6', r => {
    const k = r.int(0, 4);
    if (k === 0) { const m = r.pick(['audi', 'toyota', 'ford', 'hyundai', 'honda', 'chevrolet', 'volkswagen']); return { title: '조건 추출 후 평균 구하기', prompt: `mpg에서 manufacturer가 '${m}'인 자동차의 cty 평균을 구하세요.`, hint: '«query()»로 추출한 뒤 열을 선택해 «mean()»을 구하세요.', setup: S.mpg6, answer: `mpg.query("manufacturer == '${m}'")['cty'].mean()` }; }
    if (k === 1) { const d = r.pick([3, 4, 5]); return { title: '배기량에 따른 연비 비교', prompt: `mpg에서 displ이 ${d} 이하인 자동차와 ${d + 1} 이상인 자동차의 hwy 평균을 각각 구하세요.`, hint: '조건별로 «query()»를 두 번 사용하세요.', setup: S.mpg6, answer: `print(mpg.query("displ <= ${d}")['hwy'].mean())\nprint(mpg.query("displ >= ${d + 1}")['hwy'].mean())` }; }
    if (k === 2) { const c = r.pick(['suv', 'compact', 'midsize', 'subcompact', 'pickup']), n = r.int(3, 5), t = r.pick(['cty', 'hwy']); return { title: '추출·요약·정렬 체인', prompt: `mpg에서 category가 '${c}'인 자동차를 manufacturer별로 분리해 ${t} 평균을 구하고, 평균이 높은 순으로 상위 ${n}개를 확인하세요.`, hint: 'query → groupby → agg → sort_values → head', setup: S.mpg6, answer: `mpg.query("category == '${c}'").groupby('manufacturer').agg(mean_${t}=('${t}', 'mean')).sort_values('mean_${t}', ascending=False).head(${n})` }; }
    if (k === 3) { const g = r.pick(['drv', 'category', 'fl']), t = r.pick(['cty', 'hwy']); return { title: '집단별 평균 구하기', prompt: `mpg에서 ${g}별 ${t} 평균을 구하세요.`, hint: '«groupby()» + «agg()»를 사용하세요.', setup: S.mpg6, answer: `mpg.groupby('${g}').agg(mean_${t}=('${t}', 'mean'))` }; }
    const cs = r.ordered(['suv', 'compact', 'midsize', 'pickup', 'minivan', 'subcompact'], 2);
    return { title: '여러 범주 추출 후 비교', prompt: `mpg에서 category가 '${cs[0]}' 또는 '${cs[1]}'인 자동차를 추출한 뒤 category별 hwy 평균을 구하세요.`, hint: '«in» 조건과 «groupby()»를 함께 사용하세요.', setup: S.mpg6, answer: `mpg.query("category in ${pyList(cs)}").groupby('category').agg(mean_hwy=('hwy', 'mean'))` };
  });
  add(6, 'exam6', r => {
    const k = r.int(0, 3);
    if (k === 0) { const c = r.int(1, 5); return { title: '반별 학생 추출하기', prompt: `exam에서 nclass가 ${c}인 학생만 추출하세요.`, hint: '«query()»를 사용하세요.', setup: S.exam6, answer: `exam.query("nclass == ${c}")` }; }
    if (k === 1) { const [a, b] = r.sample(['math', 'english', 'science'], 2), x = r.pick([50, 60, 70]), y = r.pick([60, 70, 80, 90]); return { title: '복수 조건으로 학생 추출하기', prompt: `exam에서 ${a} 점수가 ${x}점 이상이면서 ${b} 점수가 ${y}점 이상인 학생을 추출하세요.`, hint: '복수 조건을 and로 연결하세요.', setup: S.exam6, answer: `exam.query("${a} >= ${x} & ${b} >= ${y}")` }; }
    if (k === 2) { const t = r.pick(['math', 'english', 'science']); return { title: '반별 요약하기', prompt: `exam에서 nclass별 ${t} 평균과 학생 수를 구하세요.`, hint: '«agg()»에 mean과 count를 함께 넣으세요.', setup: S.exam6, answer: `exam.groupby('nclass').agg(mean_${t}=('${t}', 'mean'), n=('${t}', 'count'))` }; }
    const t = r.pick(['math', 'english', 'science']), n = r.int(3, 5);
    return { title: '점수 높은 학생 찾기', prompt: `exam에서 ${t} 점수가 높은 순으로 정렬하여 상위 ${n}명의 id, nclass, ${t}를 확인하세요.`, hint: '열 선택 → 정렬 → head', setup: S.exam6, answer: `exam[['id', 'nclass', '${t}']].sort_values('${t}', ascending=False).head(${n})` };
  });

  /* ---------------- CHAPTER 07 ---------------- */
  const LCOL = ['study_hours', 'sleep_hours', 'screen_time', 'satisfaction', 'attendance'];
  const RANGE = { satisfaction: [1, 5, '1~5점'], attendance: [0, 100, '0~100'], study_hours: [0, 12, '0~12시간'], sleep_hours: [0, 12, '0~12시간'] };

  function tinyDF(r) {
    const n = r.int(6, 8);
    const scale = r.chance(0.5) ? [1, 5] : [0, 100];
    const sex = [], score = [];
    for (let i = 0; i < n; i++) { sex.push(r.pick(['M', 'F'])); score.push(scale[1] === 5 ? r.int(1, 5) : r.int(40, 100)); }
    const ns = r.int(0, n - 1);
    let nc = r.int(0, n - 1); if (nc === ns) nc = (nc + 1) % n;
    sex[ns] = null; score[nc] = null;
    // 최빈값이 하나가 되도록 조정
    const m = sex.filter(s => s === 'M').length, f = sex.filter(s => s === 'F').length;
    if (m === f) { const i = (ns + 1) % n; sex[i] = sex[i] === 'M' ? 'F' : 'M'; }
    let bad = r.int(0, n - 1); while (bad === nc) bad = (bad + 1) % n;
    score[bad] = scale[1] === 5 ? r.pick([6, 7, 9, 0]) : r.pick([-5, 120, 150, 999]);
    const lit = a => '[' + a.map(x => x === null ? 'np.nan' : typeof x === 'string' ? `'${x}'` : x).join(', ') + ']';
    const setup = `import pandas as pd\nimport numpy as np\n\ndf = pd.DataFrame({\n    'sex': ${lit(sex)},\n    'score': ${lit(score)}\n})`;
    return { setup, scale, rangeText: scale[1] === 5 ? '1~5점' : '0~100점' };
  }

  add(7, 'isna_all', r => {
    if (r.chance(0.35)) { const t = tinyDF(r); return { title: '열별 결측치 개수 확인', prompt: '각 열에 결측치가 몇 개인지 확인하세요.', hint: '«isna().sum()»', setup: t.setup, answer: 'df.isna().sum()' }; }
    return { title: '열별 결측치 개수 확인', prompt: '각 열에 결측치가 몇 개인지 확인하세요.', hint: '«isna()»와 «sum()»을 함께 사용하세요.', setup: S.life, answer: 'df.isna().sum()' };
  });
  add(7, 'isna_col', r => {
    const c = r.pick(['department', ...LCOL]);
    return { title: '특정 열의 결측치 개수', prompt: `${c} 열에 결측치가 몇 개인지 확인하세요.`, hint: "«df['열'].isna().sum()»", setup: S.life, answer: `df['${c}'].isna().sum()` };
  });
  add(7, 'isna_cols', r => ({ title: '결측치가 있는 열 찾기', prompt: '결측치가 하나 이상 있는 열 이름만 확인하세요.', hint: '«df.columns[조건]» 형태로 열 이름을 고르세요.', setup: S.life, answer: 'df.columns[df.isna().sum() > 0]' }));
  add(7, 'vc_na', r => {
    if (r.chance(0.4)) { const t = tinyDF(r); return { title: '결측값을 포함한 빈도 확인', prompt: 'sex 열의 빈도수를 결측치까지 포함하여 확인하세요.', hint: '«value_counts(dropna=False)»', setup: t.setup, answer: "df['sex'].value_counts(dropna=False)" }; }
    const c = r.pick(['department', 'satisfaction']);
    return { title: '결측값을 포함한 분포 확인', prompt: `${c} 열의 빈도수를 결측치까지 포함하여 확인하세요.`, hint: '«value_counts()»에 «dropna=False»를 추가하세요.', setup: S.life, answer: `df['${c}'].value_counts(dropna=False)` };
  });
  add(7, 'dropna', r => {
    const v = r.pick(['df_basic', 'df_clean', 'df_nomiss']);
    if (r.chance(0.3)) {
      const t = tinyDF(r), both = r.chance(0.5);
      return { title: '결측치 행 제거하기', prompt: both ? `sex와 score 중 하나라도 결측치가 있는 행을 제거하여 ${j(v, '을/를')} 만드세요.` : `score에 결측치가 있는 행만 제거하여 ${j(v, '을/를')} 만드세요.`, hint: '«dropna(subset=[...])»', setup: t.setup, answer: `${v} = df.dropna(subset=${both ? "['sex', 'score']" : "['score']"})\n${v}`, checks: [v] };
    }
    const cs = r.ordered(LCOL, 2);
    return { title: '분석용 데이터 만들기', prompt: `${cs[0]} 또는 ${cs[1]}에 결측치가 있는 행을 제거하여 ${j(v, '을/를')} 만드세요.`, hint: '분석에 필요한 열만 «subset»으로 지정하세요.', setup: S.life, answer: `${v} = df.dropna(subset=${pyList(cs)})\n${v}.head()`, checks: [v] };
  });
  add(7, 'rows_cmp', r => {
    const cs = r.ordered([...LCOL, 'department'], r.int(1, 2));
    return { title: '처리 전후 행 수 비교', prompt: `${cs.join(', ')}에 결측치가 있는 행을 제거한 df_basic을 만들고, 원본 df와 df_basic의 행 수를 비교하여 몇 행이 제외되었는지 계산하세요.`, hint: '«len()»으로 행 수를 구하세요.', setup: S.life, answer: `df_basic = df.dropna(subset=${pyList(cs)})\nprint('원본 행 수:', len(df))\nprint('정제 후 행 수:', len(df_basic))\nprint('제외된 행 수:', len(df) - len(df_basic))`, checks: ['df_basic'] };
  });
  add(7, 'stats7', r => {
    const c = r.pick(['study_hours', 'sleep_hours', 'screen_time', 'commute_min', 'attendance']);
    return { title: '결측치 대체 전 대표값 확인', prompt: `${c}의 평균과 중앙값을 각각 구하세요.`, hint: '«mean()», «median()»은 결측치를 제외하고 계산합니다.', setup: S.life, answer: `print('평균:', df['${c}'].mean())\nprint('중앙값:', df['${c}'].median())` };
  });
  add(7, 'fillna', r => {
    const k = r.int(0, 2);
    if (k === 0) {
      const c = r.pick(['study_hours', 'sleep_hours', 'screen_time', 'attendance']), med = r.chance(0.6);
      return { title: '결측치 대체하기', prompt: `${c} 결측치를 ${med ? '중앙값' : '평균'}으로 대체한 df_app를 만드세요. 원본 df는 그대로 두세요.`, hint: `«copy()»로 복사본을 만든 뒤 «fillna(${med ? 'median()' : 'mean()'})»`, setup: S.life, answer: `df_app = df.copy()\ndf_app['${c}'] = df_app['${c}'].fillna(df_app['${c}'].${med ? 'median' : 'mean'}())\ndf_app['${c}'].isna().sum()`, checks: [`df_app['${c}']`, `df['${c}'].isna().sum()`] };
    }
    if (k === 1) {
      const idx = r.ordered([...Array(20).keys()], r.int(2, 4));
      const setup = S.exam + `\nexam.loc[${pyList(idx)}, 'math'] = np.nan`;
      const med = r.chance(0.4);
      return { title: '결측치를 대표값으로 대체하기', prompt: `math 결측치를 ${med ? '중앙값' : '평균'}으로 대체한 뒤 결측치 개수를 확인하세요.`, hint: '«fillna()» 결과를 다시 대입하세요.', setup, answer: `exam['math'] = exam['math'].fillna(exam['math'].${med ? 'median' : 'mean'}())\nexam['math'].isna().sum()`, checks: ["exam['math']"] };
    }
    const t = tinyDF(r);
    return { title: '결측치를 평균으로 대체하기', prompt: 'score 결측치를 score의 평균으로 대체하세요.', hint: "«df['score'].fillna(df['score'].mean())»", setup: t.setup, answer: "df['score'] = df['score'].fillna(df['score'].mean())\ndf", checks: ["df['score']"] };
  });
  add(7, 'fill_mode', r => {
    if (r.chance(0.3)) { const t = tinyDF(r); return { title: '범주형 결측치 대체', prompt: 'sex 결측치를 최빈값으로 대체하세요.', hint: '«mode()[0]»으로 최빈값을 꺼내세요.', setup: t.setup, answer: "df['sex'] = df['sex'].fillna(df['sex'].mode()[0])\ndf['sex'].value_counts(dropna=False)", checks: ["df['sex']"] }; }
    return { title: '학과 결측치 대체', prompt: 'department 결측치를 최빈값으로 대체하세요.', hint: '«mode()»는 Series를 반환하므로 «[0]»으로 첫 값을 사용하세요.', setup: S.lifeApp, answer: "df_app['department'] = df_app['department'].fillna(df_app['department'].mode()[0])\ndf_app['department'].isna().sum()", checks: ["df_app['department']"] };
  });
  add(7, 'rule_find', r => {
    if (r.chance(0.3)) { const t = tinyDF(r); return { title: '규칙 기반 이상치 찾기', prompt: `score는 ${t.rangeText}입니다. 이 범위를 벗어난 행을 찾으세요.`, hint: '«query()»에 or 조건을 쓰거나 «between()»을 사용하세요.', setup: t.setup, answer: `df.query('score < ${t.scale[0]} or score > ${t.scale[1]}')` }; }
    const c = r.pick(Object.keys(RANGE)), [lo, hi, txt] = RANGE[c];
    return { title: '규칙 기반 이상치 찾기', prompt: `${c}의 정상 범위는 ${txt}입니다. 이 범위를 벗어난 행을 찾으세요.`, hint: '«between()»과 «~»(NOT)을 사용하세요. 결측치는 이상치가 아닙니다.', setup: S.lifeApp, answer: `df_app[~df_app['${c}'].between(${lo}, ${hi}) & df_app['${c}'].notna()]` };
  });
  add(7, 'rule_nan', r => {
    if (r.chance(0.3)) { const t = tinyDF(r); return { title: '잘못된 값을 NaN으로 바꾸기', prompt: `score는 ${t.rangeText}입니다. 범위를 벗어난 값을 np.where()와 between()을 사용해 NaN으로 바꾸세요.`, hint: '«np.where(조건, 원래 값, np.nan)»', setup: t.setup, answer: `df['score'] = np.where(df['score'].between(${t.scale[0]}, ${t.scale[1]}), df['score'], np.nan)\ndf`, checks: ["df['score']"] }; }
    const cs = r.chance(0.5) ? r.ordered(Object.keys(RANGE), 2) : [r.pick(Object.keys(RANGE))];
    return {
      title: '잘못된 값을 NaN으로 바꾸기', prompt: `${cs.map(c => `${c}(${RANGE[c][2]})`).join(', ')}에서 정상 범위를 벗어난 값을 np.where()와 between()을 사용해 NaN으로 바꾸세요.`,
      hint: '«np.where(정상 범위 조건, 원래 값, np.nan)»', setup: S.lifeApp,
      answer: cs.map(c => `df_app['${c}'] = np.where(\n    df_app['${c}'].between(${RANGE[c][0]}, ${RANGE[c][1]}),\n    df_app['${c}'],\n    np.nan\n)`).join('\n') + `\ndf_app[${pyList(cs)}].isna().sum()`,
      checks: cs.map(c => `df_app['${c}']`),
    };
  });
  add(7, 'replace999', r => {
    const k = r.int(0, 1);
    if (k === 0) return { title: '입력 오류값 처리', prompt: 'commute_min=999는 입력 오류로 판단하고 NaN으로 바꾼 뒤 commute_min의 결측치 개수를 확인하세요.', hint: '«replace(999, np.nan)»', setup: S.lifeApp, answer: "df_app['commute_min'] = df_app['commute_min'].replace(999, np.nan)\ndf_app['commute_min'].isna().sum()", checks: ["df_app['commute_min']"] };
    return { title: '정제 전후 통계 비교', prompt: 'commute_min=999를 NaN으로 바꾼 df_app를 만들고, commute_min의 정제 전후 평균과 중앙값을 비교하세요.', hint: '원본 df와 df_app의 «mean()», «median()»을 각각 출력하세요.', setup: S.lifeApp, answer: "df_app['commute_min'] = df_app['commute_min'].replace(999, np.nan)\nprint('정제 전 평균:', df['commute_min'].mean())\nprint('정제 후 평균:', df_app['commute_min'].mean())\nprint('정제 전 중앙값:', df['commute_min'].median())\nprint('정제 후 중앙값:', df_app['commute_min'].median())", checks: ["df_app['commute_min']"] };
  });
  const IQRSRC = [
    { v: 'df', s: S.life, cols: ['steps', 'screen_time', 'commute_min', 'study_hours', 'sleep_hours', 'attendance'] },
    { v: 'exam', s: S.exam, cols: ['math', 'english', 'science'] },
    { v: 'mpg', s: S.mpg, cols: ['hwy', 'cty'] },
  ];
  add(7, 'iqr', r => {
    const d = r.chance(0.6) ? IQRSRC[0] : r.pick(IQRSRC), c = r.pick(d.cols);
    return { title: '사분위수와 IQR 구하기', prompt: `${d.v}에서 ${c}의 Q1, Q3, IQR을 구하세요.`, hint: '«quantile(0.25)», «quantile(0.75)»를 사용하고 변수명은 Q1, Q3, IQR로 하세요.', setup: d.s, answer: `Q1 = ${d.v}['${c}'].quantile(0.25)\nQ3 = ${d.v}['${c}'].quantile(0.75)\nIQR = Q3 - Q1\nprint('Q1:', Q1)\nprint('Q3:', Q3)\nprint('IQR:', IQR)`, checks: ['Q1', 'Q3', 'IQR'] };
  });
  add(7, 'bounds', r => {
    const d = r.chance(0.6) ? IQRSRC[0] : r.pick(IQRSRC), c = r.pick(d.cols);
    return { title: 'IQR 기준 경계값 계산', prompt: `${d.v}의 ${c}에 대해 하한 Q1-1.5×IQR, 상한 Q3+1.5×IQR을 계산하세요.`, hint: '변수명은 lower, upper로 하세요.', setup: d.s + `\n\nQ1 = ${d.v}['${c}'].quantile(0.25)\nQ3 = ${d.v}['${c}'].quantile(0.75)\nIQR = Q3 - Q1`, answer: "lower = Q1 - 1.5 * IQR\nupper = Q3 + 1.5 * IQR\nprint('하한:', lower)\nprint('상한:', upper)", checks: ['lower', 'upper'] };
  });
  add(7, 'outliers', r => {
    const c = r.pick(['steps', 'sleep_hours', 'commute_min', 'study_hours', 'attendance', 'satisfaction']);
    return { title: '통계적 이상치 추출', prompt: `${c}가 IQR 경계 밖에 있는 행을 추출하세요.`, hint: 'Q1, Q3, IQR → 하한·상한 → 조건 추출(|) 순서로 작성하세요.', setup: S.lifeApp, answer: `Q1 = df_app['${c}'].quantile(0.25)\nQ3 = df_app['${c}'].quantile(0.75)\nIQR = Q3 - Q1\nlower = Q1 - 1.5 * IQR\nupper = Q3 + 1.5 * IQR\ndf_app[(df_app['${c}'] < lower) | (df_app['${c}'] > upper)]` };
  });
  add(7, 'flag', r => {
    const c = r.pick(['steps', 'sleep_hours', 'attendance', 'commute_min']);
    return { title: "'오류'와 '극단값' 구분하기", prompt: `${c}의 큰 값은 실제 가능한 값일 수도 있으므로 바로 삭제하지 말고, IQR 경계 밖이면 True인 ${c}_outlier 열을 df_app에 만드세요.`, hint: '조건식 결과(True/False)를 그대로 새 열에 대입하세요.', setup: S.lifeApp, answer: `Q1 = df_app['${c}'].quantile(0.25)\nQ3 = df_app['${c}'].quantile(0.75)\nIQR = Q3 - Q1\nlower = Q1 - 1.5 * IQR\nupper = Q3 + 1.5 * IQR\ndf_app['${c}_outlier'] = (df_app['${c}'] < lower) | (df_app['${c}'] > upper)\ndf_app['${c}_outlier'].value_counts()`, checks: [`df_app['${c}_outlier']`] };
  });
  add(7, 'check_etc', r => ({ title: '확인이 필요한 값 표시하기', prompt: "department가 '기타X'인 행을 True로 표시하는 department_check 열을 만들고, 해당 행만 확인하세요.", hint: '비교 연산(==) 결과를 새 열에 대입하세요.', setup: S.lifeApp, answer: "df_app['department_check'] = df_app['department'] == '기타X'\ndf_app[df_app['department_check']]", checks: ["df_app['department_check']"] }));
  add(7, 'clean_chain', r => {
    const c = r.pick(['study_hours', 'sleep_hours', 'screen_time']), med = r.chance(0.6);
    return { title: '결측치 한 번에 정제하기', prompt: `${c} 결측치는 ${med ? '중앙값' : '평균'}으로, department 결측치는 최빈값으로 대체한 df_app를 만든 뒤 두 열의 결측치 개수를 확인하세요.`, hint: '«fillna()»를 열마다 적용하세요.', setup: S.life, answer: `df_app = df.copy()\ndf_app['${c}'] = df_app['${c}'].fillna(df_app['${c}'].${med ? 'median' : 'mean'}())\ndf_app['department'] = df_app['department'].fillna(df_app['department'].mode()[0])\ndf_app[['${c}', 'department']].isna().sum()`, checks: [`df_app['${c}']`, "df_app['department']"] };
  });

  /* ---------------- CHAPTER 08 ---------------- */
  const VNUM = ['study_hours', 'screen_time', 'sleep_hours', 'steps', 'quiz_score'];
  const SHORT = { quiz_score: 'quiz', steps: 'steps', study_hours: 'study', sleep_hours: 'sleep', screen_time: 'screen', hwy: 'hwy', cty: 'cty', displ: 'displ' };
  const TBL = { department: 'dept_mean', activity_type: 'act_mean', drv: 'drv_mean', category: 'cat_mean', fl: 'fl_mean' };

  function scatterSrc(r) {
    if (r.chance(0.55)) { const y = r.chance(0.7) ? 'quiz_score' : r.pick(['sleep_hours', 'steps']); const x = r.pick(VNUM.filter(v => v !== y)); return { v: 'df', s: S.viz, x, y, hues: ['department', 'activity_type'] }; }
    const [x, y] = r.pick([['displ', 'hwy'], ['displ', 'cty'], ['cty', 'hwy']]);
    return { v: 'mpg', s: S.vmpg, x, y, hues: ['drv', 'fl'] };
  }
  const LIMS = { study_hours: [[0, 7], [1, 5], [2, 6]], screen_time: [[0, 8], [2, 6]], sleep_hours: [[4, 9], [5, 8]], steps: [[2000, 15000], [5000, 12000]], quiz_score: [[30, 100], [50, 100], [60, 90]], displ: [[1, 7], [3, 6], [2, 5]], hwy: [[10, 45], [10, 30], [20, 40]], cty: [[5, 40], [10, 25]] };

  add(8, 'scatter', r => {
    const d = scatterSrc(r);
    return { title: `${j(d.x, '과/와')} ${d.y}의 관계`, prompt: `x축은 ${d.x}, y축은 ${d.y}인 산점도를 만드세요.`, hint: '«sns.scatterplot(data=..., x=..., y=...)»', setup: d.s, answer: `sns.scatterplot(data=${d.v}, x='${d.x}', y='${d.y}')`, plot: true };
  });
  add(8, 'scatter_hue', r => {
    const d = scatterSrc(r), h = r.pick(d.hues);
    return { title: '범주별 색 구분', prompt: `x축은 ${d.x}, y축은 ${d.y}인 산점도를 만들고 ${j(h, '을/를')} hue로 추가하여 색을 구분하세요.`, hint: '«hue=» 파라미터를 사용하세요.', setup: d.s, answer: `sns.scatterplot(data=${d.v}, x='${d.x}', y='${d.y}', hue='${h}')`, plot: true };
  });
  add(8, 'scatter_lim', r => {
    const d = scatterSrc(r), xl = r.pick(LIMS[d.x]), yl = r.pick(LIMS[d.y]), h = r.chance(0.5) ? r.pick(d.hues) : null;
    return { title: '축 범위 조정', prompt: `x축은 ${d.x}, y축은 ${d.y}인 산점도${h ? `(hue: ${h})` : ''}를 만들고, x축 ${xl[0]}~${xl[1]}, y축 ${yl[0]}~${yl[1]} 범위로 축을 조정하세요.`, hint: '«.set(xlim=[최소, 최대], ylim=[최소, 최대])»', setup: d.s, answer: `sns.scatterplot(data=${d.v}, x='${d.x}', y='${d.y}'${h ? `, hue='${h}'` : ''}).set(xlim=[${xl}], ylim=[${yl}])`.replace(/\[(\d+),(\d+)\]/g, '[$1, $2]'), plot: true };
  });
  add(8, 'scatter_q', r => {
    if (r.chance(0.5)) { const c = r.pick(['suv', 'compact', 'midsize', 'subcompact', 'pickup']); return { title: '추출한 데이터로 산점도', prompt: `mpg에서 category가 '${c}'인 자동차만 추출하여 x축은 displ, y축은 hwy인 산점도를 만드세요.`, hint: '«query()» 결과를 data에 넣으세요.', setup: S.vmpg, answer: `sns.scatterplot(data=mpg.query("category == '${c}'"), x='displ', y='hwy')`, plot: true }; }
    const dp = r.pick(['AI컴퓨터', '보건의료', '디자인']), x = r.pick(['study_hours', 'screen_time', 'sleep_hours']);
    return { title: '추출한 데이터로 산점도', prompt: `department가 '${dp}'인 기록만 추출하여 x축은 ${x}, y축은 quiz_score인 산점도를 만드세요.`, hint: '«query()» 결과를 data에 넣으세요.', setup: S.viz, answer: `sns.scatterplot(data=df.query("department == '${dp}'"), x='${x}', y='quiz_score')`, plot: true };
  });
  function barSrc(r) {
    if (r.chance(0.55)) { const g = r.pick(['department', 'activity_type']), y = r.pick(['quiz_score', 'quiz_score', 'steps', 'study_hours', 'sleep_hours', 'screen_time']); return { v: 'df', s: S.viz, g, y }; }
    const g = r.pick(['drv', 'category', 'fl']), y = r.pick(['hwy', 'cty']);
    return { v: 'mpg', s: S.vmpg, g, y };
  }
  add(8, 'bar', r => {
    const d = barSrc(r), tb = TBL[d.g], mc = `mean_${SHORT[d.y]}`;
    return { title: '집단별 평균 막대그래프', prompt: `${d.g}별 평균 ${j(d.y, '을/를')} groupby()+agg()로 만들어 ${tb}에 저장(평균 열 이름: ${mc})한 뒤 막대그래프로 표현하세요.`, hint: '«groupby(..., as_index=False).agg(...)» 후 «sns.barplot()»', setup: d.s, answer: `${tb} = ${d.v}.groupby('${d.g}', as_index=False).agg(${mc}=('${d.y}', 'mean'))\nsns.barplot(data=${tb}, x='${d.g}', y='${mc}')`, plot: true, checks: [tb] };
  });
  add(8, 'bar_sort', r => {
    const d = barSrc(r), tb = TBL[d.g], mc = `mean_${SHORT[d.y]}`, desc = r.chance(0.75);
    return { title: `평균이 ${desc ? '높은' : '낮은'} 집단부터 정렬`, prompt: `${d.g}별 평균 ${j(d.y, '을/를')} ${tb}(평균 열 이름: ${mc})로 만들고, ${j(mc, '이/가')} ${desc ? '큰' : '작은'} 순서로 정렬한 후 막대그래프를 만드세요.`, hint: '«sort_values()» 후 barplot의 «order=»에 정렬된 집단 열을 넣으세요.', setup: d.s, answer: `${tb} = ${d.v}.groupby('${d.g}', as_index=False).agg(${mc}=('${d.y}', 'mean'))\n${tb} = ${tb}.sort_values('${mc}'${desc ? ', ascending=False' : ''})\nsns.barplot(data=${tb}, x='${d.g}', y='${mc}', order=${tb}['${d.g}'])`, plot: true };
  });
  add(8, 'bar_top', r => {
    const c = r.pick(['suv', 'compact', 'midsize', 'pickup']), n = r.int(3, 5), t = r.pick(['cty', 'hwy']);
    return { title: '추출·요약 후 상위 막대그래프', prompt: `mpg에서 category가 '${c}'인 자동차를 manufacturer별로 묶어 ${t} 평균(열 이름: mean_${t})을 구하고, 평균이 높은 순으로 상위 ${n}개를 df_top에 저장하여 막대그래프로 표현하세요.`, hint: 'query → groupby → agg → sort_values → head 후 «order=»', setup: S.vmpg, answer: `df_top = mpg.query("category == '${c}'").groupby('manufacturer', as_index=False).agg(mean_${t}=('${t}', 'mean')).sort_values('mean_${t}', ascending=False).head(${n})\nsns.barplot(data=df_top, x='manufacturer', y='mean_${t}', order=df_top['manufacturer'])`, plot: true, checks: ['df_top'] };
  });
  add(8, 'count', r => {
    if (r.chance(0.5)) { const c = r.pick(['activity_type', 'department']); return { title: '범주별 빈도 막대그래프', prompt: `${c}별 기록 수를 countplot()으로 표현하세요.`, hint: 'countplot은 원자료를 그대로 넣습니다.', setup: S.viz, answer: `sns.countplot(data=df, x='${c}')`, plot: true }; }
    const c = r.pick(['drv', 'category', 'fl', 'manufacturer']);
    return { title: '범주별 빈도 막대그래프', prompt: `mpg에서 ${c}별 자동차 수를 빈도 막대그래프로 표현하세요.`, hint: '«sns.countplot()»', setup: S.vmpg, answer: `sns.countplot(data=mpg, x='${c}')`, plot: true };
  });
  add(8, 'count_order', r => {
    const c = r.pick(['drv', 'category', 'fl']);
    if (c === 'drv' && r.chance(0.5)) { const o = r.shuffle(['4', 'f', 'r']); return { title: '막대 순서 지정하기', prompt: `mpg의 drv별 빈도 막대그래프를 만들고, 막대를 ${o.map(x => `'${x}'`).join(', ')} 순서로 배치하세요.`, hint: '«order=[...]»', setup: S.vmpg, answer: `sns.countplot(data=mpg, x='drv', order=${pyList(o)})`, plot: true }; }
    return { title: '빈도가 높은 순서로 정렬', prompt: `mpg의 ${c}별 빈도 막대그래프를 빈도가 높은 순서로 정렬하여 만드세요.`, hint: "«order=mpg['열'].value_counts().index»", setup: S.vmpg, answer: `sns.countplot(data=mpg, x='${c}', order=mpg['${c}'].value_counts().index)`, plot: true };
  });
  add(8, 'datetime', r => {
    if (r.chance(0.6)) { const [p, a] = r.pick([['월', 'month'], ['일', 'day'], ['연도', 'year']]); return { title: '날짜형 변환', prompt: `date를 날짜형 date2로 변환하고, date2에서 ${p}를 추출하여 ${a} 열을 만드세요.`, hint: `«pd.to_datetime()» 후 «.dt.${a}»`, setup: S.viz, answer: `df['date2'] = pd.to_datetime(df['date'])\ndf['${a}'] = df['date2'].dt.${a}\ndf[['date', 'date2', '${a}']].head()`, checks: ["df['date2']", `df['${a}']`] }; }
    return { title: '날짜형 변환', prompt: 'economics의 date를 날짜형 date2로 변환하고, 연도를 추출하여 year 열을 만드세요.', hint: '«pd.to_datetime()» 후 «.dt.year»', setup: S.econ, answer: "economics['date2'] = pd.to_datetime(economics['date'])\neconomics['year'] = economics['date2'].dt.year\neconomics[['date', 'date2', 'year']].head()", checks: ["economics['date2']", "economics['year']"] };
  });
  add(8, 'line_viz', r => {
    const y = r.pick(['steps', 'quiz_score', 'study_hours', 'sleep_hours', 'screen_time']), mc = `mean_${SHORT[y]}`;
    return { title: `날짜별 평균 ${y}`, prompt: `date를 날짜형 date2로 변환한 뒤, 날짜별 평균 ${j(y, '을/를')} date_mean에 저장(평균 열 이름: ${mc})하고 선그래프로 시간 변화를 표현하세요.`, hint: "«pd.to_datetime()» → «groupby('date2', as_index=False)» → «sns.lineplot()»", setup: S.viz, answer: `df['date2'] = pd.to_datetime(df['date'])\ndate_mean = df.groupby('date2', as_index=False).agg(${mc}=('${y}', 'mean'))\nsns.lineplot(data=date_mean, x='date2', y='${mc}')`, plot: true, checks: ['date_mean'] };
  });
  add(8, 'line_econ', r => {
    const y = r.pick(['unemploy', 'psavert', 'pce', 'uempmed', 'pop']);
    if (r.chance(0.5)) return { title: '시간 흐름 선그래프', prompt: `economics의 date를 날짜형 date2로 변환한 뒤, x축은 date2, y축은 ${y}인 선그래프를 만드세요.`, hint: '«pd.to_datetime()» 후 «sns.lineplot()»', setup: S.econ, answer: `economics['date2'] = pd.to_datetime(economics['date'])\nsns.lineplot(data=economics, x='date2', y='${y}')`, plot: true };
    return { title: '연도별 변화 선그래프', prompt: `economics에서 연도(year) 변수를 만든 뒤, x축은 year, y축은 ${y}인 선그래프를 만들되 신뢰구간은 표시하지 마세요.`, hint: '«.dt.year»로 연도를 추출하고 «errorbar=None»을 사용하세요.', setup: S.econ, answer: `economics['date2'] = pd.to_datetime(economics['date'])\neconomics['year'] = economics['date2'].dt.year\nsns.lineplot(data=economics, x='year', y='${y}', errorbar=None)`, plot: true };
  });
  add(8, 'box', r => {
    if (r.chance(0.55)) { const g = r.pick(['department', 'activity_type']), y = r.pick(['quiz_score', 'steps', 'study_hours', 'sleep_hours', 'screen_time']); return { title: '집단별 분포 비교', prompt: `${g}별 ${y} 분포를 boxplot()으로 비교하세요.`, hint: '«sns.boxplot(data=..., x=집단, y=연속형)»', setup: S.viz, answer: `sns.boxplot(data=df, x='${g}', y='${y}')`, plot: true }; }
    const g = r.pick(['drv', 'category', 'fl']), y = r.pick(['hwy', 'cty', 'displ']);
    return { title: '집단별 분포 비교', prompt: `mpg에서 ${g}별 ${y} 분포를 상자그림으로 표현하세요.`, hint: '«sns.boxplot()»', setup: S.vmpg, answer: `sns.boxplot(data=mpg, x='${g}', y='${y}')`, plot: true };
  });

  function genCode(tpl, seed) {
    const r = mkR(seed);
    const p = tpl.gen(r);
    return Object.assign({ checks: [], plot: false, hint: '' }, p, { ch: tpl.ch, tid: tpl.id, seed });
  }

  G.QZ = G.QZ || {};
  Object.assign(G.QZ, { mkR, josa: j, CODE_T: T, genCode, SETUP: S });
})(typeof window !== 'undefined' ? window : globalThis);

