
/* ===== 객관식 · OX 문제 은행 ===== */
(function (G) {
  'use strict';
  const QZ = G.QZ;

  // 객관식: o[0]이 정답 (출제 시 보기 순서를 섞음)
  const MC = [
    /* ---- 5장 ---- */
    { ch: 5, q: '데이터 프레임의 앞부분 5행을 출력하는 코드로 옳은 것은?', o: ['«df.head()»', '«df.tail()»', '«df.shape»', '«df.info()»'], e: '«head()»는 괄호를 비우면 앞 5행을 출력합니다.' },
    { ch: 5, q: '데이터의 행과 열의 개수를 확인할 때 사용하는 것은?', o: ['«df.shape»', '«df.head()»', '«df.describe()»', '«df.columns»'], e: '«shape»는 (행, 열) 형태로 크기를 알려주는 어트리뷰트입니다.' },
    { ch: 5, q: '«exam.shape»의 실행 결과가 «(20, 5)»일 때 의미로 옳은 것은?', o: ['20행 5열로 구성되어 있다', '5행 20열로 구성되어 있다', '결측치가 20개, 변수가 5개이다', '평균이 20, 표준편차가 5이다'], e: '«shape»는 (행, 열) 순서입니다.' },
    { ch: 5, q: '변수명, 자료형, 결측치가 아닌 값의 개수를 한 번에 확인할 수 있는 메서드는?', o: ['«info()»', '«describe()»', '«head()»', '«value_counts()»'], e: '«info()»는 Non-Null Count와 Dtype을 함께 보여줍니다.' },
    { ch: 5, q: '숫자 변수의 평균, 표준편차, 사분위수 등 요약 통계량을 출력하는 메서드는?', o: ['«describe()»', '«info()»', '«shape»', '«copy()»'], e: '«describe()»는 count, mean, std, min, 25%, 50%, 75%, max를 출력합니다.' },
    { ch: 5, q: '문자 변수까지 포함하여 요약 통계량을 출력하는 코드는?', o: ["«df.describe(include='all')»", '«df.describe(all=True)»', "«df.info(include='all')»", "«df.describe('str')»"], e: "«include='all'»을 넣으면 unique, top, freq도 함께 출력됩니다." },
    { ch: 5, q: '숫자 변수에 «describe()»를 실행했을 때 출력되지 않는 항목은?', o: ['최빈값(mode)', 'count', 'std', '75%'], e: '숫자 변수의 describe()에는 최빈값이 없습니다.' },
    { ch: 5, q: '«describe()» 결과에서 «50%»가 의미하는 것은?', o: ['중앙값', '평균', '결측치 비율', '상위 50개 값의 합'], e: '50% 지점의 값, 즉 중앙값입니다.' },
    { ch: 5, q: '다음 중 어트리뷰트(attribute)에 해당하는 것은?', o: ['«df.shape»', '«df.head()»', '«sum([1, 2, 3])»', "«pd.read_csv('a.csv')»"], e: '괄호 없이 값만 꺼내는 «shape»가 어트리뷰트입니다.' },
    { ch: 5, q: '다음 중 메서드(method)에 해당하는 것은?', o: ['«df.head()»', '«df.shape»', '«sum([1, 2, 3])»', '«df.columns»'], e: '객체 뒤에 점(.)을 찍고 괄호와 함께 호출하는 «head()»가 메서드입니다.' },
    { ch: 5, q: '다음 중 함수(function)에 해당하는 것은?', o: ['«sum([1, 2, 3])»', '«df.head()»', '«df.shape»', '«df.info()»'], e: '객체에 속하지 않고 단독으로 호출하는 «sum()»이 함수입니다.' },
    { ch: 5, q: '변수명 «cty»를 «city»로 바꾸는 코드로 옳은 것은?', o: ["«df = df.rename(columns={'cty': 'city'})»", "«df = df.rename(columns={'city': 'cty'})»", "«df = df.rename(columns=['cty', 'city'])»", "«df = df.rename(columns='cty' + 'city')»"], e: "«{'옛이름': '새이름'}» 순서로 씁니다." },
    { ch: 5, q: '원본 데이터를 보존하기 위해 독립적인 복사본을 만드는 코드는?', o: ['«df_new = df.copy()»', '«df_new = df»', '«df_new = df.head()»', '«df_new = df.rename()»'], e: '«copy()»를 사용해야 원본과 독립된 복사본이 만들어집니다.' },
    { ch: 5, q: '«math», «english», «science»를 더해 «total» 파생변수를 만드는 코드로 옳은 것은?', o: ["«df['total'] = df['math'] + df['english'] + df['science']»", '«df[total] = math + english + science»', "«df['total'] = sum('math', 'english', 'science')»", "«df.total = df['math'] + df['english'] + df['science']»"], e: '열 단위로 더한 결과를 새 열에 대입합니다.' },
    { ch: 5, q: '다음 코드에 대한 설명으로 옳은 것은?', code: "df['result'] = np.where(df['score'] >= 60, 'pass', 'fail')", o: ["score가 60 이상이면 'pass', 60 미만이면 'fail'이 된다", "score가 60 초과이면 'pass', 60 이하이면 'fail'이 된다", "score가 60 이상이면 'fail', 60 미만이면 'pass'가 된다", "score 열 자체의 값이 'pass'/'fail'로 바뀐다"], e: '>=는 이상(같은 값 포함)입니다. 결과는 새 열 result에 저장됩니다.' },
    { ch: 5, q: '«np.where()»의 첫 번째 인자에 들어가는 것은?', o: ['조건식', '조건이 참일 때의 값', '조건이 거짓일 때의 값', '새로 만들 열 이름'], e: '«np.where(조건, 참일 때 값, 거짓일 때 값)»' },
    { ch: 5, q: '범주별 빈도를 확인하는 메서드는?', o: ['«value_counts()»', '«count_values()»', '«frequency()»', '«describe()»'], e: '«value_counts()»는 값별 개수를 구합니다.' },
    { ch: 5, q: 'CSV 파일을 불러오는 함수는?', o: ['«pd.read_csv()»', '«pd.load_csv()»', '«pd.open_csv()»', '«pd.read_excel()»'], e: '«read_excel()»은 엑셀 파일용입니다.' },
    { ch: 5, q: '«import numpy as np»에서 «np»의 의미로 옳은 것은?', o: ['numpy 패키지를 부르는 약칭(별칭)', 'numpy 안의 함수 이름', '새로 만든 데이터 프레임', '불러온 파일 이름'], e: '«as» 뒤의 이름은 패키지를 짧게 부르기 위한 약칭입니다.' },
    { ch: 5, q: '다음 코드의 출력 결과는?', code: "s = 85\ngrade = np.where(s >= 90, 'A', np.where(s >= 80, 'B', 'C'))\nprint(grade)", o: ['B', 'A', 'C', '오류 발생'], e: '90 미만이므로 안쪽 np.where로 가고, 80 이상이므로 B입니다.' },
    { ch: 5, q: '«df.tail(3)»의 실행 결과로 옳은 것은?', o: ['마지막 3행 출력', '앞 3행 출력', '3번째 행만 출력', '3개 열만 출력'], e: '«tail()»은 뒷부분을 출력합니다.' },
    { ch: 5, q: '«info()» 결과에서 어떤 변수의 Non-Null Count가 전체 행 수보다 작다면 알 수 있는 것은?', o: ['그 변수에 결측치가 있다', '그 변수는 문자형이다', '그 변수에 이상치가 있다', '그 변수의 평균이 0이다'], e: 'Non-Null Count는 결측치가 아닌 값의 개수입니다.' },
    { ch: 5, q: '변수명(열 이름) 목록을 확인하는 코드는?', o: ['«df.columns»', '«df.names()»', '«df.rows»', '«df.title»'], e: '«columns» 어트리뷰트로 열 이름을 확인합니다.' },
    { ch: 5, q: '«rename()»으로 바꾼 변수명이 데이터에 반영되도록 하는 방법은?', o: ['결과를 다시 변수에 대입한다', '«print()»로 출력한다', '«head()»를 실행한다', '«copy()»를 다시 실행한다'], e: '«df = df.rename(...)»처럼 다시 대입해야 반영됩니다.' },
    { ch: 5, q: 'mean이 75인 행의 grade 값은?', code: "conditions = [df['mean'] >= 90, df['mean'] >= 80]\nchoices = ['A', 'B']\ndf['grade'] = np.select(conditions, choices, default='C')", o: ['C', 'A', 'B', 'NaN'], e: '어떤 조건에도 해당하지 않으므로 default 값 C가 됩니다.' },
    { ch: 5, q: '다음 코드의 실행 결과는?', code: "df = pd.DataFrame({'x': [1, 2, 3], 'y': [4, 5, 6]})\ndf['z'] = df['x'] + df['y']\ndf['z'].sum()", o: ['21', '15', '6', '9'], e: 'z = [5, 7, 9]이므로 합계는 21입니다.' },
    { ch: 5, q: '«df.describe()» 결과의 «count»가 의미하는 것은?', o: ['결측치를 제외한 값의 개수', '결측치를 포함한 전체 행의 개수', '서로 다른 값의 개수', '가장 많이 나온 값의 개수'], e: 'count가 전체 행 수보다 작으면 결측치가 있다는 뜻입니다.' },

    /* ---- 6장 ---- */
    { ch: 6, q: '조건에 맞는 행을 추출할 때 사용하는 메서드는?', o: ['«query()»', '«groupby()»', '«merge()»', '«rename()»'], e: '«query()» 안에 조건식을 문자열로 씁니다.' },
    { ch: 6, q: "«exam.query('nclass == 1')»의 의미로 옳은 것은?", o: ['nclass가 1인 행만 추출한다', 'nclass 열의 값을 모두 1로 바꾼다', '1번째 행만 추출한다', 'nclass 열만 추출한다'], e: '==는 같다는 비교 연산자입니다.' },
    { ch: 6, q: "store가 'A관'인 행을 추출하는 코드로 옳은 것은?", o: ["«cafe.query(\"store == 'A관'\")»", '«cafe.query("store == A관")»', "«cafe.query(\"store = 'A관'\")»", "«cafe.query(store == 'A관')»"], e: '조건 전체를 문자열로 감싸고, 문자 값은 다른 종류의 따옴표로 감쌉니다.' },
    { ch: 6, q: "«query()»에서 '그리고(and)' 조건을 연결하는 기호는?", o: ['«&»', '«|»', '«!»', '«~»'], e: '& 또는 and를 사용합니다.' },
    { ch: 6, q: "«query()»에서 '또는(or)' 조건을 연결하는 기호는?", o: ['«|»', '«&»', '«==»', '«in»'], e: '| 또는 or를 사용합니다.' },
    { ch: 6, q: "결제수단이 '카드' 또는 '현금'인 주문을 추출하는 코드는?", o: ["«cafe.query(\"payment in ['카드', '현금']\")»", "«cafe.query(\"payment == ['카드' & '현금']\")»", "«cafe.query(\"payment & ['카드', '현금']\")»", "«cafe.query(\"payment = '카드' + '현금'\")»"], e: '여러 값 중 하나에 해당하는지 확인할 때는 in을 사용합니다.' },
    { ch: 6, q: '여러 열을 동시에 추출하는 코드로 옳은 것은?', o: ["«df[['math', 'english']]»", "«df['math', 'english']»", "«df(['math', 'english'])»", "«df.query(['math', 'english'])»"], e: '대괄호 안에 열 이름 리스트를 넣습니다(대괄호 2겹).' },
    { ch: 6, q: "«df['math']»와 «df[['math']]»의 차이로 옳은 것은?", o: ['앞은 Series, 뒤는 DataFrame으로 추출된다', '앞은 DataFrame, 뒤는 Series로 추출된다', '둘 다 Series로 추출된다', '뒤의 코드는 오류가 발생한다'], e: '대괄호 2겹은 데이터 프레임 형태를 유지합니다.' },
    { ch: 6, q: '특정 열을 제거하는 코드는?', o: ["«df.drop(columns='math')»", "«df.remove('math')»", "«df.delete(columns='math')»", "«df.query('math')»"], e: '«drop(columns=...)»로 열을 제거합니다.' },
    { ch: 6, q: '«math»가 큰 순서대로(내림차순) 정렬하는 코드는?', o: ["«df.sort_values('math', ascending=False)»", "«df.sort_values('math')»", "«df.sort_values('math', ascending=True)»", "«df.sort_values('math', reverse=True)»"], e: '«ascending=False»가 내림차순입니다.' },
    { ch: 6, q: '«sort_values()»의 기본 정렬 방향은?', o: ['오름차순', '내림차순', '입력 순서 유지', '무작위'], e: '기본값은 «ascending=True»(오름차순)입니다.' },
    { ch: 6, q: '집단별로 요약 통계량을 구할 때 함께 사용하는 메서드 조합은?', o: ['«groupby()» + «agg()»', '«query()» + «drop()»', '«merge()» + «concat()»', '«rename()» + «copy()»'], e: '집단을 나누고(groupby) 요약(agg)합니다.' },
    { ch: 6, q: '다음 코드의 의미로 옳은 것은?', code: "exam.groupby('nclass').agg(mean_math=('math', 'mean'))", o: ['nclass별 math 평균을 mean_math라는 이름으로 구한다', 'math별 nclass 평균을 구한다', 'mean_math 열을 nclass 순서로 정렬한다', 'nclass가 math인 행을 추출한다'], e: "«새이름=('원래 열', '함수')» 형태입니다." },
    { ch: 6, q: '«groupby()»에서 «as_index=False»를 지정했을 때의 결과로 옳은 것은?', o: ['집단 변수가 인덱스가 아닌 일반 열로 남는다', '집단 변수가 결과에서 삭제된다', '결측치가 자동으로 제거된다', '결과가 내림차순으로 정렬된다'], e: '그래프의 x축 등에 바로 쓸 수 있게 일반 열로 남습니다.' },
    { ch: 6, q: '«agg()»에서 집단별 빈도(개수)를 구하는 함수 이름은?', o: ["«'count'»", "«'sum'»", "«'mean'»", "«'max'»"], e: "'count'는 값의 개수를 셉니다." },
    { ch: 6, q: '기준 열(key)을 이용해 두 데이터를 가로로 합치는 함수는?', o: ['«pd.merge()»', '«pd.concat()»', '«df.query()»', '«df.groupby()»'], e: 'merge는 열 방향, concat은 행 방향입니다.' },
    { ch: 6, q: '열 구성이 같은 두 데이터를 세로로(행 방향으로) 이어 붙이는 함수는?', o: ['«pd.concat()»', '«pd.merge()»', '«df.agg()»', '«df.drop()»'], e: '«pd.concat([df1, df2])»' },
    { ch: 6, q: "«pd.merge(cafe, store, how='left', on='store')»에서 «on='store'»의 의미는?", o: ['store 열을 기준으로 합친다', 'store 데이터만 남긴다', 'store 열을 삭제한다', 'store 열 이름을 바꾼다'], e: 'on에는 두 데이터를 연결할 기준 열을 넣습니다.' },
    { ch: 6, q: "«how='left'»로 merge할 때의 설명으로 옳은 것은?", o: ['왼쪽 데이터의 행을 기준으로 유지하며 합친다', '오른쪽 데이터의 행만 남긴다', '두 데이터의 열 중 공통 열만 남긴다', '행 방향으로 이어 붙인다'], e: '왼쪽(첫 번째) 데이터가 기준이 됩니다.' },
    { ch: 6, q: '30행인 cafe와 5행인 event(열 구성 동일)를 «pd.concat([cafe, event])»로 합친 결과의 행 수는?', o: ['35', '30', '150', '5'], e: '행 방향으로 이어 붙이므로 30 + 5 = 35행입니다.' },
    { ch: 6, q: '분석 질문을 해결하는 메서드 체인의 순서로 가장 적절한 것은?', o: ['query → groupby → agg → sort_values', 'sort_values → agg → query → groupby', 'agg → groupby → query → sort_values', 'groupby → query → sort_values → agg'], e: '추출 → 집단 나누기 → 요약 → 정렬 순서입니다.' },
    { ch: 6, q: '정렬된 결과에서 첫 번째 행을 꺼낼 때 사용하는 것은?', o: ['«iloc[0]»', '«iloc[1]»', '«head(0)»', '«columns[0]»'], e: '파이썬은 0부터 셉니다.' },
    { ch: 6, q: "«df.groupby(['store', 'category'])»의 의미로 옳은 것은?", o: ['store와 category의 조합별로 집단을 나눈다', 'store 열만 기준으로 집단을 나눈다', 'store와 category 열을 하나로 합친다', 'store와 category 열을 삭제한다'], e: '여러 변수를 리스트로 넣으면 조합별로 나뉩니다.' },
    { ch: 6, q: '«!=» 연산자의 의미는?', o: ['같지 않다', '같다', '이상이다', '포함한다'], e: "예: «query(\"store != 'A관'\")»" },
    { ch: 6, q: '다음 코드가 구하는 것으로 옳은 것은?', code: "mpg.query(\"category == 'suv'\") \\\n   .groupby('manufacturer') \\\n   .agg(mean_cty=('cty', 'mean')) \\\n   .sort_values('mean_cty', ascending=False) \\\n   .head(5)", o: ['suv 중 제조사별 cty 평균 상위 5개', '제조사별 suv 개수 상위 5개', '전체 자동차의 cty 평균 하위 5개', 'suv의 cty 값 상위 5행'], e: 'suv 추출 → 제조사별 → cty 평균 → 내림차순 → 상위 5개' },
    { ch: 6, q: '«agg()»에 여러 요약을 한 번에 넣은 코드로 옳은 것은?', o: ["«agg(총매출=('sales', 'sum'), 평균평점=('rating', 'mean'))»", "«agg('sales' = sum, 'rating' = mean)»", "«agg[sum('sales'), mean('rating')]»", "«agg(sum, mean)('sales', 'rating')»"], e: "«새이름=('열', '함수')»를 쉼표로 나열합니다." },

    /* ---- 7장 ---- */
    { ch: 7, q: '결측치 여부를 True/False로 확인하는 메서드는?', o: ['«isna()»', '«dropna()»', '«fillna()»', '«replace()»'], e: '«isna()»는 결측치이면 True입니다.' },
    { ch: 7, q: '열별 결측치 개수를 확인하는 코드는?', o: ['«df.isna().sum()»', '«df.dropna().sum()»', '«df.fillna().sum()»', '«df.sum().isna()»'], e: 'True는 1로 계산되므로 sum()이 결측치 개수가 됩니다.' },
    { ch: 7, q: 'pandas에서 결측치를 표시하는 값은?', o: ['NaN', '0', '-1', '999'], e: '결측치는 NaN(Not a Number)으로 표시됩니다.' },
    { ch: 7, q: '결측치가 있는 행을 제거하는 메서드는?', o: ['«dropna()»', '«fillna()»', '«isna()»', '«replace()»'], e: '«dropna()»는 결측치가 있는 행을 제거합니다.' },
    { ch: 7, q: '«study_hours»와 «sleep_hours» 중 결측치가 있는 행만 제거하는 코드는?', o: ["«df.dropna(subset=['study_hours', 'sleep_hours'])»", '«df.dropna()»', "«df.fillna(['study_hours', 'sleep_hours'])»", "«df.isna(subset=['study_hours', 'sleep_hours'])»"], e: '«subset»으로 분석에 필요한 열만 지정합니다.' },
    { ch: 7, q: '결측치를 다른 값으로 채우는 메서드는?', o: ['«fillna()»', '«dropna()»', '«isna()»', '«notna()»'], e: '«fillna(값)»' },
    { ch: 7, q: '극단값이 있는 숫자 변수의 결측치를 대체할 때 더 적절한 대표값은?', o: ['중앙값', '평균', '최댓값', '최솟값'], e: '중앙값은 극단값의 영향을 덜 받습니다.' },
    { ch: 7, q: '학과처럼 범주형(문자) 변수의 결측치를 대체할 때 주로 사용하는 대표값은?', o: ['최빈값', '평균', '중앙값', '표준편차'], e: '문자 변수는 평균을 계산할 수 없으므로 최빈값을 씁니다.' },
    { ch: 7, q: "«df['department'].mode()[0]»에서 «[0]»을 붙이는 이유는?", o: ['«mode()»가 Series를 반환하므로 첫 번째 값을 꺼내기 위해', '첫 번째 행만 대체하기 위해', '결측치를 0으로 바꾸기 위해', '오름차순으로 정렬하기 위해'], e: '최빈값이 여러 개일 수 있어 mode()는 Series를 반환합니다.' },
    { ch: 7, q: '«value_counts(dropna=False)»의 의미로 옳은 것은?', o: ['결측치(NaN)도 하나의 범주로 포함해 빈도를 센다', '결측치를 제거하고 빈도를 센다', '결측치를 0으로 바꾼다', '빈도가 0인 범주를 제외한다'], e: '기본값(dropna=True)은 NaN을 빼고 셉니다.' },
    { ch: 7, q: "«df['x'].between(1, 5)»의 의미로 옳은 것은?", o: ['x가 1 이상 5 이하이면 True', 'x가 1 초과 5 미만이면 True', 'x가 1 또는 5이면 True', 'x가 1~5 범위를 벗어나면 True'], e: 'between은 양 끝 값을 포함합니다.' },
    { ch: 7, q: '다음 코드의 결과로 옳은 것은?', code: "df['score'] = np.where(df['score'].between(0, 100), df['score'], np.nan)", o: ['0~100 범위를 벗어난 score가 NaN으로 바뀐다', '0~100 범위의 score가 NaN으로 바뀐다', 'score의 결측치가 0으로 바뀐다', 'score가 0~100인 행만 남고 나머지 행은 삭제된다'], e: '조건이 참이면 원래 값, 거짓이면 NaN입니다. 행은 삭제되지 않습니다.' },
    { ch: 7, q: 'commute_min 열의 999를 결측치로 바꾸는 코드는?', o: ["«df['commute_min'].replace(999, np.nan)»", "«df['commute_min'].fillna(999)»", "«df['commute_min'].dropna(999)»", "«df['commute_min'].isna(999)»"], e: '«replace(바꿀 값, 새 값)»' },
    { ch: 7, q: '«quantile(0.25)»가 구하는 값은?', o: ['1사분위수(Q1)', '3사분위수(Q3)', '중앙값', 'IQR'], e: '하위 25% 지점의 값입니다.' },
    { ch: 7, q: 'IQR(사분위 범위)을 구하는 식은?', o: ['Q3 - Q1', 'Q1 - Q3', 'Q3 + Q1', '(Q3 - Q1) / 2'], e: 'IQR = Q3 - Q1' },
    { ch: 7, q: 'IQR 기준 이상치의 하한을 구하는 식은?', o: ['Q1 - 1.5 × IQR', 'Q1 + 1.5 × IQR', 'Q3 - 1.5 × IQR', 'Q1 - 3 × IQR'], e: '하한 = Q1 - 1.5×IQR, 상한 = Q3 + 1.5×IQR' },
    { ch: 7, q: 'pandas에서 결측치가 포함된 열의 «mean()»을 계산하면?', o: ['결측치를 제외하고 평균을 계산한다', '결측치를 0으로 보고 계산한다', '항상 NaN이 반환된다', '오류가 발생한다'], e: 'pandas는 기본적으로 결측치를 건너뛰고(skipna) 계산합니다.' },
    { ch: 7, q: '조건 앞에 붙는 «~» 기호의 의미는?', o: ['조건을 반대로(NOT) 뒤집는다', '두 조건을 and로 연결한다', '두 조건을 or로 연결한다', '결측치를 제외한다'], e: "«~df['x'].between(1, 5)»는 범위 밖이면 True입니다." },
    { ch: 7, q: '«notna()»의 결과로 옳은 것은?', o: ['결측치가 아니면 True', '결측치이면 True', '결측치를 0으로 바꾼 값', '결측치의 개수'], e: '«isna()»의 반대입니다.' },
    { ch: 7, q: '출석률(attendance)이 125처럼 정상 범위(0~100)를 벗어난 경우 가장 적절한 처리는?', o: ['입력 오류로 보고 NaN으로 대체한다', '그대로 평균 계산에 사용한다', '해당 학생의 모든 열을 0으로 바꾼다', '출석률 열 전체를 삭제한다'], e: '규칙 기반으로 명백한 오류는 NaN으로 바꿉니다.' },
    { ch: 7, q: '걸음 수(steps)가 IQR 경계를 벗어나지만 실제로 가능한 값일 때 가장 적절한 처리는?', o: ['삭제하지 않고 유지하며 이상치 여부를 표시한다', '무조건 삭제한다', '평균으로 바꾼다', '0으로 바꾼다'], e: '이상치 = 무조건 삭제가 아닙니다. 유지 + 표시합니다.' },
    { ch: 7, q: '인자 없이 «df.dropna()»를 실행하면?', o: ['어느 열이든 결측치가 하나라도 있는 행을 모두 제거한다', '결측치가 있는 열을 모두 제거한다', '결측치를 0으로 채운다', '결측치 개수를 반환한다'], e: '분석에 쓰지 않는 열 때문에 행이 삭제될 수 있어 subset을 권장합니다.' },
    { ch: 7, q: '규칙 기반 이상치에 대한 설명으로 옳은 것은?', o: ['값의 정상 범위를 정하고 그 범위를 벗어난 값을 찾는다', 'IQR의 1.5배를 기준으로 찾는다', '평균보다 큰 값을 모두 이상치로 본다', '결측치를 이상치로 본다'], e: 'IQR 기준은 통계적 이상치입니다.' },
    { ch: 7, q: '결측치를 직접 만들 때 사용하는 값은?', o: ['«np.nan»', '«np.null»', '«pd.none»', "«'NaN'»(문자열)"], e: "문자열 'NaN'은 결측치가 아닌 일반 문자입니다." },
    { ch: 7, q: '다음 코드의 실행 결과는?', code: "df = pd.DataFrame({'x': [1, np.nan, 3, np.nan]})\ndf['x'].isna().sum()", o: ['2', '4', '1', '0'], e: 'NaN이 2개입니다.' },
    { ch: 7, q: '분석에 쓰지 않는 열의 결측치 때문에 행 전체를 삭제할 때 생길 수 있는 문제로 옳은 것은?', o: ['필요한 데이터까지 버려져 표본이 줄고 결과가 편향될 수 있다', '결측치가 오히려 늘어난다', '평균이 항상 0이 된다', '열 이름이 바뀐다'], e: '그래서 «dropna(subset=...)»로 필요한 열만 지정합니다.' },
    { ch: 7, q: '«df.isna()»의 결과에 대한 설명으로 옳은 것은?', o: ['원래 데이터와 같은 크기의 True/False 표가 반환된다', '결측치가 있는 행만 반환된다', '결측치 개수 하나만 반환된다', '결측치가 자동으로 제거된다'], e: '각 칸마다 결측치 여부를 True/False로 표시합니다.' },

    /* ---- 8장 ---- */
    { ch: 8, q: '두 연속형 변수의 관계를 확인하기에 가장 적절한 그래프는?', o: ['산점도(scatterplot)', '막대그래프(barplot)', '빈도 막대그래프(countplot)', '선그래프(lineplot)'], e: '두 연속 변수의 관계 → 산점도' },
    { ch: 8, q: '집단별 평균을 비교하기에 가장 적절한 그래프 함수는?', o: ['«barplot()»', '«scatterplot()»', '«lineplot()»', '«countplot()»'], e: '요약표의 평균을 막대 높이로 비교합니다.' },
    { ch: 8, q: '범주별 빈도(개수)를 원자료에서 바로 세어 나타내는 그래프 함수는?', o: ['«countplot()»', '«scatterplot()»', '«lineplot()»', '«boxplot()»'], e: 'countplot은 원자료를 넣으면 빈도를 직접 셉니다.' },
    { ch: 8, q: '시간에 따라 달라지는 데이터를 표현하기에 적절한 그래프 함수는?', o: ['«lineplot()»', '«countplot()»', '«boxplot()»', '«barplot()»'], e: '시간 흐름 → 선그래프' },
    { ch: 8, q: '집단별 분포(중앙값, 퍼짐, 극단값)를 비교하기에 적절한 그래프 함수는?', o: ['«boxplot()»', '«lineplot()»', '«countplot()»', '«scatterplot()»'], e: '상자그림은 분포를 요약해 보여줍니다.' },
    { ch: 8, q: "«sns.scatterplot(data=mpg, x='displ', y='hwy', hue='drv')»에서 «hue='drv'»의 역할은?", o: ['drv 값에 따라 점의 색을 다르게 표시한다', 'drv를 x축으로 사용한다', 'drv 값의 평균을 표시한다', 'drv별로 그래프를 따로 그린다'], e: 'hue는 범주별 색 구분입니다.' },
    { ch: 8, q: '그래프의 x축 범위를 1~7로 제한하는 코드는?', o: ['«.set(xlim=[1, 7])»', '«.set(ylim=[1, 7])»', '«.set(xrange=[1, 7])»', '«.set(x=[1, 7])»'], e: 'xlim은 x축, ylim은 y축 범위입니다.' },
    { ch: 8, q: '«barplot()»과 «countplot()»의 차이로 옳은 것은?', o: ['barplot은 평균 등 요약표를, countplot은 원자료를 넣어 빈도를 센다', 'barplot은 원자료만, countplot은 요약표만 사용할 수 있다', '두 그래프는 이름만 다르고 기능이 같다', 'countplot은 연속형 변수에만 사용한다'], e: 'barplot: groupby로 만든 요약표 / countplot: 원자료' },
    { ch: 8, q: '막대그래프의 막대 순서를 지정하는 파라미터는?', o: ['«order»', '«hue»', '«sort»', '«xlim»'], e: "«order=['4', 'f', 'r']»처럼 지정합니다." },
    { ch: 8, q: '«countplot()»의 막대를 빈도가 높은 순서로 정렬하는 코드는?', o: ["«sns.countplot(data=mpg, x='drv', order=mpg['drv'].value_counts().index)»", "«sns.countplot(data=mpg, x='drv', ascending=False)»", "«sns.countplot(data=mpg, x='drv', sort=True)»", "«sns.countplot(data=mpg, x='drv', hue='count')»"], e: '«value_counts()»는 빈도가 높은 순으로 정렬되어 있습니다.' },
    { ch: 8, q: '문자로 된 날짜를 날짜형으로 변환하는 함수는?', o: ['«pd.to_datetime()»', '«pd.to_date()»', '«pd.datetime()»', '«pd.read_date()»'], e: "«df['date2'] = pd.to_datetime(df['date'])»" },
    { ch: 8, q: '날짜형 변수 «date2»에서 연도를 추출하는 코드는?', o: ["«df['date2'].dt.year»", "«df['date2'].year()»", "«df['date2'].dt.month»", "«df['year'].dt.date2»"], e: '«.dt.year», «.dt.month», «.dt.day»' },
    { ch: 8, q: '상자그림에서 상자 안의 가운데 선이 의미하는 것은?', o: ['중앙값', '평균', '최댓값', '최빈값'], e: '가운데 선은 중앙값(50%)입니다.' },
    { ch: 8, q: '상자그림에서 상자의 아래쪽과 위쪽 끝이 의미하는 것은?', o: ['1사분위수(Q1)와 3사분위수(Q3)', '최솟값과 최댓값', '평균 ± 표준편차', 'IQR 기준 하한과 상한'], e: '상자 길이 = Q3 - Q1 = IQR' },
    { ch: 8, q: '상자그림에서 수염 바깥에 따로 찍힌 점이 의미하는 것은?', o: ['극단값(이상치) 후보', '평균값', '결측치', '중앙값'], e: 'IQR 1.5배 범위를 벗어난 값입니다.' },
    { ch: 8, q: '상자그림의 수염(whisker)은 상자 끝에서 최대 어디까지 그려지는가?', o: ['IQR의 1.5배 이내에 있는 가장 먼 값', 'IQR의 3배', '전체 범위의 절반', '평균 ± 1'], e: '7장 IQR 이상치 기준과 같은 개념입니다.' },
    { ch: 8, q: 'Windows에서 그래프의 한글이 깨지지 않도록 하는 코드는?', o: ["«plt.rc('font', family='Malgun Gothic')»", "«plt.rc('korean', True)»", "«sns.set(language='kor')»", "«plt.font('Malgun')»"], e: '맑은 고딕 폰트를 지정합니다.' },
    { ch: 8, q: "«plt.rc('axes', unicode_minus=False)»를 설정하는 이유는?", o: ['한글 폰트에서 마이너스(-) 기호가 깨지는 것을 막기 위해', '그래프 축을 숨기기 위해', '음수 값을 제거하기 위해', '축 범위를 0 이상으로 제한하기 위해'], e: '한글 폰트 사용 시 마이너스 기호가 네모로 보이는 문제를 막습니다.' },
    { ch: 8, q: '«sns.lineplot()»에서 신뢰구간(음영)을 표시하지 않도록 하는 옵션은?', o: ['«errorbar=None»', '«hue=None»', '«order=None»', '«xlim=None»'], e: "«sns.lineplot(data=economics, x='year', y='unemploy', errorbar=None)»" },
    { ch: 8, q: 'seaborn 패키지를 불러오는 코드로 옳은 것은?', o: ['«import seaborn as sns»', '«import sns as seaborn»', '«from seaborn import pd»', '«import seaborn.pyplot as sns»'], e: '관례적으로 sns라는 약칭을 씁니다.' },
    { ch: 8, q: '다음 그래프에서 막대의 높이가 나타내는 것은?', code: "df_mean = mpg.groupby('drv', as_index=False).agg(mean_hwy=('hwy', 'mean'))\nsns.barplot(data=df_mean, x='drv', y='mean_hwy')", o: ['drv별 hwy 평균', 'drv별 자동차 수', 'hwy별 drv 개수', 'drv별 hwy 최댓값'], e: 'y축이 mean_hwy(평균)입니다.' },
    { ch: 8, q: '평균이 높은 순서로 막대를 배치하려고 할 때 가장 적절한 방법은?', o: ['요약표를 «sort_values()»로 정렬한 뒤 «order=»에 정렬된 집단 열을 넣는다', '«barplot()»에 «ascending=False»를 넣는다', '«hue=»에 평균 열을 넣는다', '«set(ylim=...)»으로 축 범위를 바꾼다'], e: "«order=df_mean['drv']»처럼 정렬된 순서를 넘깁니다." },
    { ch: 8, q: '그래프와 용도가 잘못 짝지어진 것은?', o: ['«lineplot()» – 범주별 빈도 비교', '«scatterplot()» – 두 연속 변수의 관계', '«boxplot()» – 집단별 분포 비교', '«countplot()» – 범주별 빈도'], e: '범주별 빈도는 countplot입니다.' },
    { ch: 8, q: "«sns.boxplot(data=mpg, x='drv', y='hwy')»에 대한 설명으로 옳은 것은?", o: ['drv별 hwy 분포를 상자그림으로 비교한다', 'hwy별 drv 빈도를 막대로 나타낸다', 'drv와 hwy의 관계를 점으로 나타낸다', 'drv별 hwy 평균만 막대로 나타낸다'], e: 'x는 집단, y는 연속형 변수입니다.' },
    { ch: 8, q: '산점도에서 점들이 오른쪽 아래로 향하는 경향을 보일 때 해석으로 옳은 것은?', o: ['x가 커질수록 y가 작아지는 경향(음의 관계)', 'x가 커질수록 y도 커지는 경향(양의 관계)', 'x와 y의 값이 항상 같다', 'x와 y에 결측치가 많다'], e: '오른쪽 아래 → 음의 관계' },
    { ch: 8, q: "«sns.countplot(data=df, x='activity_type')»의 막대 높이가 나타내는 것은?", o: ['activity_type별 기록(행) 수', 'activity_type별 평균 점수', 'activity_type별 걸음 수 합계', 'activity_type의 종류 수'], e: 'countplot은 범주별 행 개수를 셉니다.' },
  ];

  // OX: a = 정답(true = O)
  const OX = [
    /* 5장 */
    { ch: 5, q: '«df.head()»는 괄호 안에 숫자를 넣지 않으면 앞 5행을 출력한다.', a: true },
    { ch: 5, q: '«df.shape»는 메서드이므로 «df.shape()»처럼 괄호를 붙여 사용해야 한다.', a: false, e: 'shape는 어트리뷰트이므로 괄호 없이 씁니다.' },
    { ch: 5, q: '«df.shape»의 결과 «(12, 8)»은 12개의 열과 8개의 행을 의미한다.', a: false, e: '(행, 열) 순서이므로 12행 8열입니다.' },
    { ch: 5, q: '«df.info()»로 각 변수의 자료형을 확인할 수 있다.', a: true },
    { ch: 5, q: '«df.describe()»는 기본적으로 숫자 변수의 요약 통계량을 출력한다.', a: true },
    { ch: 5, q: '«describe()» 결과의 «50%»는 평균을 의미한다.', a: false, e: '50%는 중앙값입니다.' },
    { ch: 5, q: '«df.tail()»은 데이터의 마지막 5행을 출력한다.', a: true },
    { ch: 5, q: "«rename(columns={'새이름': '옛이름'})»처럼 새 이름을 먼저 쓴다.", a: false, e: "«{'옛이름': '새이름'}» 순서입니다." },
    { ch: 5, q: '«copy()»로 만든 복사본을 수정해도 원본 데이터는 바뀌지 않는다.', a: true },
    { ch: 5, q: '«rename()»을 실행하기만 하면 결과를 다시 대입하지 않아도 변수명이 바뀐다.', a: false, e: '«df = df.rename(...)»처럼 다시 대입해야 합니다.' },
    { ch: 5, q: '«sum([1, 2, 3])»의 «sum»은 함수이다.', a: true },
    { ch: 5, q: '«df.head()»의 «head»는 어트리뷰트이다.', a: false, e: '괄호와 함께 호출하는 head()는 메서드입니다.' },
    { ch: 5, q: '«np.where(조건, A, B)»는 조건이 참이면 A, 거짓이면 B를 반환한다.', a: true },
    { ch: 5, q: '«np.where()»를 사용하려면 numpy 패키지를 불러와야 한다.', a: true },
    { ch: 5, q: '«value_counts()»는 범주별 빈도를 구하는 메서드이다.', a: true },
    { ch: 5, q: '파생변수란 기존 변수를 변형하거나 조합해 새로 만든 변수이다.', a: true },
    { ch: 5, q: "«df['total'] = df['math'] + df['english']»는 같은 행의 두 값을 더해 total 열을 만든다.", a: true },
    { ch: 5, q: '«describe()» 결과의 count는 결측치를 포함한 전체 행 수이다.', a: false, e: 'count는 결측치를 제외한 개수입니다.' },
    { ch: 5, q: "«describe(include='all')»을 사용하면 문자 변수의 unique, top, freq도 확인할 수 있다.", a: true },
    { ch: 5, q: '«pd.read_csv()»는 엑셀(.xlsx) 파일을 불러오는 함수이다.', a: false, e: '엑셀은 «pd.read_excel()»입니다.' },
    { ch: 5, q: '«df.columns»로 변수명 목록을 확인할 수 있다.', a: true },
    { ch: 5, q: '«np.select()»에서 어떤 조건에도 해당하지 않을 때의 값은 «default»로 지정한다.', a: true },
    { ch: 5, q: "mean이 정확히 80일 때 «np.where(df['mean'] >= 80, 'pass', 'fail')»의 결과는 'fail'이다.", a: false, e: '>=는 같은 값을 포함하므로 pass입니다.' },

    /* 6장 */
    { ch: 6, q: '«query()»는 조건에 맞는 행을 추출한다.', a: true },
    { ch: 6, q: '«query()» 안에서 같다는 조건은 «=» 한 개로 쓴다.', a: false, e: '비교는 «==»입니다.' },
    { ch: 6, q: '«query()» 안에서 문자 값은 따옴표로 감싸야 한다.', a: true },
    { ch: 6, q: '«query()»에서 and 조건은 «&», or 조건은 «|»로 쓸 수 있다.', a: true },
    { ch: 6, q: "«df['math']»의 결과는 DataFrame이다.", a: false, e: '대괄호 1겹은 Series입니다.' },
    { ch: 6, q: "«df[['math', 'english']]»는 두 열을 DataFrame으로 추출한다.", a: true },
    { ch: 6, q: '«sort_values()»는 기본적으로 내림차순으로 정렬한다.', a: false, e: '기본은 오름차순입니다.' },
    { ch: 6, q: '«ascending=False»를 지정하면 큰 값부터 정렬된다.', a: true },
    { ch: 6, q: '«groupby()»만 실행해도 집단별 평균이 바로 출력된다.', a: false, e: 'agg() 등으로 요약해야 결과가 나옵니다.' },
    { ch: 6, q: "«agg(mean_math=('math', 'mean'))»은 math의 평균을 mean_math라는 이름으로 만든다.", a: true },
    { ch: 6, q: '«groupby()»에 여러 변수를 리스트로 넣으면 변수 조합별로 집단을 나눌 수 있다.', a: true },
    { ch: 6, q: '«pd.merge()»는 행 방향(세로)으로 데이터를 이어 붙인다.', a: false, e: '세로로 붙이는 것은 concat입니다.' },
    { ch: 6, q: '«pd.concat()»은 열 구성이 같은 데이터를 행 방향으로 합칠 때 사용한다.', a: true },
    { ch: 6, q: "«pd.merge(cafe, store, on='store')»는 store 열을 기준으로 두 데이터를 합친다.", a: true },
    { ch: 6, q: "«drop(columns='math')»는 math 열을 제거한다.", a: true },
    { ch: 6, q: '메서드 체인은 여러 메서드를 점(.)으로 이어 한 번에 작성하는 방식이다.', a: true },
    { ch: 6, q: '«head(5)»를 정렬 전에 실행해도 정렬 후 실행한 것과 결과가 항상 같다.', a: false, e: '정렬 후 head()를 해야 상위 값이 나옵니다.' },
    { ch: 6, q: "«query(\"payment in ['카드', '현금']\")»은 결제수단이 카드 또는 현금인 행을 추출한다.", a: true },
    { ch: 6, q: '«iloc[0]»은 첫 번째 행을 의미한다.', a: true },
    { ch: 6, q: '«as_index=False»를 쓰면 집단 변수가 결과의 일반 열로 남는다.', a: true },
    { ch: 6, q: "«agg()»에서 'count'는 값의 합계를 구한다.", a: false, e: "'count'는 개수, 'sum'이 합계입니다." },
    { ch: 6, q: '«!=»는 \'같지 않다\'를 의미한다.', a: true },
    { ch: 6, q: "«how='left'»로 merge하면 왼쪽 데이터의 행이 기준이 된다.", a: true },

    /* 7장 */
    { ch: 7, q: '결측치는 pandas에서 NaN으로 표시된다.', a: true },
    { ch: 7, q: '«isna()»는 결측치이면 True, 아니면 False를 반환한다.', a: true },
    { ch: 7, q: '«df.isna().sum()»은 열별 결측치 개수를 보여준다.', a: true },
    { ch: 7, q: '«dropna()»는 결측치를 평균으로 채운다.', a: false, e: 'dropna는 제거, 채우는 것은 fillna입니다.' },
    { ch: 7, q: "«dropna(subset=['a'])»는 a 열에 결측치가 있는 행만 제거한다.", a: true },
    { ch: 7, q: '인자 없이 «dropna()»를 쓰면 분석에 쓰지 않는 열의 결측치 때문에 행이 제거될 수 있다.', a: true },
    { ch: 7, q: '«fillna()»는 결측치를 지정한 값으로 대체한다.', a: true },
    { ch: 7, q: '극단값이 있는 숫자 변수는 평균보다 중앙값으로 결측치를 대체하는 것이 더 적절할 수 있다.', a: true },
    { ch: 7, q: '범주형 변수의 결측치는 평균으로 대체하는 것이 일반적이다.', a: false, e: '범주형은 최빈값으로 대체합니다.' },
    { ch: 7, q: '«mode()»는 항상 하나의 값(스칼라)만 반환한다.', a: false, e: 'Series를 반환하므로 «[0]»으로 꺼냅니다.' },
    { ch: 7, q: '«value_counts()»는 기본적으로 결측치를 빈도에 포함한다.', a: false, e: '«dropna=False»를 지정해야 포함됩니다.' },
    { ch: 7, q: '«between(1, 5)»는 1과 5를 포함한다.', a: true },
    { ch: 7, q: '«between(1, 5)»는 1 초과 5 미만일 때만 True이다.', a: false, e: '양 끝을 포함합니다(1 이상 5 이하).' },
    { ch: 7, q: '«replace(999, np.nan)»은 999를 결측치로 바꾼다.', a: true },
    { ch: 7, q: 'IQR은 Q3에서 Q1을 뺀 값이다.', a: true },
    { ch: 7, q: 'IQR 기준 상한은 Q3 + 1.5 × IQR이다.', a: true },
    { ch: 7, q: '«quantile(0.75)»는 1사분위수를 구한다.', a: false, e: '0.75는 3사분위수(Q3)입니다.' },
    { ch: 7, q: 'IQR 경계를 벗어난 값은 항상 입력 오류이므로 반드시 삭제해야 한다.', a: false, e: '실제 가능한 값이면 유지 + 표시합니다.' },
    { ch: 7, q: 'pandas의 «mean()»은 결측치를 제외하고 평균을 계산한다.', a: true },
    { ch: 7, q: '«~» 기호는 조건을 반대로 뒤집는다.', a: true },
    { ch: 7, q: '«notna()»는 결측치일 때 True를 반환한다.', a: false, e: 'notna()는 결측치가 아닐 때 True입니다.' },
    { ch: 7, q: '만족도가 1~5점인 변수에 9점이 있다면 규칙 기반 이상치로 볼 수 있다.', a: true },
    { ch: 7, q: '원본을 보존하려면 «copy()»로 복사본을 만든 뒤 결측치를 처리하는 것이 좋다.', a: true },

    /* 8장 */
    { ch: 8, q: '두 연속형 변수의 관계는 산점도로 확인한다.', a: true },
    { ch: 8, q: '«hue» 파라미터를 사용하면 범주별로 색을 다르게 표시할 수 있다.', a: true },
    { ch: 8, q: '«countplot()»에는 groupby로 미리 계산한 평균 요약표를 넣어야 한다.', a: false, e: 'countplot은 원자료를 넣습니다. 요약표는 barplot입니다.' },
    { ch: 8, q: '«barplot()»으로 집단별 평균을 비교할 수 있다.', a: true },
    { ch: 8, q: '시간에 따른 변화는 선그래프로 표현하는 것이 적절하다.', a: true },
    { ch: 8, q: '«.set(xlim=[1, 7])»은 y축 범위를 1~7로 지정한다.', a: false, e: 'xlim은 x축 범위입니다.' },
    { ch: 8, q: '«pd.to_datetime()»은 문자열 날짜를 날짜형으로 변환한다.', a: true },
    { ch: 8, q: '날짜형 변수에서 월을 추출하려면 «.dt.month»를 사용한다.', a: true },
    { ch: 8, q: '상자그림의 상자 가운데 선은 평균을 의미한다.', a: false, e: '중앙값입니다.' },
    { ch: 8, q: '상자그림의 상자 길이는 IQR(Q3 - Q1)을 나타낸다.', a: true },
    { ch: 8, q: '상자그림에서 수염 밖의 점은 극단값 후보이다.', a: true },
    { ch: 8, q: '«order» 파라미터로 막대의 순서를 지정할 수 있다.', a: true },
    { ch: 8, q: "«plt.rc('font', family='Malgun Gothic')»은 그래프의 한글 깨짐을 막기 위한 설정이다.", a: true },
    { ch: 8, q: '«errorbar=None»을 지정하면 선그래프의 신뢰구간 음영이 표시되지 않는다.', a: true },
    { ch: 8, q: '범주별 빈도를 나타낼 때는 lineplot이 가장 적절하다.', a: false, e: 'countplot이 적절합니다.' },
    { ch: 8, q: 'seaborn은 관례적으로 «sns»라는 약칭으로 불러온다.', a: true },
    { ch: 8, q: "«groupby('drv', as_index=False)»로 만든 요약표는 drv를 일반 열로 가지므로 barplot의 x에 바로 쓸 수 있다.", a: true },
    { ch: 8, q: '산점도에서 점들이 오른쪽 위로 향하면 양의 관계로 해석할 수 있다.', a: true },
    { ch: 8, q: '그래프를 고를 때는 분석 질문보다 그래프가 예쁜지를 먼저 판단한다.', a: false, e: '분석 질문에 맞는지를 먼저 판단합니다.' },
    { ch: 8, q: '«boxplot()»은 집단별 분포를 비교할 때 사용한다.', a: true },
    { ch: 8, q: '«sns.scatterplot()»은 막대그래프를 그리는 함수이다.', a: false, e: '산점도 함수입니다.' },
    { ch: 8, q: "«df['date2'].dt.year»는 날짜형 변수에서 연도를 추출한다.", a: true },
  ];

  /* ===== 파라미터형(매번 새로 만들어지는) 문제 ===== */
  const NAMES = ['민준', '서연', '지호', '하은', '도윤', '수아', '예준', '지유', '시우', '하린'];
  const lit = v => v === null ? 'np.nan' : typeof v === 'string' ? `'${v}'` : String(v);
  const dfCode = cols => 'df = pd.DataFrame({\n' + cols.map(([k, vs]) => `    '${k}': [${vs.map(lit).join(', ')}]`).join(',\n') + '\n})';
  const pyF = x => Number.isInteger(x) ? x.toFixed(1) : String(x);
  const HEAD = 'import pandas as pd\nimport numpy as np\n\n';

  function numOpts(r, ans, fmt = String, lo = 0) {
    const set = new Set([ans]);
    const deltas = r.shuffle([-2, -1, 1, 2, 3, -3]);
    for (const d of deltas) { if (set.size >= 4) break; const v = ans + d; if (v >= lo) set.add(v); }
    let k = 4; while (set.size < 4) set.add(ans + (k++));
    const arr = [...set];
    return { o: [fmt(ans), ...arr.filter(v => v !== ans).map(fmt)] };
  }
  function fill4(arr, more) {
    const o = [...new Set(arr.map(String))].slice(0, 4);
    for (let i = 1; o.length < 4; i++) { const v = String(more(i)); if (!o.includes(v)) o.push(v); }
    return o;
  }
  function scores(r, n, lo = 50, hi = 100) { const a = []; for (let i = 0; i < n; i++) a.push(r.int(lo, hi)); return a; }

  const PMC = [];
  const PM = (ch, gen) => PMC.push({ ch, gen });

  PM(6, r => {
    const n = r.int(6, 8), nm = r.sample(NAMES, n), sc = scores(r, n), t = r.pick(sc);
    const ans = sc.filter(s => s >= t).length;
    const code = dfCode([['name', nm], ['score', sc]]) + `\n\nlen(df.query('score >= ${t}'))`;
    return Object.assign({ q: '다음 코드의 실행 결과는?', code, e: `score가 ${t} 이상(같은 값 포함)인 행은 ${ans}개입니다.`, py: HEAD + code, val: String(ans) }, numOpts(r, ans));
  });
  PM(6, r => {
    const n = r.int(6, 8), nm = r.sample(NAMES, n), sc = scores(r, n), cls = nm.map(() => r.pick(['A', 'B'])), t = r.pick(sc);
    const c = r.pick(['A', 'B']);
    const ans = sc.filter((s, i) => s >= t && cls[i] === c).length;
    const code = dfCode([['name', nm], ['cls', cls], ['score', sc]]) + `\n\nlen(df.query("score >= ${t} & cls == '${c}'"))`;
    return Object.assign({ q: '다음 코드의 실행 결과는?', code, e: `cls가 '${c}'이면서 score가 ${t} 이상인 행은 ${ans}개입니다.`, py: HEAD + code, val: String(ans) }, numOpts(r, ans));
  });
  PM(5, r => {
    const n = r.int(5, 8), sc = scores(r, n, 40, 100), t = r.pick(sc);
    const ans = sc.filter(s => s >= t).length;
    const code = dfCode([['score', sc]]) + `\ndf['result'] = np.where(df['score'] >= ${t}, 'pass', 'fail')\n\ndf['result'].value_counts()['pass']`;
    return Object.assign({ q: "다음 코드를 실행했을 때 'pass'의 빈도는?", code, e: `${t} 이상(같은 값 포함)인 값이 ${ans}개입니다.`, py: HEAD + code, val: String(ans) }, numOpts(r, ans, String, 1));
  });
  PM(5, r => {
    for (let tries = 0; tries < 20; tries++) {
      const a = r.pick([90, 85, 80]), b = a - r.pick([10, 15, 20]);
      const sc = [a, b, r.int(b - 15, b - 1), r.int(b + 1, a - 1), r.int(a + 1, 100)];
      const s = r.shuffle(sc).slice(0, 5);
      const f = (x, strict) => strict ? (x > a ? 'A' : x > b ? 'B' : 'C') : (x >= a ? 'A' : x >= b ? 'B' : 'C');
      const show = arr => '[' + arr.map(x => `'${x}'`).join(', ') + ']';
      const ans = show(s.map(x => f(x, false)));
      const w1 = show(s.map(x => f(x, true)));
      const w2 = show(s.map(x => ({ A: 'C', B: 'B', C: 'A' })[f(x, false)]));
      const w3 = show(s.map(x => (x >= a ? 'A' : 'B')));
      const opts = [...new Set([ans, w1, w2, w3])];
      if (opts.length < 4 || opts[0] !== ans) continue;
      const code = dfCode([['score', s]]) + `\ndf['grade'] = np.where(df['score'] >= ${a}, 'A',\n              np.where(df['score'] >= ${b}, 'B', 'C'))\n\nlist(df['grade'])`;
      return { q: '다음 코드의 실행 결과로 옳은 것은?', code, o: opts, e: `${a} 이상 A, ${b} 이상 B, 나머지 C입니다(경계값 포함).`, py: HEAD + code, val: ans, kind: 'list' };
    }
    return null;
  });
  PM(5, r => {
    const n = r.int(4, 6), m = scores(r, n, 40, 100), en = scores(r, n, 40, 100);
    const tot = m.map((v, i) => v + en[i]), ans = Math.max(...tot);
    const code = dfCode([['math', m], ['english', en]]) + "\ndf['total'] = df['math'] + df['english']\n\ndf['total'].max()";
    const wrong = [Math.max(...m) + Math.max(...en), Math.min(...tot), tot[0]].filter(v => v !== ans);
    const o = fill4([ans, ...wrong], i => ans + i * 3);
    return { q: '다음 코드의 실행 결과는?', code, o, e: '행별로 더한 total 중 가장 큰 값입니다.', py: HEAD + code, val: String(ans) };
  });
  PM(5, r => {
    const n = r.int(6, 9), nm = r.sample(NAMES, Math.min(n, NAMES.length)), sc = scores(r, nm.length), t = r.pick(sc);
    const k = sc.filter(s => s >= t).length;
    const code = dfCode([['name', nm], ['nclass', nm.map(() => r.int(1, 3))], ['score', sc]]) + `\n\ndf.query('score >= ${t}').shape`;
    const o = fill4([`(${k}, 3)`, `(3, ${k})`, `(${nm.length}, 3)`, `(${k}, 2)`, `(${k + 1}, 3)`], i => `(${k + 1 + i}, 3)`);
    return { q: '다음 코드의 실행 결과는?', code, o, e: `조건을 만족하는 행 ${k}개, 열은 3개 그대로입니다.`, py: HEAD + code, val: `(${k}, 3)`, kind: 'tuple' };
  });
  PM(7, r => {
    const n = r.int(5, 7);
    const a = scores(r, n, 1, 9), b = scores(r, n, 1, 9);
    const ia = r.sample([...Array(n).keys()], r.int(1, 2)), ib = r.sample([...Array(n).keys()], r.int(1, 2));
    ia.forEach(i => a[i] = null); ib.forEach(i => b[i] = null);
    const k = r.int(0, 2);
    let expr, ans, e;
    if (k === 0) { expr = "len(df.dropna(subset=['a']))"; ans = a.filter(v => v !== null).length; e = 'a 열에 결측치가 있는 행만 제거합니다.'; }
    else if (k === 1) { expr = 'len(df.dropna())'; ans = a.filter((v, i) => v !== null && b[i] !== null).length; e = '어느 열이든 결측치가 있는 행은 모두 제거됩니다.'; }
    else { expr = "len(df.dropna(subset=['b']))"; ans = b.filter(v => v !== null).length; e = 'b 열에 결측치가 있는 행만 제거합니다.'; }
    const code = dfCode([['a', a], ['b', b]]) + '\n\n' + expr;
    return Object.assign({ q: '다음 코드의 실행 결과는?', code, e, py: HEAD + code, val: String(ans) }, numOpts(r, ans));
  });
  PM(7, r => {
    const n = r.int(5, 8), x = scores(r, n, 1, 5);
    const idx = r.sample([...Array(n).keys()], r.int(1, 3)); idx.forEach(i => x[i] = null);
    const sex = x.map(() => r.pick(['M', 'F'])); const isx = r.sample([...Array(n).keys()], r.int(0, 2)); isx.forEach(i => sex[i] = null);
    const k = r.chance(0.5);
    const ans = k ? idx.length + isx.length : idx.length;
    const code = dfCode([['sex', sex], ['score', x]]) + '\n\n' + (k ? 'df.isna().sum().sum()' : "df['score'].isna().sum()");
    return Object.assign({ q: '다음 코드의 실행 결과는?', code, e: k ? '전체 결측치 개수를 모두 더한 값입니다.' : 'score 열의 NaN 개수입니다.', py: HEAD + code, val: String(ans) }, numOpts(r, ans));
  });
  PM(7, r => {
    const vals = scores(r, 4, 50, 95); const rem = vals.reduce((s, v) => s + v, 0) % 4; vals[3] -= rem;
    const mean = vals.reduce((s, v) => s + v, 0) / 4;
    const pos = r.int(0, 4); const arr = vals.slice(); arr.splice(pos, 0, null);
    const code = dfCode([['score', arr]]) + `\ndf['score'] = df['score'].fillna(df['score'].mean())\n\ndf['score'][${pos}]`;
    const o = fill4([pyF(mean), pyF(Math.round(mean * 8) / 10), pyF(Math.max(...vals)), '0.0', 'nan'], i => pyF(mean + i));
    return { q: '다음 코드의 실행 결과는?', code, o, e: `결측치를 뺀 4개 값의 평균 ${pyF(mean)}으로 채워집니다.`, py: HEAD + code, val: pyF(mean), kind: 'float' };
  });
  PM(7, r => {
    let vals; do { vals = scores(r, 5, 10, 60); } while (new Set(vals).size < 5);
    const sorted = vals.slice().sort((a, b) => a - b), med = sorted[2];
    const mean = vals.reduce((s, v) => s + v, 0) / 5;
    const pos = r.int(0, 5); const arr = vals.slice(); arr.splice(pos, 0, null);
    const code = dfCode([['x', arr]]) + `\ndf['x'] = df['x'].fillna(df['x'].median())\n\ndf['x'][${pos}]`;
    const o = fill4([pyF(med), pyF(Math.round(mean * 10) / 10), pyF(sorted[1]), pyF(sorted[3]), '0.0'], i => pyF(med + i));
    return { q: '다음 코드의 실행 결과는?', code, o, e: `결측치를 뺀 값들의 중앙값 ${pyF(med)}으로 채워집니다.`, py: HEAD + code, val: pyF(med), kind: 'float' };
  });
  PM(7, r => {
    const lo = r.pick([0, 1]), hi = lo === 1 ? 5 : 100;
    const pool = lo === 1 ? [0, 1, 2, 3, 4, 5, 6, 7, 9] : [-5, 0, 35, 50, 88, 100, 101, 120];
    const x = r.shuffle([lo, hi, ...r.sample(pool, r.int(4, 5))]);
    const ans = x.filter(v => v >= lo && v <= hi).length;
    const code = dfCode([['x', x]]) + `\n\ndf['x'].between(${lo}, ${hi}).sum()`;
    return Object.assign({ q: '다음 코드의 실행 결과는?', code, e: `between은 ${lo}과 ${hi}를 포함합니다.`, py: HEAD + code, val: String(ans) }, numOpts(r, ans));
  });
  PM(7, r => {
    let v; do { v = scores(r, 5, 10, 50); } while (new Set(v).size < 5);
    const s = v.slice().sort((a, b) => a - b), q1 = s[1], q3 = s[3], iqr = q3 - q1;
    const k = r.int(0, 2);
    let expr, ans, e;
    if (k === 0) { expr = 'IQR'; ans = iqr; e = `Q1 = ${q1}, Q3 = ${q3}이므로 IQR = ${iqr}입니다.`; }
    else if (k === 1) { expr = 'Q3 + 1.5 * IQR'; ans = q3 + 1.5 * iqr; e = `상한 = ${q3} + 1.5 × ${iqr}`; }
    else { expr = 'Q1 - 1.5 * IQR'; ans = q1 - 1.5 * iqr; e = `하한 = ${q1} - 1.5 × ${iqr}`; }
    const code = dfCode([['x', v]]) + `\nQ1 = df['x'].quantile(0.25)\nQ3 = df['x'].quantile(0.75)\nIQR = Q3 - Q1\n\n${expr}`;
    const cands = [ans, ans + iqr / 2, ans - iqr / 2, k === 0 ? s[4] - s[0] : (k === 1 ? q3 + iqr : q1 - iqr), ans + 5];
    const o = fill4(cands.map(pyF), i => pyF(ans + 10 * i));
    return { q: '다음 코드의 실행 결과는? (5개 값의 quantile은 정렬했을 때 2번째, 4번째 값입니다)', code, o, e, py: HEAD + code, val: pyF(ans), kind: 'float' };
  });
  PM(6, r => {
    const n = r.int(6, 8), cls = [], sc = scores(r, n);
    for (let i = 0; i < n; i++) cls.push(['A', 'B', 'C'][i % 3]);
    const cl = r.shuffle(cls), g = r.pick(['A', 'B', 'C']), f = r.pick(['sum', 'max', 'min', 'count']);
    const sel = sc.filter((s, i) => cl[i] === g);
    const ans = f === 'sum' ? sel.reduce((a, b) => a + b, 0) : f === 'max' ? Math.max(...sel) : f === 'min' ? Math.min(...sel) : sel.length;
    const code = dfCode([['cls', cl], ['score', sc]]) + `\n\ndf.groupby('cls')['score'].agg('${f}')['${g}']`;
    const alt = f === 'count' ? [ans + 1, ans + 2, Math.max(0, ans - 1) === ans ? ans + 3 : ans - 1] : [sc.reduce((a, b) => a + b, 0), Math.max(...sc), Math.min(...sc), sel[0] + 1];
    const o = fill4([ans, ...alt].filter(v => v >= 0), i => ans + i * 7);
    return { q: '다음 코드의 실행 결과는?', code, o, e: `cls가 '${g}'인 score의 ${f} 값입니다.`, py: HEAD + code, val: String(ans) };
  });
  PM(6, r => {
    const n = r.int(5, 7), nm = r.sample(NAMES, n);
    let sc; do { sc = scores(r, n, 40, 100); } while (new Set(sc).size < n);
    const desc = r.chance(0.6);
    const idx = sc.indexOf(desc ? Math.max(...sc) : Math.min(...sc));
    const code = dfCode([['name', nm], ['score', sc]]) + `\n\ndf.sort_values('score'${desc ? ', ascending=False' : ''}).iloc[0]['name']`;
    const other = nm.filter((_, i) => i !== idx);
    const o = fill4([nm[idx], nm[sc.indexOf(desc ? Math.min(...sc) : Math.max(...sc))], ...r.sample(other, 3)], i => NAMES.filter(x => !nm.includes(x))[i - 1] || '오류 발생');
    return { q: '다음 코드의 실행 결과는?', code, o, e: `${desc ? '내림차순' : '오름차순'} 정렬 후 첫 행의 name입니다.`, py: HEAD + code, val: nm[idx], kind: 'str' };
  });
  PM(6, r => {
    const a = r.int(5, 30), b = r.int(2, 10), c = r.int(3, 8);
    const q = `열 이름과 열 개수(${c}개)가 같은 df1(${a}행)과 df2(${b}행)를 «pd.concat([df1, df2])»로 합친 결과의 shape는?`;
    const o = [`(${a + b}, ${c})`, `(${a}, ${c * 2})`, `(${a * b}, ${c})`, `(${a + b}, ${c * 2})`];
    return { q, o, e: '행 방향으로 이어 붙이므로 행 수만 더해지고 열 수는 그대로입니다.', py: `import pandas as pd\nimport numpy as np\ncols = [f'c{i}' for i in range(${c})]\ndf1 = pd.DataFrame(np.zeros((${a}, ${c})), columns=cols)\ndf2 = pd.DataFrame(np.zeros((${b}, ${c})), columns=cols)\npd.concat([df1, df2]).shape`, val: `(${a + b}, ${c})`, kind: 'tuple' };
  });
  PM(6, r => {
    const n = r.int(10, 30), c1 = r.int(4, 8), k = r.int(3, 5), c2 = r.int(2, 4);
    const q = `left는 ${n}행 ${c1}열, right는 ${k}행 ${c2}열이다. 두 데이터는 key 열을 하나씩 가지고 있고, left의 모든 key 값이 right에 한 번씩 있다. «pd.merge(left, right, how='left', on='key')»의 shape는?`;
    const o = [`(${n}, ${c1 + c2 - 1})`, `(${n}, ${c1 + c2})`, `(${n + k}, ${c1})`, `(${k}, ${c1 + c2 - 1})`];
    return { q, o, e: '행은 left 기준 그대로, 열은 key가 겹치므로 c1 + c2 - 1개입니다.', py: `import pandas as pd\nimport numpy as np\nkeys = list(range(${k}))\nleft = pd.DataFrame({'key': [keys[i % ${k}] for i in range(${n})], **{f'l{i}': range(${n}) for i in range(${c1 - 1})}})\nright = pd.DataFrame({'key': keys, **{f'r{i}': range(${k}) for i in range(${c2 - 1})}})\npd.merge(left, right, how='left', on='key').shape`, val: `(${n}, ${c1 + c2 - 1})`, kind: 'tuple' };
  });
  PM(5, r => {
    const n = r.int(5, 8), x = scores(r, n, 50, 100), idx = r.sample([...Array(n).keys()], r.int(1, 3)); idx.forEach(i => x[i] = null);
    const ans = n - idx.length;
    const code = dfCode([['score', x]]) + "\n\ndf['score'].describe()['count']";
    const o = fill4([pyF(ans), pyF(n), pyF(idx.length), pyF(ans - 1 > 0 ? ans - 1 : ans + 1)], i => pyF(n + i));
    return { q: '다음 코드의 실행 결과는?', code, o, e: 'describe()의 count는 결측치를 제외한 개수입니다.', py: HEAD + code, val: pyF(ans), kind: 'float' };
  });
  PM(7, r => {
    const vals = scores(r, 4, 40, 100); const rem = vals.reduce((s, v) => s + v, 0) % 4; vals[0] -= rem;
    const mean = vals.reduce((s, v) => s + v, 0) / 4;
    const arr = vals.slice(); arr.splice(r.int(0, 4), 0, null);
    const code = dfCode([['score', arr]]) + "\n\ndf['score'].mean()";
    const o = fill4([pyF(mean), pyF(mean * 4 / 5), 'nan', pyF(Math.max(...vals))], i => pyF(mean + i));
    return { q: '다음 코드의 실행 결과는?', code, o, e: '결측치는 제외하고 4개 값의 평균을 계산합니다.', py: HEAD + code, val: pyF(mean), kind: 'float' };
  });
  PM(7, r => {
    const n = r.int(6, 8), x = scores(r, n, 30, 100);
    const bad = r.sample([...Array(n).keys()], r.int(1, 3)); bad.forEach(i => x[i] = r.pick([-10, -1, 101, 120, 150]));
    const ans = bad.length;
    const code = dfCode([['score', x]]) + "\n\nlen(df.query('score < 0 or score > 100'))";
    return Object.assign({ q: '다음 코드의 실행 결과는?', code, e: '0 미만 또는 100 초과인 값의 개수입니다.', py: HEAD + code, val: String(ans) }, numOpts(r, ans));
  });
  PM(7, r => {
    const n = r.int(6, 8), x = scores(r, n, 10, 80);
    const idx = r.shuffle([...Array(n).keys()]); const k9 = r.int(1, 2), kn = r.int(0, 2);
    idx.slice(0, k9).forEach(i => x[i] = 999); idx.slice(k9, k9 + kn).forEach(i => x[i] = null);
    const ans = k9 + kn;
    const code = dfCode([['commute_min', x]]) + "\ndf['commute_min'] = df['commute_min'].replace(999, np.nan)\n\ndf['commute_min'].isna().sum()";
    return Object.assign({ q: '다음 코드의 실행 결과는?', code, e: `원래 결측치 ${kn}개 + 999에서 바뀐 ${k9}개`, py: HEAD + code, val: String(ans) }, numOpts(r, ans));
  });

  const POX = [];
  const PO = (ch, gen) => POX.push({ ch, gen });
  PO(7, r => {
    const lo = r.pick([0, 1, 10]), hi = lo + r.pick([4, 5, 90]), v = r.pick([lo, hi, lo - 1, hi + 1, Math.floor((lo + hi) / 2)]);
    const t = v >= lo && v <= hi;
    return { q: `x가 ${v}일 때 «x.between(${lo}, ${hi})»의 결과는 True이다.`, a: t, e: `between은 ${lo} 이상 ${hi} 이하일 때 True입니다.`, py: `import pandas as pd\nx = pd.Series([${v}])\nbool(x.between(${lo}, ${hi})[0])`, val: t ? 'True' : 'False', kind: 'bool' };
  });
  PO(7, r => {
    const q1 = r.int(2, 6) * 5, iqr = r.int(2, 6) * 2, q3 = q1 + iqr, up = q3 + 1.5 * iqr;
    const shown = r.chance(0.5) ? up : r.pick([q3 + iqr, q3 + 3 * iqr, q1 + 1.5 * iqr]);
    const t = shown === up;
    return { q: `Q1이 ${q1}, Q3가 ${q3}이면 IQR 기준 상한은 ${pyF(shown).replace(/\.0$/, '')}이다.`, a: t, e: `IQR = ${iqr}, 상한 = ${q3} + 1.5 × ${iqr} = ${pyF(up).replace(/\.0$/, '')}`, py: `${q3} + 1.5 * (${q3} - ${q1}) == ${shown}`, val: t ? 'True' : 'False', kind: 'bool' };
  });
  PO(6, r => {
    const a = r.int(5, 40), b = r.int(2, 15), c = r.chance(0.5) ? a + b : r.pick([a * b, Math.max(a, b), a + b + 1]);
    const t = c === a + b;
    return { q: `${a}행인 df1과 ${b}행인 df2(열 구성 동일)를 «pd.concat([df1, df2])»로 합치면 ${c}행이 된다.`, a: t, e: `행 방향으로 이어 붙이므로 ${a} + ${b} = ${a + b}행입니다.`, py: `${a} + ${b} == ${c}`, val: t ? 'True' : 'False', kind: 'bool' };
  });
  PO(5, r => {
    const rr = r.int(10, 300), cc = r.int(3, 15); let x = r.chance(0.5) ? cc : rr; if (rr === cc) x = cc;
    const t = x === cc;
    return { q: `«df.shape»의 결과가 «(${rr}, ${cc})»이면 df의 열 개수는 ${x}개이다.`, a: t, e: `(행, 열) 순서이므로 열은 ${cc}개입니다.`, py: `(${rr}, ${cc})[1] == ${x}`, val: t ? 'True' : 'False', kind: 'bool' };
  });
  PO(5, r => {
    const t0 = r.pick([60, 70, 80]), s = r.pick([t0, t0 - 1, t0 + 1, t0 + 5, t0 - 5]), strict = r.chance(0.35);
    const ok = strict ? s > t0 : s >= t0;
    return { q: `score가 ${s}일 때 «np.where(score ${strict ? '>' : '>='} ${t0}, 'pass', 'fail')»의 결과는 'pass'이다.`, a: ok, e: strict ? '>는 같은 값을 포함하지 않습니다.' : '>=는 같은 값을 포함합니다.', py: `import numpy as np\nstr(np.where(${s} ${strict ? '>' : '>='} ${t0}, 'pass', 'fail')) == 'pass'`, val: ok ? 'True' : 'False', kind: 'bool' };
  });
  PO(6, r => {
    const n = r.int(5, 7), sc = scores(r, n), t = r.pick(sc), ans = sc.filter(s => s >= t).length;
    const shown = r.chance(0.5) ? ans : r.pick([ans + 1, Math.max(0, ans - 1) === ans ? ans + 2 : ans - 1]);
    const code = HEAD + dfCode([['score', sc]]) + `\n\nlen(df.query('score >= ${t}'))`;
    return { q: `다음 코드의 실행 결과는 ${shown}이다.`, code: dfCode([['score', sc]]) + `\n\nlen(df.query('score >= ${t}'))`, a: shown === ans, e: `${t} 이상인 값은 ${ans}개입니다.`, py: code + ` == ${shown}`, val: shown === ans ? 'True' : 'False', kind: 'bool' };
  });
  PO(7, r => {
    const n = r.int(4, 6), a = scores(r, n, 1, 9), b = scores(r, n, 1, 9);
    r.sample([...Array(n).keys()], r.int(1, 2)).forEach(i => a[i] = null); r.sample([...Array(n).keys()], 1).forEach(i => b[i] = null);
    const ans = a.filter((v, i) => v !== null && b[i] !== null).length;
    const shown = r.chance(0.5) ? ans : r.pick([n, a.filter(v => v !== null).length, ans + 1].filter(v => v !== ans));
    const c = dfCode([['a', a], ['b', b]]) + '\n\nlen(df.dropna())';
    return { q: `다음 코드의 실행 결과는 ${shown}이다.`, code: c, a: shown === ans, e: `a, b 중 하나라도 결측치가 있는 행이 모두 제거되어 ${ans}행이 남습니다.`, py: HEAD + c + ` == ${shown}`, val: shown === ans ? 'True' : 'False', kind: 'bool' };
  });

  function genMC(seed, chs) {
    const r = QZ.mkR(seed);
    const pool = chs ? MC.filter(m => chs.includes(m.ch)) : MC;
    const ppool = chs ? PMC.filter(m => chs.includes(m.ch)) : PMC;
    let base;
    if (ppool.length && r.chance(0.3)) { const g = r.pick(ppool); base = g.gen(r); if (base) base.ch = g.ch; }
    if (!base) base = Object.assign({}, r.pick(pool));
    const order = r.shuffle(base.o.map((_, i) => i));
    return { type: 'mc', ch: base.ch, q: base.q, code: base.code || null, o: order.map(i => base.o[i]), a: order.indexOf(0), e: base.e || '', seed };
  }
  function genOX(seed, chs) {
    const r = QZ.mkR(seed);
    const pool = chs ? OX.filter(m => chs.includes(m.ch)) : OX;
    const ppool = chs ? POX.filter(m => chs.includes(m.ch)) : POX;
    let base;
    if (ppool.length && r.chance(0.25)) { const g = r.pick(ppool); base = g.gen(r); base.ch = g.ch; }
    else base = r.pick(pool);
    return { type: 'ox', ch: base.ch, q: base.q, code: base.code || null, a: base.a, e: base.e || '', seed };
  }

  Object.assign(QZ, { MC, OX, PMC, POX, genMC, genOX });
})(typeof window !== 'undefined' ? window : globalThis);

